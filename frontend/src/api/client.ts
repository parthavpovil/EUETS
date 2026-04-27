import type {
  CalculationRequest,
  CalculationResponse,
  CalculationTrace,
  FuelCatalogResponse,
  ValidationErrorResponse,
} from "../types";
import { validateInputs } from "../engine/validators";
import { calculateFEMWithTrace as engineCalculateFEMWithTrace } from "../engine/calculation";
import { FUEL_CATALOG, FUEL_ALIASES } from "../engine/constants";

export class ApiError extends Error {
  public statusCode?: number;
  public validationErrors?: ValidationErrorResponse["details"];
  public errorType?: string;

  constructor(
    message: string,
    statusCode?: number,
    validationErrors?: ValidationErrorResponse["details"],
    errorType?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
    this.errorType = errorType;
  }
}

export async function calculateFEMWithTrace(
  request: CalculationRequest
): Promise<{ response: CalculationResponse; trace: CalculationTrace }> {
  const errors = validateInputs(
    request.fuels,
    request.year,
    request.wind_reward_factor ?? 1.0,
    request.eur_to_usd ?? 1.1,
    request.voyage_type
  );
  if (errors.length > 0) {
    throw new ApiError(
      "Validation failed. Please check your inputs.",
      400,
      errors,
      "ValidationError"
    );
  }
  try {
    return engineCalculateFEMWithTrace(
      request.fuels,
      request.year,
      request.wind_reward_factor ?? 1.0,
      request.eur_to_usd ?? 1.1,
      request.voyage_type
    );
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : "Calculation failed",
      500,
      undefined,
      "CalculationError"
    );
  }
}

export async function getFuels(): Promise<FuelCatalogResponse> {
  return {
    fuel_types: Object.keys(FUEL_CATALOG).filter((k) => k !== "None"),
    aliases: { ...FUEL_ALIASES },
  };
}
