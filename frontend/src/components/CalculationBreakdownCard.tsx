import React, { useState } from "react";
import type { CalculationTrace } from "../types";

interface Props {
  trace: CalculationTrace;
}

// ─── formatting helpers ───────────────────────────────────────────────────────

const n = (v: number, dp = 4) => v.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
const n6 = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const big = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 0 });
const sci = (v: number) =>
  v >= 1e9 ? `${(v / 1e9).toFixed(4)} × 10⁹` : v >= 1e6 ? `${(v / 1e6).toFixed(4)} × 10⁶` : big(v);
const eur = (v: number) => `€ ${n6(v)}`;
const usd = (v: number) => `$ ${n6(v)}`;

// ─── sub-components ───────────────────────────────────────────────────────────

const StepHeader: React.FC<{ num: string; title: string }> = ({ num, title }) => (
  <div className="flex items-center gap-3 mb-3">
    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center">
      {num}
    </span>
    <h3 className="font-semibold text-neutral-800 text-base">{title}</h3>
  </div>
);

const Formula: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-neutral-100 border border-neutral-200 rounded px-3 py-2 font-mono text-xs text-neutral-700 mb-3">
    {children}
  </div>
);

const Row: React.FC<{ label: string; value: string; sub?: string; highlight?: boolean }> = ({
  label, value, sub, highlight,
}) => (
  <div className={`flex justify-between items-start py-1.5 border-b border-neutral-100 last:border-0 ${highlight ? "bg-amber-50 -mx-3 px-3 rounded" : ""}`}>
    <span className="text-sm text-neutral-600 flex-1">{label}</span>
    <div className="text-right ml-4">
      <span className={`text-sm font-medium ${highlight ? "text-amber-700" : "text-neutral-800"}`}>{value}</span>
      {sub && <div className="text-xs text-neutral-400">{sub}</div>}
    </div>
  </div>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white border border-neutral-200 rounded-lg p-4 ${className}`}>{children}</div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
    status === "Deficit" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
  }`}>
    {status}
  </span>
);

// ─── main component ───────────────────────────────────────────────────────────

export const CalculationBreakdownCard: React.FC<Props> = ({ trace }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
      {/* collapsible header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-neutral-800 text-white px-5 py-4 hover:bg-neutral-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold">Step-by-Step Calculation Breakdown</span>
          <span className="text-xs bg-neutral-600 px-2 py-0.5 rounded-full">EU Reg 2023/1805</span>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="bg-neutral-50 p-5 space-y-6">

          {/* ── INPUTS ── */}
          <Card>
            <h3 className="font-semibold text-neutral-800 mb-3 text-base">Calculation Inputs</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Year", trace.year.toString()],
                ["Voyage type", trace.voyage_type],
                ["Wind factor", trace.wind_reward_factor.toString()],
                ["EUR/USD rate", trace.eur_to_usd.toString()],
              ].map(([label, value]) => (
                <div key={label} className="bg-neutral-100 rounded-lg p-3 text-center">
                  <div className="text-xs text-neutral-500 mb-1">{label}</div>
                  <div className="font-semibold text-neutral-800 text-sm">{value}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── STEP 1 & 2: Fuel preparation ── */}
          <Card>
            <StepHeader num="1–2" title="Fuel Preparation — Mass Conversion & CO₂eq Factors" />
            <Formula>
              mass_g = mass_t × 1,000,000 &nbsp;|&nbsp;
              CO₂eq_TtW = Cf_CO₂ × 1 + Cf_CH₄ × 28 + Cf_N₂O × 265 &nbsp;|&nbsp;
              reward = 2 if (year &lt; 2034 AND NBO fuel), else 1
            </Formula>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-600">
                    {["Fuel", "Mass (t)", "Mass (g)", "LCV (MJ/g)", "WtT ef", "Cf_CO₂", "Cf_CH₄", "Cf_N₂O", "Cslip (%)", "CO₂eq_TtW", "Reward", "Energy (MJ)", "Energy_RWD (MJ)"].map((h) => (
                      <th key={h} className="text-left px-2 py-2 font-medium border-b border-neutral-200 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trace.fuel_rows.map((r, i) => (
                    <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-2 py-2 font-medium text-primary-700 whitespace-nowrap">{r.resolved_name}</td>
                      <td className="px-2 py-2">{r.mass_tonnes.toLocaleString()}</td>
                      <td className="px-2 py-2">{sci(r.mass_grams)}</td>
                      <td className="px-2 py-2">{r.lcv}</td>
                      <td className="px-2 py-2">{r.wtt_ef}</td>
                      <td className="px-2 py-2">{r.cf_co2}</td>
                      <td className="px-2 py-2">{r.cf_ch4}</td>
                      <td className="px-2 py-2">{r.cf_n2o}</td>
                      <td className="px-2 py-2">{r.cslip}</td>
                      <td className="px-2 py-2 font-medium">{n(r.co2eq_ttw)}</td>
                      <td className="px-2 py-2">{r.reward_factor}×</td>
                      <td className="px-2 py-2">{sci(r.energy_mj)}</td>
                      <td className="px-2 py-2">{sci(r.energy_rwd_mj)}</td>
                    </tr>
                  ))}
                  {/* totals row */}
                  <tr className="bg-neutral-100 font-semibold text-neutral-700">
                    <td className="px-2 py-2" colSpan={11}>Total</td>
                    <td className="px-2 py-2">{sci(trace.e_total_mj)}</td>
                    <td className="px-2 py-2">{sci(trace.e_total_rwd_mj)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* ── STEP 3: Energy ── */}
          <Card>
            <StepHeader num="3" title="Total Energy Calculation" />
            <Formula>
              E_total = Σ(mass_g × LCV) &nbsp;|&nbsp;
              E_total_RWD = Σ(mass_g × LCV × reward_factor)
            </Formula>
            <Row label="E_total" value={`${sci(trace.e_total_mj)} MJ`} />
            <Row label="E_total_RWD (reward-adjusted)" value={`${sci(trace.e_total_rwd_mj)} MJ`} />
          </Card>

          {/* ── STEP 4: WtT ── */}
          <Card>
            <StepHeader num="4" title="Well-to-Tank (WtT) GHG Intensity" />
            <Formula>GHG_WtT = Σ(mass_g × LCV × WtT_ef) / E_total_RWD</Formula>
            <div className="space-y-1">
              {trace.fuel_rows.map((r, i) => (
                <Row
                  key={i}
                  label={`${r.resolved_name}  →  ${sci(r.mass_grams)} × ${r.lcv} × ${r.wtt_ef}`}
                  value={`${sci(r.wtt_contribution)} gCO₂eq`}
                />
              ))}
              <Row label="WtT numerator (sum)" value={`${sci(trace.wtt_numerator)} gCO₂eq`} />
              <Row
                label={`GHG_WtT = ${sci(trace.wtt_numerator)} / ${sci(trace.e_total_rwd_mj)}`}
                value={`${n(trace.ghg_wtt)} gCO₂eq/MJ`}
                highlight
              />
            </div>
          </Card>

          {/* ── STEP 5: TtW ── */}
          <Card>
            <StepHeader num="5" title="Tank-to-Wheel (TtW) GHG Intensity (with methane slip)" />
            <Formula>
              TtW_i = mass_g × [((100 − Cslip) / 100 × CO₂eq_TtW) + (Cslip / 100 × 28)] &nbsp;|&nbsp;
              GHG_TtW = Σ(TtW_i) / E_total_RWD
            </Formula>
            <div className="space-y-1">
              {trace.fuel_rows.map((r, i) => {
                const comb = ((100 - r.cslip) / 100);
                const slip = (r.cslip / 100);
                return (
                  <Row
                    key={i}
                    label={`${r.resolved_name}  →  mass × [(${comb.toFixed(4)} × ${n(r.co2eq_ttw)}) + (${slip.toFixed(4)} × 28)]`}
                    value={`${sci(r.ttw_contribution)} gCO₂eq`}
                  />
                );
              })}
              <Row label="TtW sum" value={`${sci(trace.ttw_sum)} gCO₂eq`} />
              <Row
                label={`GHG_TtW = ${sci(trace.ttw_sum)} / ${sci(trace.e_total_rwd_mj)}`}
                value={`${n(trace.ghg_ttw)} gCO₂eq/MJ`}
                highlight
              />
            </div>
          </Card>

          {/* ── STEP 6: WtW ── */}
          <Card>
            <StepHeader num="6" title="Well-to-Wheel (WtW) Actual GHG Intensity" />
            <Formula>GHG_WtW = wind_reward_factor × (GHG_WtT + GHG_TtW)</Formula>
            <Row label="GHG_WtT" value={`${n(trace.ghg_wtt)} gCO₂eq/MJ`} />
            <Row label="GHG_TtW" value={`${n(trace.ghg_ttw)} gCO₂eq/MJ`} />
            <Row label="WtT + TtW" value={`${n(trace.ghg_wtt + trace.ghg_ttw)} gCO₂eq/MJ`} />
            <Row label={`Wind reward factor`} value={`× ${trace.wind_reward_factor}`} />
            <Row
              label={`GHG_WtW = ${trace.wind_reward_factor} × (${n(trace.ghg_wtt)} + ${n(trace.ghg_ttw)})`}
              value={`${n(trace.ghg_actual)} gCO₂eq/MJ`}
              highlight
            />
          </Card>

          {/* ── STEP 7: Target ── */}
          <Card>
            <StepHeader num="7" title="GHG Target Lookup" />
            <Formula>GHG_target = regulatory table[year]</Formula>
            <Row label={`Year ${trace.year} → target from EU Reg 2023/1805 Annex`} value={`${n(trace.ghg_target)} gCO₂eq/MJ`} highlight />
          </Card>

          {/* ── STEP 8: Compliance ── */}
          <Card>
            <StepHeader num="8" title="Compliance Status & Balance" />
            <Formula>
              status = "Deficit" if GHG_actual &gt; GHG_target, else "Surplus" &nbsp;|&nbsp;
              balance = |GHG_target − GHG_actual| × E_total
            </Formula>
            <Row label="GHG actual" value={`${n(trace.ghg_actual)} gCO₂eq/MJ`} />
            <Row label="GHG target" value={`${n(trace.ghg_target)} gCO₂eq/MJ`} />
            <Row label="Δ (actual − target)" value={`${n(trace.ghg_actual - trace.ghg_target)} gCO₂eq/MJ`} />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-neutral-600">Compliance status</span>
              <StatusBadge status={trace.compliance_status} />
            </div>
            <Row
              label={`Balance = |${n(trace.ghg_target)} − ${n(trace.ghg_actual)}| × ${sci(trace.e_total_mj)}`}
              value={`${sci(trace.balance_gco2eq)} gCO₂eq`}
              highlight
            />
          </Card>

          {/* ── STEP 9: FEM Penalty ── */}
          <Card>
            <StepHeader num="9" title="FuelEU Maritime (FEM) Penalty" />
            <Formula>
              {trace.compliance_status === "Deficit"
                ? "penalty_intra = (balance / (GHG_actual × 41,000)) × 2,400  |  penalty_intl = intra × 0.5"
                : "Status: Surplus → penalty = € 0"}
            </Formula>
            {trace.compliance_status === "Deficit" ? (
              <>
                <Row
                  label={`Intra-EU = (${sci(trace.balance_gco2eq)} / (${n(trace.ghg_actual)} × 41,000)) × 2,400`}
                  value={eur(trace.fem_intra_eur)}
                />
                <Row label="International (intra × 0.5)" value={eur(trace.fem_international_eur)} />
                <Row
                  label={`Applied (${trace.voyage_type} voyage)`}
                  value={`${eur(trace.fem_applied_eur)} = ${usd(trace.fem_applied_usd)}`}
                  highlight
                />
              </>
            ) : (
              <Row label="No penalty (Surplus)" value="€ 0" />
            )}
          </Card>


        </div>
      )}
    </div>
  );
};
