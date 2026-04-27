import React from "react";
import type { ComplianceStatusResponse } from "../types";

interface ComplianceStatusCardProps {
  data: ComplianceStatusResponse;
}

export const ComplianceStatusCard: React.FC<ComplianceStatusCardProps> = ({ data }) => {
  const isSurplus = data.status === "Surplus";
  const balanceTonnes = (data.balance_gco2eq / 1_000_000).toFixed(2);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Compliance Status</h3>
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`text-2xl font-bold ${
            isSurplus ? "text-success-600" : "text-danger-600"
          }`}
        >
          {data.status}
        </span>
        <span
          className={isSurplus ? "badge-success" : "badge-danger"}
        >
          {isSurplus ? "Compliant" : "Non-Compliant"}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-neutral-600">Balance</span>
        <span className="font-mono text-sm font-medium text-neutral-900">
          {balanceTonnes}{" "}
          <span className="text-neutral-400 font-normal">tCO₂eq</span>
        </span>
      </div>
    </div>
  );
};
