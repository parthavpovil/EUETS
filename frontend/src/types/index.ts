/**
 * TypeScript type definitions for FuelEU Maritime Calculator API
 * 
 * These types match the backend Pydantic models in backend/src/api/models.py exactly.
 * Any changes to backend models should be reflected here.
 */

// ============================================================================
// Request Types
// ============================================================================

/**
 * Fuel input for calculation request
 */
export interface FuelInput {
  /** Fuel type name (e.g., HFO, LFO, MGO, LNG Otto, VLSFO, LSMGO) */
  fuel_type: string;
  /** Fuel mass in metric tonnes (must be >= 0) */
  mass_tonnes: number;
}

/**
 * Voyage type classification
 */
export type VoyageType = "intra-EU" | "international";

/**
 * Complete calculation request payload
 */
export interface CalculationRequest {
  /** List of fuel inputs (at least one required) */
  fuels: FuelInput[];
  /** Voyage year (2025-2050) */
  year: number;
  /** Voyage type: 'intra-EU' (100% coverage) or 'international' (50% coverage) */
  voyage_type: VoyageType;
  /** Wind assistance reward factor (0-1.0, default 1.0) */
  wind_reward_factor?: number;
  /** EUR to USD exchange rate (> 0, default 1.1) */
  eur_to_usd?: number;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * GHG intensity metrics response
 */
export interface GHGIntensityResponse {
  /** Well-to-Tank GHG intensity in gCO₂eq/MJ (upstream emissions) */
  wtt_gco2eq_per_mj: number;
  /** Tank-to-Wheel GHG intensity in gCO₂eq/MJ (combustion emissions) */
  ttw_gco2eq_per_mj: number;
  /** Well-to-Wheel actual GHG intensity in gCO₂eq/MJ (total lifecycle) */
  wtw_actual_gco2eq_per_mj: number;
  /** Well-to-Wheel target GHG intensity in gCO₂eq/MJ (regulatory target) */
  wtw_target_gco2eq_per_mj: number;
}

/**
 * Compliance status classification
 */
export type ComplianceStatus = "Surplus" | "Deficit";

/**
 * Compliance status response
 */
export interface ComplianceStatusResponse {
  /** Compliance status: 'Surplus' or 'Deficit' */
  status: ComplianceStatus;
  /** Compliance balance in gCO₂eq */
  balance_gco2eq: number;
}

/**
 * FuelEU Maritime penalty response
 */
export interface FEMPenaltyResponse {
  /** Penalty for intra-EU voyages in EUR */
  intra_eur: number;
  /** Penalty for international voyages in EUR (50% of intra-EU) */
  international_eur: number;
  /** Penalty applied based on voyage type in EUR */
  applied_eur: number;
  /** Penalty applied based on voyage type in USD */
  applied_usd: number;
}

/**
 * Complete calculation response
 */
export interface CalculationResponse {
  /** GHG intensity metrics (WtT, TtW, WtW) */
  ghg_intensity: GHGIntensityResponse;
  /** Compliance status and balance */
  compliance: ComplianceStatusResponse;
  /** FuelEU Maritime penalty calculations */
  fem_penalty: FEMPenaltyResponse;
}

// ============================================================================
// Error Response Types
// ============================================================================

/**
 * Single validation error
 */
export interface ValidationError {
  /** Field name that failed validation */
  field: string;
  /** Validation error message */
  message: string;
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse {
  /** Error type */
  error: string;
  /** List of validation errors */
  details: ValidationError[];
}

/**
 * General error response
 */
export interface ErrorResponse {
  /** Error type */
  error: string;
  /** Error message */
  message: string;
}

// ============================================================================
// Calculation Trace Types
// ============================================================================

export interface FuelRowTrace {
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
  co2eq_ttw: number;
  reward_factor: number;
  energy_mj: number;
  energy_rwd_mj: number;
  wtt_contribution: number;
  ttw_contribution: number;
}

export interface CalculationTrace {
  year: number;
  voyage_type: string;
  wind_reward_factor: number;
  eur_to_usd: number;
  fuel_rows: FuelRowTrace[];
  e_total_mj: number;
  e_total_rwd_mj: number;
  wtt_numerator: number;
  ghg_wtt: number;
  ttw_sum: number;
  ghg_ttw: number;
  ghg_actual: number;
  ghg_target: number;
  compliance_status: string;
  balance_gco2eq: number;
  fem_intra_eur: number;
  fem_international_eur: number;
  fem_applied_eur: number;
  fem_applied_usd: number;
}

// ============================================================================
// Fuel Catalog Response Types
// ============================================================================

/**
 * Fuel catalog response
 */
export interface FuelCatalogResponse {
  /** List of valid fuel type names from catalog */
  fuel_types: string[];
  /** Dictionary mapping commercial fuel names to catalog keys */
  aliases: Record<string, string>;
}


