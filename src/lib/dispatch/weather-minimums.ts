export interface WeatherMinimum {
  pilotLevel: string;
  operation: string;
  visibility: number;
  ceiling: number;
  maxWind: number;
  maxCrosswind: number;
}

export const DEFAULT_MINIMUMS: WeatherMinimum[] = [
  { pilotLevel: "Student", operation: "Dual VFR Local", visibility: 5, ceiling: 2000, maxWind: 25, maxCrosswind: 15 },
  { pilotLevel: "Student", operation: "Dual VFR Cross Country", visibility: 5, ceiling: 2500, maxWind: 25, maxCrosswind: 15 },
  { pilotLevel: "Student", operation: "Solo VFR Local", visibility: 7, ceiling: 3000, maxWind: 15, maxCrosswind: 10 },
  { pilotLevel: "Student", operation: "Solo VFR Cross Country", visibility: 7, ceiling: 3000, maxWind: 15, maxCrosswind: 10 },
  { pilotLevel: "Student", operation: "Night Dual", visibility: 5, ceiling: 2000, maxWind: 25, maxCrosswind: 15 },
  { pilotLevel: "Private", operation: "Dual VFR Local", visibility: 5, ceiling: 2000, maxWind: 25, maxCrosswind: 15 },
  { pilotLevel: "Private", operation: "Dual VFR Cross Country", visibility: 5, ceiling: 2000, maxWind: 25, maxCrosswind: 15 },
  { pilotLevel: "Private", operation: "Solo VFR Local", visibility: 5, ceiling: 3000, maxWind: 20, maxCrosswind: 10 },
  { pilotLevel: "Private", operation: "Solo VFR Cross Country", visibility: 5, ceiling: 3000, maxWind: 20, maxCrosswind: 10 },
  { pilotLevel: "Private", operation: "Night Dual", visibility: 5, ceiling: 2000, maxWind: 25, maxCrosswind: 15 },
  { pilotLevel: "Instrument", operation: "Dual Local", visibility: 3, ceiling: 1000, maxWind: 25, maxCrosswind: 15 },
  { pilotLevel: "Instrument", operation: "Dual VFR Cross Country", visibility: 3, ceiling: 1000, maxWind: 25, maxCrosswind: 15 },
  { pilotLevel: "Instrument", operation: "Night Dual", visibility: 3, ceiling: 1000, maxWind: 25, maxCrosswind: 15 },
  { pilotLevel: "Commercial", operation: "Dual VFR Local", visibility: 3, ceiling: 2000, maxWind: 25, maxCrosswind: 15 },
  { pilotLevel: "Commercial", operation: "Dual VFR Cross Country", visibility: 3, ceiling: 2000, maxWind: 25, maxCrosswind: 15 },
  { pilotLevel: "Commercial", operation: "Solo VFR Local", visibility: 5, ceiling: 2000, maxWind: 25, maxCrosswind: 15 },
  { pilotLevel: "Commercial", operation: "Solo VFR Cross Country", visibility: 5, ceiling: 2000, maxWind: 25, maxCrosswind: 15 },
  { pilotLevel: "Commercial", operation: "Night Dual", visibility: 3, ceiling: 2000, maxWind: 25, maxCrosswind: 15 },
];

const STORAGE_KEY = "flight-school-minimums";

export function getMinimums(): WeatherMinimum[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [...DEFAULT_MINIMUMS];
}

export function saveMinimums(minimums: WeatherMinimum[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(minimums));
}

export function resetMinimums() {
  localStorage.removeItem(STORAGE_KEY);
}

export const PILOT_LEVELS = ["Student", "Private", "Instrument", "Commercial"] as const;
