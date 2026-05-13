// 4AM-day boundary helpers and core math.

// Returns the timestamp (ms) of the most recent 4AM boundary at or before `t`.
export function fourAmAnchor(t) {
  const d = new Date(t);
  const anchor = new Date(d);
  anchor.setHours(4, 0, 0, 0);
  if (d.getTime() < anchor.getTime()) {
    anchor.setDate(anchor.getDate() - 1);
  }
  return anchor.getTime();
}

// Local YYYY-MM-DD key for the 4AM-anchored day containing `t`.
export function dayKey(t) {
  const d = new Date(fourAmAnchor(t));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Number of 4AM boundaries crossed between `start` and `now` (local time).
export function daysElapsed(start, now = Date.now()) {
  if (!start) return 0;
  const startMs = typeof start === "string" ? new Date(start).getTime() : start;
  const startAnchor = fourAmAnchor(startMs);
  const nowAnchor = fourAmAnchor(now);
  const diff = nowAnchor - startAnchor;
  if (diff <= 0) return 0;
  return Math.round(diff / (24 * 3600 * 1000));
}

export function currentInterval(settings, planStartTimestamp, now = Date.now()) {
  const days = daysElapsed(planStartTimestamp, now);
  return settings.initialInterval + days * settings.dailyIncrease;
}

export function nextAllowedTime(logs) {
  if (!logs.length) return null;
  const latest = logs[0];
  return new Date(latest.timestamp).getTime() + latest.intervalUsed * 60000;
}

// Extrapolate savings from completed 4AM-bounded days only.
// - "Today" (current 4AM window) is excluded as incomplete.
// - Use up to the last 7 completed days.
// - planStart's first day counts only if its 4AM window has fully elapsed.
// - Need >= 1 completed day to produce a value; otherwise return null.
export function computeSavings(settings, logs, planStartTimestamp, ignoredDays = [], now = Date.now()) {
  if (!planStartTimestamp) return null;

  const todayAnchor = fourAmAnchor(now);
  const planStartMs = new Date(planStartTimestamp).getTime();
  const planAnchor = fourAmAnchor(planStartMs);

  const completedDays = Math.max(0, Math.round((todayAnchor - planAnchor) / (24 * 3600 * 1000)));
  if (completedDays < 1) return null;

  const dayMs = 24 * 3600 * 1000;
  const ignored = new Set(ignoredDays);
  const targetWindow = Math.min(7, completedDays);

  // Walk back from yesterday, skipping ignored days, until we have targetWindow
  // counted days or we reach planStart.
  let counted = 0;
  let earliestStart = todayAnchor;
  for (let i = 1; i <= completedDays && counted < targetWindow; i++) {
    const dayStart = todayAnchor - i * dayMs;
    if (ignored.has(dayKey(dayStart))) continue;
    counted++;
    earliestStart = dayStart;
  }
  if (counted < 1) return null;

  const cigsInWindow = logs.filter((l) => {
    const t = new Date(l.timestamp).getTime();
    if (t < earliestStart || t >= todayAnchor) return false;
    return !ignored.has(dayKey(t));
  }).length;

  const costPerCigarette = settings.packCost / settings.cigarettesPerPack;
  const avgPerDay = cigsInWindow / counted;
  const savedPerDay = Math.max(0, settings.initialCigarettesPerDay - avgPerDay) * costPerCigarette;

  return {
    weeklySaved: savedPerDay * 7,
    monthlyEstimate: savedPerDay * 30,
    daysUsed: counted,
  };
}

export function sortLogsDesc(logs) {
  return [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function formatHMS(ms) {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
