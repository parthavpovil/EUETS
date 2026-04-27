import React from "react";
import type { GHGIntensityResponse } from "../types";

interface GHGIntensityCardProps {
  data: GHGIntensityResponse;
}

export const GHGIntensityCard: React.FC<GHGIntensityCardProps> = ({ data }) => {
  const fmt = (v: number) => v.toFixed(2);

  const rows = [
    { label: "Well-to-Tank (WtT)", value: fmt(data.wtt_gco2eq_per_mj), dim: false },
    { label: "Tank-to-Wheel (TtW)", value: fmt(data.ttw_gco2eq_per_mj), dim: false },
    { label: "WtW Actual", value: fmt(data.wtw_actual_gco2eq_per_mj), dim: false },
    { label: "WtW Target", value: fmt(data.wtw_target_gco2eq_per_mj), dim: true },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">GHG Intensity</h3>
      <div className="space-y-3">
        {rows.map(({ label, value, dim }) => (
          <div key={label} className="flex justify-between items-center">
            <span className={`text-sm ${dim ? "text-neutral-500" : "text-neutral-700"}`}>
              {label}
            </span>
            <span className={`font-mono text-sm font-medium ${dim ? "text-neutral-500" : "text-neutral-900"}`}>
              {value}{" "}
              <span className="text-neutral-400 font-normal">gCO₂eq/MJ</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
