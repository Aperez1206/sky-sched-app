export const DEFAULT_TAIL_NUMBERS = [
  "N19679",
  "N5223R",
  "N6854H",
  "N20332",
  "N138MF",
  "N20472",
  "N4609Q",
  "N194ML",
  "N6026J",
];

const STORAGE_KEY = "flight-school-fleet";

export function getFleetTailNumbers(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [...DEFAULT_TAIL_NUMBERS];
}

export function saveFleetTailNumbers(tails: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tails));
}
