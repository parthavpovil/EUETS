import type { ValidationError } from "../types";
import { FUEL_CATALOG, FUEL_ALIASES } from "./constants";

export function validateInputs(
  fuels: Array<{ fuel_type: string; mass_tonnes: number }>,
  year: number,
  wind_reward_factor: number,
  eur_to_usd: number,
  voyage_type: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!fuels || fuels.length === 0) {
    errors.push({ field: "fuels", message: "At least one fuel is required" });
    return errors;
  }

  const hasPositiveMass = fuels.some((f) => f.mass_tonnes > 0);
  if (!hasPositiveMass) {
    errors.push({ field: "fuels", message: "At least one fuel must have mass greater than zero" });
  }

  fuels.forEach((fuel, i) => {
    if (!fuel.fuel_type || fuel.fuel_type.trim() === "") {
      errors.push({ field: `fuels[${i}].fuel_type`, message: "Fuel type is required" });
    } else if (!(fuel.fuel_type in FUEL_CATALOG) && !(fuel.fuel_type in FUEL_ALIASES)) {
      errors.push({ field: `fuels[${i}].fuel_type`, message: `Unknown fuel type: ${fuel.fuel_type}` });
    }
    if (fuel.mass_tonnes < 0) {
      errors.push({ field: `fuels[${i}].mass_tonnes`, message: "Fuel mass must be non-negative" });
    }
  });

  if (year < 2025 || year > 2050) {
    errors.push({ field: "year", message: "Year must be between 2025 and 2050" });
  }

  if (wind_reward_factor < 0 || wind_reward_factor > 1.0) {
    errors.push({ field: "wind_reward_factor", message: "Wind reward factor must be between 0 and 1" });
  }

  if (eur_to_usd <= 0) {
    errors.push({ field: "eur_to_usd", message: "EUR to USD exchange rate must be positive" });
  }

  if (voyage_type !== "intra-EU" && voyage_type !== "international") {
    errors.push({ field: "voyage_type", message: 'Voyage type must be "intra-EU" or "international"' });
  }

  return errors;
}
