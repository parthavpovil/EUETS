import type { FuelInput, CalculationResponse, VoyageType, CalculationTrace, FuelRowTrace } from "../types";
import {
  FUEL_CATALOG,
  GHG_TARGETS,
  TONS_TO_GRAMS,
  MJ_PER_MT_VLSFO,
  PENALTY_EUR_PER_MT_VLSFO,
  GWP,
} from "./constants";
import { resolveFuelName } from "./fuelParser";

interface FuelRow {
  original_name: string;
  resolved_name: string;
  mass_tonnes: number;
  mass_grams: number;
  lcv: number;
  wtt_ef: number;
  cf_co2: number;
  cf_ch4: number;
  cf_n2o: number;
  cslip: number;
  reward_factor: number;
  co2eq_ttw: number;
  co2eq_slip: number;
}

function prepareFuelRows(fuels: FuelInput[], year: number): FuelRow[] {
  return fuels.map((fuel) => {
    const resolved = resolveFuelName(fuel.fuel_type);
    const props = FUEL_CATALOG[resolved];
    const mass_grams = fuel.mass_tonnes * TONS_TO_GRAMS;
    const co2eq_ttw = props.cf_co2 * GWP.CO2 + props.cf_ch4 * GWP.CH4 + props.cf_n2o * GWP.N2O;
    const reward_factor = year < 2034 && props.nbo_or_bo === "NBO" ? 2.0 : 1.0;
    return {
      original_name: fuel.fuel_type,
      resolved_name: resolved,
      mass_tonnes: fuel.mass_tonnes,
      mass_grams,
      lcv: props.lcv,
      wtt_ef: props.wtt_ef,
      cf_co2: props.cf_co2,
      cf_ch4: props.cf_ch4,
      cf_n2o: props.cf_n2o,
      cslip: props.cslip,
      reward_factor,
      co2eq_ttw,
      co2eq_slip: 28.0,
    };
  });
}

function _calculate(
  fuels: FuelInput[],
  year: number,
  wind_reward_factor: number,
  eur_to_usd: number,
  voyage_type: VoyageType
): { response: CalculationResponse; trace: CalculationTrace } {
  const rows = prepareFuelRows(fuels, year);

  // Step 3: Energy
  const e_total_mj = rows.reduce((s, r) => s + r.mass_grams * r.lcv, 0);
  const e_total_rwd_mj = rows.reduce((s, r) => s + r.mass_grams * r.lcv * r.reward_factor, 0);
  if (e_total_rwd_mj === 0) throw new Error("Total energy is zero — no fuel input");

  // Per-fuel trace values
  const fuel_rows: FuelRowTrace[] = rows.map((r) => {
    const energy_mj = r.mass_grams * r.lcv;
    const energy_rwd_mj = energy_mj * r.reward_factor;
    const wtt_contribution = r.mass_grams * r.lcv * r.wtt_ef;
    const combustion = ((100 - r.cslip) / 100) * r.co2eq_ttw;
    const slip = (r.cslip / 100) * r.co2eq_slip;
    const ttw_contribution = r.mass_grams * (combustion + slip);
    return {
      original_name: r.original_name,
      resolved_name: r.resolved_name,
      mass_tonnes: r.mass_tonnes,
      mass_grams: r.mass_grams,
      lcv: r.lcv,
      wtt_ef: r.wtt_ef,
      cf_co2: r.cf_co2,
      cf_ch4: r.cf_ch4,
      cf_n2o: r.cf_n2o,
      cslip: r.cslip,
      co2eq_ttw: r.co2eq_ttw,
      reward_factor: r.reward_factor,
      energy_mj,
      energy_rwd_mj,
      wtt_contribution,
      ttw_contribution,
    };
  });

  // Step 4: WtT
  const wtt_numerator = fuel_rows.reduce((s, r) => s + r.wtt_contribution, 0);
  const ghg_wtt = wtt_numerator / e_total_rwd_mj;

  // Step 5: TtW
  const ttw_sum = fuel_rows.reduce((s, r) => s + r.ttw_contribution, 0);
  const ghg_ttw = ttw_sum / e_total_rwd_mj;

  // Step 6: WtW actual
  const ghg_actual = wind_reward_factor * (ghg_wtt + ghg_ttw);

  // Step 7: GHG target
  const ghg_target = GHG_TARGETS[year];
  if (ghg_target === undefined) throw new Error(`Year ${year} outside supported range 2025–2050`);

  // Step 8: Compliance
  const compliance_status = ghg_actual > ghg_target ? "Deficit" : "Surplus";
  const balance_gco2eq = Math.abs((ghg_target - ghg_actual) * e_total_mj);

  // Step 9: FEM penalty
  let fem_intra_eur = 0;
  if (compliance_status === "Deficit") {
    fem_intra_eur = (balance_gco2eq / (ghg_actual * MJ_PER_MT_VLSFO)) * PENALTY_EUR_PER_MT_VLSFO;
  }
  const fem_international_eur = fem_intra_eur * 0.5;
  const fem_applied_eur = voyage_type === "intra-EU" ? fem_intra_eur : fem_international_eur;
  const fem_applied_usd = fem_applied_eur * eur_to_usd;

  const response: CalculationResponse = {
    ghg_intensity: {
      wtt_gco2eq_per_mj: ghg_wtt,
      ttw_gco2eq_per_mj: ghg_ttw,
      wtw_actual_gco2eq_per_mj: ghg_actual,
      wtw_target_gco2eq_per_mj: ghg_target,
    },
    compliance: { status: compliance_status, balance_gco2eq },
    fem_penalty: {
      intra_eur: fem_intra_eur,
      international_eur: fem_international_eur,
      applied_eur: fem_applied_eur,
      applied_usd: fem_applied_usd,
    },
  };

  const trace: CalculationTrace = {
    year,
    voyage_type,
    wind_reward_factor,
    eur_to_usd,
    fuel_rows,
    e_total_mj,
    e_total_rwd_mj,
    wtt_numerator,
    ghg_wtt,
    ttw_sum,
    ghg_ttw,
    ghg_actual,
    ghg_target,
    compliance_status,
    balance_gco2eq,
    fem_intra_eur,
    fem_international_eur,
    fem_applied_eur,
    fem_applied_usd,
  };

  return { response, trace };
}

export function calculateFEMWithTrace(
  fuels: FuelInput[],
  year: number,
  wind_reward_factor: number,
  eur_to_usd: number,
  voyage_type: VoyageType
): { response: CalculationResponse; trace: CalculationTrace } {
  return _calculate(fuels, year, wind_reward_factor, eur_to_usd, voyage_type);
}
