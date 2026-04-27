import { FUEL_CATALOG, FUEL_ALIASES } from "./constants";

export function resolveFuelName(name: string): string {
  const n = name.trim();
  if (n in FUEL_CATALOG) return n;
  if (n in FUEL_ALIASES) return FUEL_ALIASES[n];
  const up = n.toUpperCase();
  for (const k of Object.keys(FUEL_CATALOG)) {
    if (k.toUpperCase() === up) return k;
  }
  for (const [alias, canonical] of Object.entries(FUEL_ALIASES)) {
    if (alias.toUpperCase() === up) return canonical;
  }
  throw new Error(`Unknown fuel type: ${n}`);
}
