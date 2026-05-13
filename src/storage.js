export const STORAGE_KEY = "smokeredux";

export const DEFAULT_SETTINGS = {
  initialInterval: 60,
  dailyIncrease: 5,
  cigarettesPerPack: 20,
  packCost: 10.0,
  initialCigarettesPerDay: 20,
  language: navigator.language?.startsWith("fr") ? "fr" : "en",
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      planStartTimestamp: parsed.planStartTimestamp ?? null,
      ignoredDays: Array.isArray(parsed.ignoredDays) ? parsed.ignoredDays : [],
    };
  } catch {
    return null;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function emptyState(settings = DEFAULT_SETTINGS) {
  return { settings, logs: [], planStartTimestamp: null, ignoredDays: [] };
}
