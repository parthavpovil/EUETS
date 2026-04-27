import React, { useState } from "react";
import type { VoyageType } from "../types";

interface VoyageParametersSectionProps {
  year: number;
  voyageType: VoyageType;
  onYearChange: (year: number) => void;
  onVoyageTypeChange: (voyageType: VoyageType) => void;
  errors?: Record<string, string>;
}

export const VoyageParametersSection: React.FC<VoyageParametersSectionProps> = ({
  year,
  voyageType,
  onYearChange,
  onVoyageTypeChange,
  errors = {},
}) => {
  // Raw string — avoids year snapping to 2025 when user clears the field
  const [yearStr, setYearStr] = useState(String(year));

  const handleYearChange = (raw: string) => {
    setYearStr(raw);
    const parsed = parseInt(raw, 10);
    if (raw !== "" && !isNaN(parsed)) {
      onYearChange(parsed);
    }
  };

  const yearError = errors["year"];
  const voyageTypeError = errors["voyage_type"];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-neutral-800">Voyage Parameters</h3>
        <p className="text-xs text-neutral-500 mt-0.5">Year and coverage type for this voyage</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm space-y-5">
        {/* Year */}
        <div className="flex items-start gap-6">
          <div className="w-36 flex-none">
            <label htmlFor="voyage-year" className="label">
              Year
            </label>
            <input
              id="voyage-year"
              type="number"
              min="2025"
              max="2050"
              step="1"
              value={yearStr}
              placeholder="2030"
              onChange={(e) => handleYearChange(e.target.value)}
              className={`input-field ${yearError ? "input-error" : ""}`}
              aria-invalid={!!yearError}
            />
            {yearError && (
              <p className="error-text" role="alert">{yearError}</p>
            )}
            {!yearError && (
              <p className="text-xs text-neutral-400 mt-1">2025 – 2050</p>
            )}
          </div>

          {/* Voyage Type */}
          <div className="flex-1">
            <fieldset>
              <legend className="label">Voyage Type</legend>
              <div className="mt-2 space-y-2">
                {(
                  [
                    { value: "intra-EU", label: "Intra-EU", sub: "100% coverage" },
                    { value: "international", label: "International", sub: "50% coverage" },
                  ] as { value: VoyageType; label: string; sub: string }[]
                ).map(({ value, label, sub }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg border transition-colors ${
                      voyageType === value
                        ? "border-primary-400 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="voyage-type"
                      value={value}
                      checked={voyageType === value}
                      onChange={() => onVoyageTypeChange(value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                      aria-invalid={!!voyageTypeError}
                    />
                    <div>
                      <span className="text-sm font-medium text-neutral-800">{label}</span>
                      <span className="ml-2 text-xs text-neutral-500">{sub}</span>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>
            {voyageTypeError && (
              <p className="error-text mt-1" role="alert">{voyageTypeError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
