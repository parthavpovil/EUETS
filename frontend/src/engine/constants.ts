export interface FuelProperties {
  lcv: number;
  wtt_ef: number;
  cf_co2: number;
  cf_ch4: number;
  cf_n2o: number;
  cslip: number;
  nbo_or_bo: string;
}

export const FUEL_CATALOG: Record<string, FuelProperties> = {
  "None": { lcv: 0, wtt_ef: 0, cf_co2: 0, cf_ch4: 0, cf_n2o: 0, cslip: 0, nbo_or_bo: "None" },
  "HFO":  { lcv: 0.0405, wtt_ef: 13.5, cf_co2: 3.114,  cf_ch4: 0.00005, cf_n2o: 0.00018, cslip: 0,   nbo_or_bo: "BO" },
  "LFO":  { lcv: 0.041,  wtt_ef: 13.2, cf_co2: 3.151,  cf_ch4: 0.00005, cf_n2o: 0.00018, cslip: 0,   nbo_or_bo: "BO" },
  "MGO":  { lcv: 0.0427, wtt_ef: 14.4, cf_co2: 3.206,  cf_ch4: 0.00005, cf_n2o: 0.00018, cslip: 0,   nbo_or_bo: "BO" },
  "LNG Otto (DF medium speed)": { lcv: 0.0491, wtt_ef: 18.5, cf_co2: 2.75, cf_ch4: 0, cf_n2o: 0.00011, cslip: 3.1, nbo_or_bo: "BO" },
  "LNG Otto (DF slow speed)":   { lcv: 0.0491, wtt_ef: 18.5, cf_co2: 2.75, cf_ch4: 0, cf_n2o: 0.00011, cslip: 1.7, nbo_or_bo: "BO" },
  "LNG Diesel (DF slow speed)": { lcv: 0.0491, wtt_ef: 18.5, cf_co2: 2.75, cf_ch4: 0, cf_n2o: 0.00011, cslip: 0.2, nbo_or_bo: "BO" },
  "LNG LBSI":                   { lcv: 0.0491, wtt_ef: 18.5, cf_co2: 2.75, cf_ch4: 0, cf_n2o: 0.00011, cslip: 2.6, nbo_or_bo: "BO" },
};

export const FUEL_ALIASES: Record<string, string> = {
  "HSFO":   "HFO",
  "VLSFO":  "HFO",
  "ULSFO":  "HFO",
  "IFO380": "HFO",
  "LSMGO":  "MGO",
  "ULSMGO": "MGO",
  "DMA":    "MGO",
  "DMX":    "MGO",
  "DMZ":    "MGO",
  "MDO":    "LFO",
  "DMB":    "LFO",
  "IFO180": "LFO",
};

export const GHG_TARGETS: Record<number, number> = {
  2025: 89.3368, 2026: 89.3368, 2027: 89.3368, 2028: 89.3368, 2029: 89.3368,
  2030: 85.6904, 2031: 85.6904, 2032: 85.6904, 2033: 85.6904, 2034: 85.6904,
  2035: 77.9418, 2036: 77.9418, 2037: 77.9418, 2038: 77.9418, 2039: 77.9418,
  2040: 62.9004, 2041: 62.9004, 2042: 62.9004, 2043: 62.9004, 2044: 62.9004,
  2045: 34.6408, 2046: 34.6408, 2047: 34.6408, 2048: 34.6408, 2049: 34.6408,
  2050: 18.232,
};


export const GWP = { CO2: 1, CH4: 28, N2O: 265 } as const;
export const TONS_TO_GRAMS = 1_000_000;
export const MJ_PER_MT_VLSFO = 41_000;
export const PENALTY_EUR_PER_MT_VLSFO = 2_400;
