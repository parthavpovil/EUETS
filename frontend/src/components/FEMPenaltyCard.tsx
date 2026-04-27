import React from "react";
import type { FEMPenaltyResponse } from "../types";

interface FEMPenaltyCardProps {
  data: FEMPenaltyResponse;
}

const fmtEur = (v: number) =>
  v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const FEMPenaltyCard: React.FC<FEMPenaltyCardProps> = ({ data }) => {
  const rows = [
    { label: "Intra-EU", value: data.intra_eur },
    { label: "International", value: data.international_eur },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">FEM Penalty</h3>

      <div className="space-y-2 mb-4">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center text-sm">
            <span className="text-neutral-600">{label}</span>
            <span className="font-mono text-neutral-700">€{fmtEur(value)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-200 pt-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-neutral-800">Applied (EUR)</span>
          <span className="font-mono font-semibold text-neutral-900">
            €{fmtEur(data.applied_eur)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-neutral-800">Applied (USD)</span>
          <span className="font-mono font-semibold text-neutral-900">
            ${fmtEur(data.applied_usd)}
          </span>
        </div>
      </div>
    </div>
  );
};
