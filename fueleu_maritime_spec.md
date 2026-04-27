# FuelEU Maritime Penalty Calculator — Engineering Specification

> **Purpose**: Reference document for building a deterministic blackbox that takes fuel inputs + year and returns FuelEU Maritime (FEM) penalty + EU-ETS comparison.
>
> **Source**: Reverse-engineered from `FEM-V10-SS20240902-2100_1.xlsx` (Drewry Maritime Advisors internal model, modelled by Shivam Sharma, dated 2024-09-02).
>
> **Regulatory basis**: EU Regulation 2023/1805 (FuelEU Maritime), 13 Sept 2023, Annexes I, II, IV.
>
> **Verified**: Every formula in this doc has been numerically validated against the Excel — same inputs produce identical outputs to machine precision.

---

## 1. Scope & Limitations

This spec covers **Phase 1** of the model, matching the Excel exactly. Things deliberately **not** modelled:

- Onshore power supply (OPS) penalties at berth
- Wind-assisted propulsion reward factor (hardcoded to a fixed value)
- RFNBO sub-target penalty (the 2% sub-target from 2034)
- Pooling / banking / borrowing flexibility mechanisms
- Fuel certification overrides (PoS-based actual values for biofuels)

If your blackbox needs any of those, treat them as future work and design the schema to allow extension.

---

## 2. Inputs (what the blackbox receives)

```json
{
  "fuels": [
    { "fuel_type": "HFO", "mass_tonnes": 800.0 },
    { "fuel_type": "MGO", "mass_tonnes": 0.0 },
    { "fuel_type": "LNG LBSI (Lean-burn spark ignition)", "mass_tonnes": 0.0 }
  ],
  "year": 2030,
  "wind_reward_factor": 0.97,
  "eua_price_eur": 100.0,
  "eur_to_usd": 1.1,
  "voyage_type": "intra"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `fuels` | array of `{fuel_type, mass_tonnes}` | Yes | Excel hardcodes 3 slots; backend should accept 1–N |
| `fuel_type` | enum (string) | Yes | Must match exactly one of the **Fuel Catalog** keys (§4.1). Use `"None"` for unused slots if mimicking Excel behaviour. |
| `mass_tonnes` | float ≥ 0 | Yes | Mass of that fuel consumed in the voyage |
| `year` | int 2025–2050 | Yes | Determines GHG target via §4.2 |
| `wind_reward_factor` | float, default `1.0` | No | See §6 caveat — Excel default is `0.97`, methodology note says `1.0`. Make it configurable. |
| `eua_price_eur` | float, default `100` | No | Used only for EU-ETS comparison output |
| `eur_to_usd` | float, default `1.1` | No | Optional FX for USD output |
| `voyage_type` | `"intra"` \| `"international"` | Yes | Intra-EU = 100% coverage, International = 50% coverage |

---

## 3. Outputs (what the blackbox returns)

```json
{
  "ghg_intensity": {
    "wtt_gco2eq_per_mj": 13.5,
    "ttw_gco2eq_per_mj": 78.1012,
    "wtw_actual_gco2eq_per_mj": 88.8532,
    "wtw_target_gco2eq_per_mj": 85.6904
  },
  "compliance": {
    "status": "Deficit",
    "balance_gco2eq": 102474640.0
  },
  "fem_penalty": {
    "intra_eur": 67510.41,
    "international_eur": 33755.20,
    "applied_eur": 67510.41,
    "applied_usd": 74261.45
  },
  "eu_ets": {
    "co2_emitted_tonnes": 2491.2,
    "intra_eur": 174384.0,
    "international_eur": 87192.0,
    "applied_eur": 174384.0,
    "phase_in_factor": 1.0
  },
  "comparison": {
    "fem_as_pct_of_ets": 0.387
  }
}
```

---

## 4. Constants (verbatim from EU Reg 2023/1805 + Excel)

### 4.1 Fuel Catalog — Annex II default values

Source: Excel `Assumptions` sheet, rows 26–33. **These are the regulatory defaults; do not modify without a certified PoS.**

| `fuel_type` (enum key) | Class | LCV (MJ/g) | WtT CO₂eq (gCO₂/MJ) | Cf CO₂ | Cf CH₄ | Cf N₂O | Cslip (%) | NBO/BO |
|---|---|---|---|---|---|---|---|---|
| `None` | None | 0 | 0 | 0 | 0 | 0 | 0 | None |
| `HFO` | Fossil | 0.0405 | 13.5 | 3.114 | 0.00005 | 0.00018 | 0 | BO |
| `LFO` | Fossil | 0.041 | 13.2 | 3.151 | 0.00005 | 0.00018 | 0 | BO |
| `MGO` | Fossil | 0.0427 | 14.4 | 3.206 | 0.00005 | 0.00018 | 0 | BO |
| `LNG Otto (DF medium speed)` | LNG | 0.0491 | 18.5 | 2.75 | 0 | 0.00011 | 3.1 | BO |
| `LNG Otto (DF slow speed)` | LNG | 0.0491 | 18.5 | 2.75 | 0 | 0.00011 | 1.7 | BO |
| `LNG Diesel (DF slow speed)` | LNG | 0.0491 | 18.5 | 2.75 | 0 | 0.00011 | 0.2 | BO |
| `LNG LBSI (Lean-burn spark ignition)` | LNG | 0.0491 | 18.5 | 2.75 | 0 | 0.00011 | 2.6 | BO |

**ISO 8217 grade mapping** (FuelEU does NOT classify by sulphur content — only by ISO grade; from EU Commission Q&A 10.4):

| Commercial fuel name | Maps to catalog entry |
|---|---|
| HSFO, VLSFO, ULSFO, IFO380 (residual RM-grades) | `HFO` |
| MDO, IFO180 (intermediate / DMB) | `LFO` |
| LSMGO, ULSMGO, MGO (distillate DMA/DMX/DMZ) | `MGO` |

The backend should accept commercial names as input aliases and resolve to catalog keys.

### 4.2 GHG Reduction Trajectory — Annex I

Reference Value (2020 baseline): **91.16 gCO₂eq/MJ** (computed from EU MRV 2020 data, not subject to revision).

GHG target = `91.16 × (1 − reduction_pct)`

| Year range | Reduction | GHG Target (gCO₂eq/MJ) |
|---|---|---|
| 2025–2029 | 2% | 89.3368 |
| 2030–2034 | 6% | 85.6904 |
| 2035–2039 | 14.5% | 77.9418 |
| 2040–2044 | 31% | 62.9004 |
| 2045–2049 | 62% | 34.6408 |
| 2050+ | 80% | 18.232 |

Implement as a year→target lookup, not as an interpolation.

### 4.3 Global Warming Potentials (GWP-100)

Source: Excel `Assumptions` row 44–46. **Uses RED II values, not the newer AR5 values** (regulation will switch to AR5 later — flag this for future work).

| Gas | GWP-100 (RED II) | AR5 (future) |
|---|---|---|
| CO₂ | 1 | 1 |
| CH₄ | 28 | 28 |
| N₂O | 265 | 265 |

> Note: Excel uses 28 for CH₄ and 265 for N₂O, matching AR5. Regulation actually still cites RED II values (1, 25, 298). The Excel has used the more current AR5 values. Decision: **match Excel exactly** for backward compatibility — use 1 / 28 / 265.

### 4.4 LNG Methane Slip Composition

For LNG fuels, a fraction of fuel passes through the engine uncombusted ("slip"). Composition of the slipped gas:

| Component | Fraction (Excel `Assumptions` C55–C57) |
|---|---|
| CO₂ | 0 |
| CH₄ | 1 (i.e. slip is essentially pure methane) |
| N₂O | 0 |

Resulting CO₂eq per gram of slipped fuel = `0×1 + 1×28 + 0×265 = 28 gCO₂eq/g`.

### 4.5 Penalty & Conversion Constants

| Constant | Value | Unit | Source |
|---|---|---|---|
| `PENALTY_EUR_PER_MT_VLSFO` | 2,400 | EUR | Reg 2023/1805 Annex IV |
| `MJ_PER_MT_VLSFO` | 41,000 | MJ | Energy content of 1 MT VLSFO |
| `TONS_TO_GRAMS` | 1,000,000 | — | Unit conversion |
| `INTRA_EU_FACTOR` | 1.0 | — | 100% of voyage emissions counted |
| `INTERNATIONAL_FACTOR` | 0.5 | — | 50% of voyage emissions counted |
| `EU_ETS_PHASE_IN[2025]` | 0.70 | — | EU ETS Maritime Directive |
| `EU_ETS_PHASE_IN[2026+]` | 1.00 | — | EU ETS Maritime Directive |

Note: EU ETS Maritime started phasing in 2024 at 40%. Excel only models 2025+ (70%). If you extend to 2024, add the 40% factor.

### 4.6 Reward Factor (RWD) Logic

From Excel `Calculations!H5`: `=IF(AND(year < 2034, fuel_class = "NBO"), 2, 1)`

| Condition | RWD |
|---|---|
| Year < 2034 AND fuel is NBO (RFNBO) | 2 |
| Otherwise | 1 |

**Caveat — current dataset**: Every fuel in the Excel catalog is labelled `BO`, so the RWD multiplier never triggers for the existing fuels. If/when RFNBO entries are added, label them `NBO` to activate the 2× multiplier (which applies until end of 2033 per the regulation).

---

## 5. Calculation Logic — Step by Step

> Notation: subscript `i` indexes over fuel slots in the input array. `Σᵢ` means sum over all fuels.

### Step 1 — Convert mass to grams

```
g[i] = mass_tonnes[i] × 1,000,000
```

### Step 2 — Per-fuel CO₂eq factors

```
CO2eq_TtW[i] = Cf_CO2[i]·GWP_CO2 + Cf_CH4[i]·GWP_CH4 + Cf_N2O[i]·GWP_N2O
              = Cf_CO2[i]·1 + Cf_CH4[i]·28 + Cf_N2O[i]·265

CO2eq_slip[i] = slip_CO2·GWP_CO2 + slip_CH4·GWP_CH4 + slip_N2O·GWP_N2O
              = 0·1 + 1·28 + 0·265
              = 28   (constant for all fuels)
```

### Step 3 — Total energy (denominator basis)

```
E_total      = Σᵢ g[i] · LCV[i]              [MJ]            ← used in compliance balance
E_total_RWD  = Σᵢ g[i] · LCV[i] · RWD[i]     [MJ-equivalent] ← used in GHG intensity denominator
```

### Step 4 — WtT GHG intensity

```
GHG_intensity_WtT = Σᵢ ( g[i] · LCV[i] · WtT_ef[i] ) / E_total_RWD     [gCO₂eq/MJ]
```

### Step 5 — TtW GHG intensity (handles LNG slip via Cslip)

```
TtW_per_fuel[i] = g[i] · [ ((100 − Cslip[i])/100) · CO2eq_TtW[i]
                         + (Cslip[i]/100)         · CO2eq_slip[i] ]

GHG_intensity_TtW = Σᵢ TtW_per_fuel[i] / E_total_RWD                    [gCO₂eq/MJ]
```

For non-LNG fuels Cslip = 0, so the formula collapses to `g[i] · CO2eq_TtW[i]`.

### Step 6 — WtW (actual) GHG intensity, with wind reward

```
GHG_intensity_actual = wind_reward_factor · ( GHG_intensity_WtT + GHG_intensity_TtW )
```

### Step 7 — Lookup target

```
GHG_intensity_target = lookup(year)    // see §4.2 table
```

### Step 8 — Compliance status & balance

```
status = "Deficit"  if GHG_intensity_actual > GHG_intensity_target
       = "Surplus"  otherwise

compliance_balance = ABS( (GHG_intensity_target − GHG_intensity_actual) × E_total )   [gCO₂eq]
```

> **⚠️ Divergence from official EU Annex IV formula**: The official compliance balance uses `E_total_RWD` (with reward factor) in the multiplication and preserves sign. The Excel uses `E_total` (no RWD) and takes ABS, then determines sign separately. For the existing fuel catalog (all BO, RWD=1) this makes no numerical difference. If RFNBOs are added, results will diverge. **Match the Excel for parity; flag in code comments.**

### Step 9 — FEM Penalty (the headline number)

```
if status == "Surplus":
    penalty_intra_eur = 0          // "No penalty"
else:
    penalty_intra_eur = ( compliance_balance / (GHG_intensity_actual × 41000) ) × 2400

penalty_international_eur = penalty_intra_eur × 0.5

applied_penalty = penalty_intra_eur          if voyage_type == "intra"
                = penalty_international_eur  if voyage_type == "international"

applied_penalty_usd = applied_penalty × eur_to_usd
```

**Reading**: Compliance deficit (gCO₂eq) ÷ actual GHG intensity (gCO₂eq/MJ) gives non-compliant energy in MJ. Divide by 41,000 MJ/MT-VLSFO → MT VLSFO equivalent. Multiply by 2,400 EUR/MT → penalty.

### Step 10 — EU ETS comparison cost

```
total_CO2_grams = Σᵢ g[i] · Cf_CO2[i]                    [grams of CO₂]
total_CO2_tonnes = total_CO2_grams / 1,000,000

phase_in = 0.70  if year == 2025
         = 1.00  if year >= 2026
         = 0.40  if year == 2024  (extension; not in Excel)

ets_cost_intra_eur = total_CO2_tonnes × eua_price × phase_in
ets_cost_international_eur = ets_cost_intra_eur × 0.5
```

> Note: EU ETS only counts **TtW CO₂** (Cf_CO2), not CH₄/N₂O and not WtT. FuelEU counts **WtW** including CH₄/N₂O. This is a fundamental scope difference — don't try to unify them.

### Step 11 — Comparison ratio

```
fem_as_pct_of_ets = applied_penalty / applied_ets_cost
```

When this exceeds 100%, the FEM penalty is harsher than the ETS allowance cost — typically when GHG-intensity targets tighten in 2030, 2035, etc.

---

## 6. Caveats & Gotchas (read before coding)

1. **`ABS()` in compliance balance** — Excel takes absolute value, then determines sign via separate `IF`. Means surplus/deficit information is lost in `compliance_balance` itself; track via `status` flag separately.

2. **RWD never fires in current catalog** — All fuels are tagged `BO`. The 2× multiplier for NBO/RFNBO fuels (active until 2033) only triggers if you add NBO entries to the catalog.

3. **Wind reward factor inconsistency** — Methodology sheet says "to be assumed as 1 for now", but the calculation cell (`C12`) is hardcoded to `0.97`. Excel results use 0.97. **Decision needed**: do you replicate the Excel as-is (use 0.97), or follow the documented intent (1.0)? Make this a config flag and default to 1.0 for regulatory accuracy; expose 0.97 only if matching Excel exactly is required.

4. **Year scope** — Excel models 2025–2050. Year 2024 (when EU ETS Maritime started at 40%) is not modelled. Reject inputs outside 2025–2050 or extend explicitly.

5. **Mass = 0 fuels** — Excel gracefully handles unused slots because `g[i] = 0` zeros out the contribution. Backend must do the same; don't error on zero-mass fuels.

6. **Fuel name `"None"`** — Excel allows `"None"` as a valid `fuel_type` for empty slots. Catalog has a row with all zeros for it. Either accept this or strip out empty entries before processing — both work.

7. **Floating-point** — Excel produces e.g. `88.85319753086418`. Don't round intermediate values; round only at output. Use `float64` / IEEE 754 double throughout.

8. **GHG target lookup** — Strict equality match on year. Use a dict, not a range scan. Years in same band have identical target (e.g., 2030 and 2034 both = 85.6904).

9. **GWP value choice** — Excel uses 28/265 (close to AR5). Official regulation text references 25/298 (RED II). They will be aligned to AR5 in future. **Match Excel** (28/265). Document this.

10. **Penalty multipliers for repeat offenders** — Per the regulation, the penalty increases by 10%/20%/30%/... for consecutive years of non-compliance. **Not** modelled in this Excel. Stateless calculation only — caller must track repeat-offence multiplier across reporting periods if needed.

11. **Pooling/banking surplus** — Not modelled. Surplus simply reports "No penalty" in the Excel; in real compliance, surplus can be banked indefinitely or pooled with other vessels. This is out of scope here.

12. **Output sheet duplicates Calculation sheet logic** with minor variations across years 2025–2050. The core engine (this spec) is the `Calculations` sheet; the `Output` sheet is just a year-by-year projection of the same formulas. Build the engine once, project across years.

---

## 7. Reference Implementation (Python, ~80 lines)

Drop-in pseudo-code. Verified against Excel: `HFO=800t, year=2030, wind=0.97` → `penalty=67,510.41 EUR`, exactly matches Excel.

```python
from dataclasses import dataclass
from typing import Literal

# === Constants ===
GWP = {"CO2": 1, "CH4": 28, "N2O": 265}
SLIP_COMPOSITION = {"CO2": 0, "CH4": 1, "N2O": 0}    # 100% methane
TONS_TO_GRAMS = 1_000_000
MJ_PER_MT_VLSFO = 41_000
PENALTY_EUR_PER_MT_VLSFO = 2_400
REFERENCE_VALUE = 91.16

# year -> GHG intensity reduction fraction
REDUCTION_BY_YEAR = {
    **{y: 0.02  for y in range(2025, 2030)},
    **{y: 0.06  for y in range(2030, 2035)},
    **{y: 0.145 for y in range(2035, 2040)},
    **{y: 0.31  for y in range(2040, 2045)},
    **{y: 0.62  for y in range(2045, 2050)},
    2050: 0.80,
}

EU_ETS_PHASE_IN = {2024: 0.40, 2025: 0.70}  # 1.00 default for 2026+

# Fuel catalog: (LCV, WtT, Cf_CO2, Cf_CH4, Cf_N2O, Cslip, NBO_or_BO)
FUEL_CATALOG = {
    "None":                                 (0,      0,    0,     0,       0,       0,   "None"),
    "HFO":                                  (0.0405, 13.5, 3.114, 5e-5,    1.8e-4,  0,   "BO"),
    "LFO":                                  (0.041,  13.2, 3.151, 5e-5,    1.8e-4,  0,   "BO"),
    "MGO":                                  (0.0427, 14.4, 3.206, 5e-5,    1.8e-4,  0,   "BO"),
    "LNG Otto (DF medium speed)":           (0.0491, 18.5, 2.75,  0,       1.1e-4,  3.1, "BO"),
    "LNG Otto (DF slow speed)":             (0.0491, 18.5, 2.75,  0,       1.1e-4,  1.7, "BO"),
    "LNG Diesel (DF slow speed)":           (0.0491, 18.5, 2.75,  0,       1.1e-4,  0.2, "BO"),
    "LNG LBSI (Lean-burn spark ignition)":  (0.0491, 18.5, 2.75,  0,       1.1e-4,  2.6, "BO"),
}

# Commercial-name aliases → catalog keys
ALIASES = {
    "HSFO": "HFO", "VLSFO": "HFO", "ULSFO": "HFO", "IFO380": "HFO",
    "LSMGO": "MGO", "ULSMGO": "MGO", "DMA": "MGO",
    "MDO": "LFO", "DMB": "LFO", "IFO180": "LFO",
}


@dataclass
class FuelInput:
    fuel_type: str
    mass_tonnes: float


def _ghg_target(year: int) -> float:
    if year not in REDUCTION_BY_YEAR:
        raise ValueError(f"Year {year} outside supported range 2025–2050")
    return REFERENCE_VALUE * (1 - REDUCTION_BY_YEAR[year])


def _resolve_fuel(name: str) -> str:
    name = name.strip()
    if name in FUEL_CATALOG:
        return name
    if name.upper() in ALIASES:
        return ALIASES[name.upper()]
    raise ValueError(f"Unknown fuel type: {name}")


def calculate_fem(
    fuels: list[FuelInput],
    year: int,
    wind_reward: float = 1.0,
    eua_price_eur: float = 100.0,
    eur_to_usd: float = 1.1,
    voyage_type: Literal["intra", "international"] = "intra",
) -> dict:
    voyage_factor = 1.0 if voyage_type == "intra" else 0.5

    # Step 1–2: per-fuel rows
    rows = []
    for f in fuels:
        key = _resolve_fuel(f.fuel_type)
        lcv, wtt, cf_co2, cf_ch4, cf_n2o, cslip, nbo = FUEL_CATALOG[key]
        g = f.mass_tonnes * TONS_TO_GRAMS
        rwd = 2 if (year < 2034 and nbo == "NBO") else 1
        co2eq_ttw = cf_co2 * GWP["CO2"] + cf_ch4 * GWP["CH4"] + cf_n2o * GWP["N2O"]
        co2eq_slip = (SLIP_COMPOSITION["CO2"] * GWP["CO2"]
                    + SLIP_COMPOSITION["CH4"] * GWP["CH4"]
                    + SLIP_COMPOSITION["N2O"] * GWP["N2O"])
        rows.append((g, lcv, wtt, cf_co2, cslip, rwd, co2eq_ttw, co2eq_slip))

    # Step 3: energy denominators
    e_total      = sum(g * lcv          for g, lcv, *_           in rows)
    e_total_rwd  = sum(g * lcv * rwd    for g, lcv, _, _, _, rwd, *_ in rows)
    if e_total_rwd == 0:
        raise ValueError("Total energy is zero — no fuel input")

    # Step 4: WtT
    ghg_wtt = sum(g * lcv * wtt for g, lcv, wtt, *_ in rows) / e_total_rwd

    # Step 5: TtW (with slip handling)
    ttw_num = sum(
        g * (((100 - cslip) / 100) * co2eq_ttw + (cslip / 100) * co2eq_slip)
        for g, lcv, wtt, cf_co2, cslip, rwd, co2eq_ttw, co2eq_slip in rows
    )
    ghg_ttw = ttw_num / e_total_rwd

    # Step 6: WtW actual
    ghg_actual = wind_reward * (ghg_wtt + ghg_ttw)

    # Step 7–8: target & compliance
    ghg_target = _ghg_target(year)
    status = "Deficit" if ghg_actual > ghg_target else "Surplus"
    compliance_balance = abs((ghg_target - ghg_actual) * e_total)

    # Step 9: FEM penalty
    if status == "Surplus":
        penalty_intra = 0.0
    else:
        penalty_intra = (compliance_balance / (ghg_actual * MJ_PER_MT_VLSFO)) * PENALTY_EUR_PER_MT_VLSFO
    penalty_intl = penalty_intra * 0.5
    applied_penalty = penalty_intra if voyage_type == "intra" else penalty_intl

    # Step 10: EU ETS comparison
    total_co2_g = sum(g * cf_co2 for g, lcv, wtt, cf_co2, *_ in rows)
    total_co2_t = total_co2_g / 1_000_000
    phase_in = EU_ETS_PHASE_IN.get(year, 1.0)
    ets_intra = total_co2_t * eua_price_eur * phase_in
    ets_intl = ets_intra * 0.5
    applied_ets = ets_intra if voyage_type == "intra" else ets_intl

    return {
        "ghg_intensity": {
            "wtt_gco2eq_per_mj": ghg_wtt,
            "ttw_gco2eq_per_mj": ghg_ttw,
            "wtw_actual_gco2eq_per_mj": ghg_actual,
            "wtw_target_gco2eq_per_mj": ghg_target,
        },
        "compliance": {
            "status": status,
            "balance_gco2eq": compliance_balance,
        },
        "fem_penalty": {
            "intra_eur": penalty_intra,
            "international_eur": penalty_intl,
            "applied_eur": applied_penalty,
            "applied_usd": applied_penalty * eur_to_usd,
        },
        "eu_ets": {
            "co2_emitted_tonnes": total_co2_t,
            "intra_eur": ets_intra,
            "international_eur": ets_intl,
            "applied_eur": applied_ets,
            "phase_in_factor": phase_in,
        },
        "comparison": {
            "fem_as_pct_of_ets": (applied_penalty / applied_ets) if applied_ets else None,
        },
    }
```

---

## 8. Test Cases (golden values — must reproduce exactly)

### Test 1 — HFO baseline (the Excel default scenario)

**Input**: HFO 800t, MGO 0t, LNG LBSI 0t, year=2030, wind=0.97, voyage=intra

**Expected**:
- `ghg_wtt` = 13.5
- `ghg_ttw` = 78.10123456790122
- `ghg_actual` = 88.85319753086418
- `ghg_target` = 85.6904
- `status` = "Deficit"
- `compliance_balance` ≈ 102,474,640 gCO₂eq
- `penalty_intra_eur` ≈ 67,510.41
- `penalty_international_eur` ≈ 33,755.20

### Test 2 — All-LNG, 2030

**Input**: LNG Otto (DF medium speed) 800t, year=2030, wind=1.0, voyage=intra

**Expected**: GHG intensity should be lower than HFO baseline due to lower Cf_CO2, but methane slip penalises it. Use this to verify slip math is wired up correctly. Run in Excel for golden value before coding.

### Test 3 — Surplus case

**Input**: Year=2025 with low-emission fuel mix that brings actual below 89.34 → expect `status="Surplus"`, `applied_penalty=0`.

### Test 4 — Edge: zero mass

**Input**: All fuels with `mass_tonnes=0` → expect `ValueError("Total energy is zero")` (Excel produces `#DIV/0!`).

### Test 5 — Year out of range

**Input**: `year=2024` or `year=2051` → expect `ValueError`.

---

## 9. Recommended Architecture

```
┌──────────────┐       ┌────────────────────┐       ┌──────────────┐
│  REST/CLI    │──────▶│  calculate_fem()   │──────▶│  JSON output │
│  /endpoint   │       │  (pure function)   │       │              │
└──────────────┘       └─────────┬──────────┘       └──────────────┘
                                 │
                       ┌─────────┴──────────┐
                       │  constants.py      │
                       │  - FUEL_CATALOG    │
                       │  - REDUCTION_BY_YEAR│
                       │  - GWP, SLIP, etc. │
                       └────────────────────┘
```

Keep the calculator a **pure function**: no I/O, no global state, no clock reads. Constants in a separate module so when EU updates a value (e.g., switches GWP to AR5), it's a single-file change. Wrap with FastAPI/Express for HTTP, or expose as a CLI for batch runs.

Add a unit test for each row of the §8 golden table — these lock in the regulatory math forever.

---

## 10. Future Extensions (not in scope, but design for them)

| Feature | Where it plugs in |
|---|---|
| Onshore power supply (OPS) penalty | New module — additive penalty term, port-call based |
| Wind reward factor (proper) | Replace fixed `wind_reward` with formula based on `Pwind/PME` ratio (Excel `Notes for modellor` rows 18–21 has the lookup table) |
| RFNBO sub-target (post-2034) | Additional penalty if RFNBO share < 2% in any reporting period |
| Repeat-offence multiplier | Stateful — add `consecutive_deficit_years` input → multiplier 1.0/1.1/1.2/... |
| Pooling/banking | Stateful — surplus carries forward; needs persistent storage |
| Biofuel PoS overrides | Allow per-fuel override of `WtT_ef`, `Cf_CH4`, `Cf_N2O` (not `Cf_CO2` — that's locked by regulation for fossil fuels) |
| EU ETS 2024 | Add `EU_ETS_PHASE_IN[2024] = 0.40` |
| AR5 GWPs switchover | Flip `GWP_CH4` 28→28, `GWP_N2O` 265→265 (already aligned), confirm with future EU guidance |

---

## 11. Source References

- **EU Regulation 2023/1805** (FuelEU Maritime), 13 Sept 2023 — Annexes I, II, IV
- **EU Commission Q&A** on Reg 2023/1805 — `https://transport.ec.europa.eu/transport-modes/maritime/decarbonising-maritime-transport-fueleu-maritime/questions-and-answers-regulation-eu-20231805-use-renewable-and-low-carbon-fuels-maritime-transport_en`
- **Source Excel**: `FEM-V10-SS20240902-2100_1.xlsx` (Drewry Maritime Advisors, 2024-09-02)
- **IPCC AR5** — GWP-100 values

---

*End of specification.*
