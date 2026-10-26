export type EventPrimitive = string | number | boolean | null;

// Event payloads come from the browser: keep at most 20 flat fields, cap
// key and string lengths, and drop anything nested (objects, arrays).
export function cleanEventData(data: unknown): Record<string, EventPrimitive> {
  const out: Record<string, EventPrimitive> = {};
  if (!data || typeof data !== "object" || Array.isArray(data)) return out;
  for (const [k, v] of Object.entries(data as Record<string, unknown>).slice(
    0,
    20,
  )) {
    if (typeof v === "string") out[k.slice(0, 40)] = v.slice(0, 200);
    else if (typeof v === "number" || typeof v === "boolean" || v === null)
      out[k.slice(0, 40)] = v;
  }
  return out;
}
