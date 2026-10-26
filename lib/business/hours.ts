import { windowFor, type OpeningHours } from "./responseTime";

const DAY = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function clock(minute: number) {
  const h24 = Math.floor(minute / 60);
  const m = minute % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`;
}

export type HoursRow = { label: string; value: string; days: number[] };

// The opening-hours table, generated from the hours themselves so the table
// and "Open now" can never disagree. Days with the same hours are grouped
// ("Mon to Sat"), starting the week on Monday.
export function hoursTableFrom(hours: OpeningHours): HoursRow[] {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const value = (d: number) => {
    const w = windowFor(hours, d);
    return w ? `${clock(w.openMinute)} to ${clock(w.closeMinute)}` : "Closed";
  };

  const rows: HoursRow[] = [];
  for (const d of order) {
    const v = value(d);
    const last = rows[rows.length - 1];
    const lastDay = last?.days[last.days.length - 1];
    const contiguous =
      last &&
      lastDay !== undefined &&
      order.indexOf(lastDay) === order.indexOf(d) - 1;
    if (last && last.value === v && contiguous) last.days.push(d);
    else rows.push({ label: "", value: v, days: [d] });
  }
  return rows.map((r) => ({
    ...r,
    label:
      r.days.length === 1
        ? DAY[r.days[0]]
        : `${SHORT[r.days[0]]} to ${SHORT[r.days[r.days.length - 1]]}`,
  }));
}
