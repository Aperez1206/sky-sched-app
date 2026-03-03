export const AIRPORTS = [
  { icao: "KOPF", name: "Opa-Locka Executive" },
  { icao: "X14", name: "La Belle Municipal" },
  { icao: "KPHK", name: "Palm Beach Co Glades" },
  { icao: "KIMM", name: "Immokalee Regional" },
  { icao: "2IS", name: "Airglades" },
  { icao: "KAPF", name: "Naples Municipal" },
] as const;

export type OpsMode = "09" | "27";

export const KOPF_OPS_RUNWAYS: Record<OpsMode, string[]> = {
  "09": ["09L", "12", "09R"],
  "27": ["27L", "30", "27R"],
};

const AIRPORT_KEY = "flight-school-airport";
const OPS_KEY = "flight-school-ops-mode";

export function getSavedAirport(): string {
  return localStorage.getItem(AIRPORT_KEY) || "KOPF";
}

export function saveAirport(icao: string) {
  localStorage.setItem(AIRPORT_KEY, icao);
}

export function getSavedOpsMode(): OpsMode {
  return (localStorage.getItem(OPS_KEY) as OpsMode) || "09";
}

export function saveOpsMode(mode: OpsMode) {
  localStorage.setItem(OPS_KEY, mode);
}
