import React, { useState } from "react";

interface OptionalParametersSectionProps {
  windRewardFactor: number;
  eurToUsd: number;
  onWindRewardFactorChange: (value: number) => void;
  onEurToUsdChange: (value: number) => void;
  errors?: Record<string, string>;
}

export const OptionalParametersSection: React.FC<OptionalParametersSectionProps> = ({
  windRewardFactor,
  eurToUsd,
  onWindRewardFactorChange,
  onEurToUsdChange,
  errors = {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Raw strings for display — avoids snapping back to defaults on clear
  const [windStr, setWindStr] = useState(String(windRewardFactor));
  const [eurStr, setEurStr] = useState(String(eurToUsd));

  const handleWindChange = (raw: string) => {
    setWindStr(raw);
    const v = parseFloat(raw);
    if (raw !== "" && !isNaN(v)) onWindRewardFactorChange(v);
  };

  const handleEurChange = (raw: string) => {
    setEurStr(raw);
    const v = parseFloat(raw);
    if (raw !== "" && !isNaN(v)) onEurToUsdChange(v);
  };

  const windError = errors["wind_reward_factor"];
  const eurError = errors["eur_to_usd"];

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left group"
        aria-expanded={isExpanded}
        aria-controls="optional-parameters-content"
      >
        <div>
          <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-neutral-900">
            Optional Parameters
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">Wind factor, exchange rate</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-medium">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
          <svg
            className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div
          id="optional-parameters-content"
          className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Wind Reward Factor */}
            <div>
              <label htmlFor="wind-reward-factor" className="label">
                Wind Reward Factor
              </label>
              <div className="relative">
                <input
                  id="wind-reward-factor"
                  type="number"
                  min="0"
                  max="1"
                  step="any"
                  value={windStr}
                  placeholder="1.0"
                  onChange={(e) => handleWindChange(e.target.value)}
                  className={`input-field ${windError ? "input-error" : ""}`}
                  aria-invalid={!!windError}
                  aria-describedby={windError ? "wind-reward-error" : undefined}
                />
              </div>
              {windError ? (
                <p id="wind-reward-error" className="error-text" role="alert">{windError}</p>
              ) : (
                <p className="text-xs text-neutral-400 mt-1">Range: 0 – 1.0 · Default: 1.0</p>
              )}
            </div>

            {/* EUR to USD */}
            <div>
              <label htmlFor="eur-to-usd" className="label">
                EUR / USD Rate
              </label>
              <div className="relative">
                <input
                  id="eur-to-usd"
                  type="number"
                  min="0.01"
                  step="any"
                  value={eurStr}
                  placeholder="1.1"
                  onChange={(e) => handleEurChange(e.target.value)}
                  className={`input-field pr-16 ${eurError ? "input-error" : ""}`}
                  aria-invalid={!!eurError}
                  aria-describedby={eurError ? "eur-to-usd-error" : undefined}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none select-none font-medium">
                  €/USD
                </span>
              </div>
              {eurError ? (
                <p id="eur-to-usd-error" className="error-text" role="alert">{eurError}</p>
              ) : (
                <p className="text-xs text-neutral-400 mt-1">Exchange rate · Default: 1.1</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
