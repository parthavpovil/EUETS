import React from "react";
import type { CalculationResponse, CalculationTrace } from "../types";
import { GHGIntensityCard } from "./GHGIntensityCard";
import { ComplianceStatusCard } from "./ComplianceStatusCard";
import { FEMPenaltyCard } from "./FEMPenaltyCard";
import { CalculationBreakdownCard } from "./CalculationBreakdownCard";

interface ResultsDisplayProps {
  results: CalculationResponse | null;
  trace: CalculationTrace | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, trace }) => {
  if (!results) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-neutral-800">Calculation Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GHGIntensityCard data={results.ghg_intensity} />
        <ComplianceStatusCard data={results.compliance} />
        <FEMPenaltyCard data={results.fem_penalty} />
      </div>

      {trace && <CalculationBreakdownCard trace={trace} />}
    </div>
  );
};
