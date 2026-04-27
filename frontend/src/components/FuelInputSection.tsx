import React, { useState } from "react";
import type { FuelInput } from "../types";

interface FuelInputSectionProps {
  fuels: FuelInput[];
  onChange: (fuels: FuelInput[]) => void;
  errors?: Record<string, string>;
  fuelTypes?: string[];
}

const FUEL_GROUPS = [
  {
    label: "HFO – Heavy Fuel Oil",
    options: [
      { value: "HFO", label: "HFO" },
      { value: "HSFO", label: "HSFO  (HFO)" },
      { value: "VLSFO", label: "VLSFO  (HFO)" },
    ],
  },
  {
    label: "LFO – Light Fuel Oil",
    options: [{ value: "LFO", label: "LFO" }],
  },
  {
    label: "MGO – Marine Gas Oil",
    options: [
      { value: "MGO", label: "MGO" },
      { value: "LSMGO", label: "LSMGO  (MGO)" },
    ],
  },
  {
    label: "LNG",
    options: [
      { value: "LNG Otto (DF medium speed)", label: "LNG Otto (DF medium speed)" },
      { value: "LNG Otto (DF slow speed)", label: "LNG Otto (DF slow speed)" },
      { value: "LNG Diesel (DF slow speed)", label: "LNG Diesel (DF slow speed)" },
      { value: "LNG LBSI", label: "LNG LBSI" },
    ],
  },
];

export const FuelInputSection: React.FC<FuelInputSectionProps> = ({
  fuels,
  onChange,
  errors = {},
  fuelTypes,
}) => {
  // Raw strings for display — avoids "0 stays" and preserves user input exactly.
  // Zero initializes to "" (blank placeholder) so the field doesn't show a blocking "0".
  const [massStrings, setMassStrings] = useState<string[]>(
    fuels.map((f) => (f.mass_tonnes === 0 ? "" : String(f.mass_tonnes)))
  );

  const handleFuelTypeChange = (index: number, fuelType: string) => {
    const newFuels = [...fuels];
    newFuels[index] = { ...newFuels[index], fuel_type: fuelType };
    onChange(newFuels);
  };

  const handleMassChange = (index: number, raw: string) => {
    const newStrings = [...massStrings];
    newStrings[index] = raw;
    setMassStrings(newStrings);

    const parsed = parseFloat(raw);
    const newFuels = [...fuels];
    newFuels[index] = {
      ...newFuels[index],
      mass_tonnes: raw === "" || isNaN(parsed) ? 0 : parsed,
    };
    onChange(newFuels);
  };

  const handleAddFuel = () => {
    const defaultFuel = fuelTypes?.[0] ?? "HFO";
    setMassStrings([...massStrings, ""]);
    onChange([...fuels, { fuel_type: defaultFuel, mass_tonnes: 0 }]);
  };

  const handleRemoveFuel = (index: number) => {
    if (fuels.length > 1) {
      setMassStrings(massStrings.filter((_, i) => i !== index));
      onChange(fuels.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">Fuel Inputs</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Add all fuels consumed during the voyage</p>
        </div>
        <button
          type="button"
          onClick={handleAddFuel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Add another fuel"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Fuel
        </button>
      </div>

      <div className="space-y-2">
        {fuels.map((fuel, index) => {
          const fuelTypeError = errors[`fuels.${index}.fuel_type`];
          const massError = errors[`fuels.${index}.mass_tonnes`];

          return (
            <div
              key={index}
              className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm hover:border-neutral-300 transition-colors"
              data-testid={`fuel-entry-${index}`}
            >
              <div className="flex items-start gap-3">
                {/* Entry number badge */}
                <div className="flex-none mt-7">
                  <span className="inline-flex w-6 h-6 rounded-full bg-neutral-100 text-neutral-500 text-xs font-semibold items-center justify-center">
                    {index + 1}
                  </span>
                </div>

                {/* Fuel Type */}
                <div className="flex-1 min-w-0">
                  <label htmlFor={`fuel-type-${index}`} className="label">
                    Fuel Type
                  </label>
                  <select
                    id={`fuel-type-${index}`}
                    value={fuel.fuel_type}
                    onChange={(e) => handleFuelTypeChange(index, e.target.value)}
                    className={`input-field ${fuelTypeError ? "input-error" : ""}`}
                    aria-invalid={!!fuelTypeError}
                  >
                    {FUEL_GROUPS.map((group) =>
                      group.options.length === 1 ? (
                        <option key={group.options[0].value} value={group.options[0].value}>
                          {group.options[0].label}
                        </option>
                      ) : (
                        <optgroup key={group.label} label={group.label}>
                          {group.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      )
                    )}
                  </select>
                  {fuelTypeError && (
                    <p className="error-text" role="alert">{fuelTypeError}</p>
                  )}
                </div>

                {/* Mass input with inline unit */}
                <div className="w-44 flex-none">
                  <label htmlFor={`fuel-mass-${index}`} className="label">
                    Mass (tonnes)
                  </label>
                  <div className="relative">
                    <input
                      id={`fuel-mass-${index}`}
                      type="number"
                      min="0"
                      step="any"
                      value={massStrings[index] ?? ""}
                      placeholder="0"
                      onChange={(e) => handleMassChange(index, e.target.value)}
                      className={`input-field pr-10 ${massError ? "input-error" : ""}`}
                      aria-invalid={!!massError}
                      aria-describedby={massError ? `fuel-mass-error-${index}` : undefined}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400 pointer-events-none select-none">
                      t
                    </span>
                  </div>
                  {massError && (
                    <p id={`fuel-mass-error-${index}`} className="error-text" role="alert">{massError}</p>
                  )}
                </div>

                {/* Remove button */}
                <div className="flex-none pt-6">
                  {fuels.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveFuel(index)}
                      className="p-2 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label={`Remove fuel entry ${index + 1}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {errors["fuels"] && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md" role="alert">
          <svg className="w-4 h-4 flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {errors["fuels"]}
        </div>
      )}
    </div>
  );
};
