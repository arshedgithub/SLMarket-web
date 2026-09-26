/*
 * Business response time: a MEASURED statistic, never typed in by the
 * business. Pure functions only, so the nightly aggregation job, the card,
 * the business page and the dashboard all agree on the numbers.
 *
 * What is measured: minutes from a buyer's first message in a new in-app
 * conversation to the business's first HUMAN reply, counting only business
 * hours (Asia/Colombo). Excluded before it reaches these functions: spam /
 * blocked / confirmed-abuse conversations, auto-replies, conversations the
 * business started, and repeat buyer messages (only the first starts the
 * clock).
 */

export const COLOMBO_OFFSET_MINUTES = 330; // UTC+5:30, no daylight saving

// Days 0 = Sunday ... 6 = Saturday. Minutes are minutes after local midnight.
export type OpeningHours = {
  days: number[];
  openMinute: number;
  closeMinute: number;
};

// Used when a business has not set its own opening hours.
export const DEFAULT_HOURS: OpeningHours = {
  days: [1, 2, 3, 4, 5, 6],
  openMinute: 8 * 60,
  closeMinute: 20 * 60,
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_MS = 60 * 1000;

// Business minutes in the window [start, end), in Asia/Colombo time.
export function businessMinutesBetween(
  start: Date,
  end: Date,
  hours: OpeningHours = DEFAULT_HOURS,
): number {
  if (end <= start) return 0;
  const offset = COLOMBO_OFFSET_MINUTES * MIN_MS;
  // "Local ms": a UTC clock that reads Colombo wall time.
  const s = start.getTime() + offset;
  const e = end.getTime() + offset;

  let total = 0;
  for (
    let dayStart = Math.floor(s / DAY_MS) * DAY_MS;
    dayStart < e;
    dayStart += DAY_MS
  ) {
    const weekday = new Date(dayStart).getUTCDay();
    if (!hours.days.includes(weekday)) continue;
    const open = dayStart + hours.openMinute * MIN_MS;
    const close = dayStart + hours.closeMinute * MIN_MS;
    const from = Math.max(open, s);
    const to = Math.min(close, e);
    if (to > from) total += (to - from) / MIN_MS;
  }
  return Math.round(total);
}

export function isOpenAt(date: Date, hours: OpeningHours = DEFAULT_HOURS) {
  const local = new Date(date.getTime() + COLOMBO_OFFSET_MINUTES * MIN_MS);
  const minute = local.getUTCHours() * 60 + local.getUTCMinutes();
  return (
    hours.days.includes(local.getUTCDay()) &&
    minute >= hours.openMinute &&
    minute < hours.closeMinute
  );
}

/* ------------------------------------------------------------------
 * Aggregation (rolling 30 days, recalculated daily)
 * ------------------------------------------------------------------ */

export const UNANSWERED_CAP_MINUTES = 24 * 60; // 24 business hours

// One conversation from the last 30 days that counts. `minutes` is the
// stored business_minutes_to_reply; null means no human reply yet.
export type ConversationSample = { minutes: number | null };

export type ResponseStats = {
  conversations: number;
  medianMinutes: number;
  // Share of conversations answered within 24 business hours (0 to 1).
  replyRate: number;
};

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Ignoring messages must never improve the number: an unanswered
// conversation counts as a full 24 business hours in the median and as
// "not replied" in the rate. A reply later than 24 business hours is treated
// the same way.
export function computeResponseStats(
  conversations: ConversationSample[],
): ResponseStats {
  const capped = conversations.map((c) =>
    c.minutes === null || c.minutes > UNANSWERED_CAP_MINUTES
      ? UNANSWERED_CAP_MINUTES
      : c.minutes,
  );
  const replied = conversations.filter(
    (c) => c.minutes !== null && c.minutes <= UNANSWERED_CAP_MINUTES,
  ).length;
  return {
    conversations: conversations.length,
    medianMinutes: median(capped),
    replyRate: conversations.length ? replied / conversations.length : 0,
  };
}

/* ------------------------------------------------------------------
 * The label
 * ------------------------------------------------------------------ */

export type ResponseLabel = "within-hour" | "within-few-hours" | "within-day";

export const MIN_CONVERSATIONS = 10;
export const MIN_REPLY_RATE = 0.8;

// A label is earned only when the data is meaningful AND the result is good.
export function responseLabelFor(stats: ResponseStats): ResponseLabel | null {
  if (stats.conversations < MIN_CONVERSATIONS) return null;
  if (stats.replyRate < MIN_REPLY_RATE) return null;
  if (stats.medianMinutes <= 60) return "within-hour";
  if (stats.medianMinutes <= 180) return "within-few-hours";
  if (stats.medianMinutes <= UNANSWERED_CAP_MINUTES) return "within-day";
  return null;
}

// Sponsored placements never advertise a slow response: "within a day" is
// business-page only.
export function labelForSurface(
  label: ResponseLabel | null,
  surface: "sponsored" | "page",
): ResponseLabel | null {
  if (label === "within-day" && surface === "sponsored") return null;
  return label;
}

/* ------------------------------------------------------------------
 * Stability: a label changes only after the new value has held for
 * 3 consecutive daily calculations (no flicker at a threshold).
 * ------------------------------------------------------------------ */

export const DAYS_TO_CHANGE = 3;

export type LabelState = {
  label: ResponseLabel | null; // what is shown now
  candidate: ResponseLabel | null; // what the latest calculations say
  daysHeld: number; // consecutive days the candidate has held
};

export function nextLabelState(
  state: LabelState,
  calculated: ResponseLabel | null,
): LabelState {
  if (calculated === state.label) {
    return { label: state.label, candidate: state.label, daysHeld: 0 };
  }
  const daysHeld = calculated === state.candidate ? state.daysHeld + 1 : 1;
  if (daysHeld >= DAYS_TO_CHANGE) {
    return { label: calculated, candidate: calculated, daysHeld: 0 };
  }
  return { label: state.label, candidate: calculated, daysHeld };
}
