/**
 * InputForm Component
 * 
 * Main form component that composes all input sections:
 * - FuelInputSection
 * - VoyageParametersSection
 * - OptionalParametersSection
 * 
 * Handles state management, validation, and form submission.
 */

import React, { useState, useEffect } from "react";
import { FuelInputSection } from "./FuelInputSection";
import { VoyageParametersSection } from "./VoyageParametersSection";
import { OptionalParametersSection } from "./OptionalParametersSection";
import { calculateFEMWithTrace, getFuels, ApiError } from "../api/client";
import type {
  FuelInput,
  VoyageType,
  CalculationRequest,
  CalculationResponse,
  CalculationTrace,
} from "../types";

interface InputFormProps {
  /** Callback when calculation completes successfully */
  onCalculationComplete: (result: CalculationResponse, trace: CalculationTrace) => void;
  /** Callback when calculation fails */
  onCalculationError?: (error: string) => void;
}

/**
 * InputForm component for FuelEU Maritime Calculator
 */
export const InputForm: React.FC<InputFormProps> = ({
  onCalculationComplete,
  onCalculationError,
}) => {
  // ============================================================================
  // State Management
  // ============================================================================

  // Fuel inputs
  const [fuels, setFuels] = useState<FuelInput[]>([
    { fuel_type: "HFO", mass_tonnes: 0 },
  ]);

  // Voyage parameters
  const [year, setYear] = useState<number>(2030);
  const [voyageType, setVoyageType] = useState<VoyageType>("intra-EU");

  // Optional parameters
  const [windRewardFactor, setWindRewardFactor] = useState<number>(1.0);
  const [eurToUsd, setEurToUsd] = useState<number>(1.1);

  // Available fuel types from catalog
  const [fuelTypes, setFuelTypes] = useState<string[]>([
    "HFO",
    "LFO",
    "MGO",
    "LNG Otto (DF medium speed)",
    "LNG Otto (DF slow speed)",
    "LNG Diesel (DF slow speed)",
    "LNG LBSI (Lean-burn spark ignition)",
  ]);

  // Form state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>("");

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Fetch available fuel types on mount
   */
  useEffect(() => {
    const fetchFuelTypes = async () => {
      try {
        const catalog = await getFuels();
        setFuelTypes(catalog.fuel_types);
      } catch (error) {
        // Use default fuel types if fetch fails
        console.error("Failed to fetch fuel types:", error);
      }
    };

    fetchFuelTypes();
  }, []);

  // ============================================================================
  // Validation
  // ============================================================================

  /**
   * Validate form inputs
   * Returns true if valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate fuels
    let hasNonZeroFuel = false;
    fuels.forEach((fuel, index) => {
      if (fuel.mass_tonnes < 0) {
        newErrors[`fuels.${index}.mass_tonnes`] = "Fuel mass cannot be negative";
      }
      if (fuel.mass_tonnes > 0) {
        hasNonZeroFuel = true;
      }
      if (!fuel.fuel_type) {
        newErrors[`fuels.${index}.fuel_type`] = "Fuel type is required";
      }
    });

    if (!hasNonZeroFuel) {
      newErrors["fuels"] = "At least one fuel must have mass greater than zero";
    }

    // Validate year
    if (year < 2025 || year > 2050) {
      newErrors["year"] = "Year must be between 2025 and 2050";
    }

    // Validate voyage type
    if (voyageType !== "intra-EU" && voyageType !== "international") {
      newErrors["voyage_type"] = "Voyage type must be 'intra-EU' or 'international'";
    }

    // Validate optional parameters
    if (windRewardFactor < 0 || windRewardFactor > 1.0) {
      newErrors["wind_reward_factor"] = "Wind reward factor must be between 0 and 1.0";
    }

    if (eurToUsd <= 0) {
      newErrors["eur_to_usd"] = "Exchange rate must be positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================
  // Form Submission
  // ============================================================================

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setGeneralError("");
    setErrors({});

    // Validate form
    if (!validateForm()) {
      setGeneralError("Please fix the validation errors before submitting.");
      return;
    }

    // Prepare request
    const request: CalculationRequest = {
      fuels,
      year,
      voyage_type: voyageType,
      wind_reward_factor: windRewardFactor,
      eur_to_usd: eurToUsd,
    };

    // Submit calculation
    setIsLoading(true);
    try {
      const { response: result, trace } = await calculateFEMWithTrace(request);
      onCalculationComplete(result, trace);
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle validation errors from backend
        if (error.validationErrors) {
          const backendErrors: Record<string, string> = {};
          error.validationErrors.forEach((err) => {
            backendErrors[err.field] = err.message;
          });
          setErrors(backendErrors);
          setGeneralError("Validation failed. Please check your inputs.");
        } else {
          setGeneralError(error.message);
        }
        onCalculationError?.(error.message);
      } else {
        const errorMessage = "An unexpected error occurred. Please try again.";
        setGeneralError(errorMessage);
        onCalculationError?.(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* General Error Message */}
      {generalError && (
        <div
          className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded-md"
          role="alert"
        >
          <p className="font-medium">Error</p>
          <p className="text-sm">{generalError}</p>
        </div>
      )}

      {/* Fuel Input Section */}
      <FuelInputSection
        fuels={fuels}
        onChange={setFuels}
        errors={errors}
        fuelTypes={fuelTypes}
      />

      {/* Voyage Parameters Section */}
      <VoyageParametersSection
        year={year}
        voyageType={voyageType}
        onYearChange={setYear}
        onVoyageTypeChange={setVoyageType}
        errors={errors}
      />

      {/* Optional Parameters Section */}
      <OptionalParametersSection
        windRewardFactor={windRewardFactor}
        eurToUsd={eurToUsd}
        onWindRewardFactorChange={setWindRewardFactor}
        onEurToUsdChange={setEurToUsd}
        errors={errors}
      />

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`btn-primary px-8 py-3 text-lg ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Calculating...
            </span>
          ) : (
            "Calculate Penalty"
          )}
        </button>
      </div>
    </form>
  );
};
