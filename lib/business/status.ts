import { db } from "@/lib/db";
import { getOrSetCached } from "@/lib/redis";
import { sampleOnly, withTimeout } from "./dbGuard";
import { getSampleStorefront } from "./sampleStorefronts";

/*
 * "Does this business page exist, and can it be reached by its short link?"
 * asked on every request for /business/<slug> and /<slug>, so it is cached
 * (a few minutes) and must never be slow or fatal. A real BusinessProfile
 * wins over the sample businesses. Clear the cache key when a business is
 * renamed or suspended:  invalidateCache(`bizstatus:${slug}`).
 */

export type BusinessStatus = "active" | "missing" | "suspended";

const TTL_SECONDS = 300;

type Answer = { status: BusinessStatus | "unknown"; verified: boolean };

// What the database says, as a small string that caches well.
async function fromDatabase(slug: string): Promise<string> {
  const row = await withTimeout(
    db.businessProfile.findUnique({
      where: { slug },
      select: { status: true, isVerified: true },
    }),
  );
  return row
    ? `${row.status === "ACTIVE" ? "active" : "suspended"}|${row.isVerified ? 1 : 0}`
    : "none";
}

async function lookup(slug: string): Promise<Answer> {
  let raw: string | null = "none";
  if (!sampleOnly()) {
    try {
      raw = await getOrSetCached<string>(`bizstatus:${slug}`, TTL_SECONDS, () =>
        fromDatabase(slug),
      );
    } catch {
      try {
        raw = await fromDatabase(slug); // the cache is down
      } catch {
        raw = null; // the database is down
      }
    }
  }

  if (raw && raw !== "none") {
    const [status, verified] = raw.split("|");
    return { status: status as BusinessStatus, verified: verified === "1" };
  }
  // No real profile (or no way to ask): the sample businesses answer.
  const sample = getSampleStorefront(slug);
  if (sample) return { status: "active", verified: sample.verified };
  return { status: raw === null ? "unknown" : "missing", verified: false };
}

// Fails open: if nothing could be checked, the page renders and decides for
// itself, instead of every business page erroring.
export async function businessStatus(slug: string): Promise<BusinessStatus> {
  const { status } = await lookup(slug);
  return status === "unknown" ? "active" : status;
}

// A short link exists only for an active, VERIFIED business. Unknown, or a
// failed lookup, means no redirect (fails closed: never send someone to the
// wrong place).
export async function isShortLinkTarget(slug: string): Promise<boolean> {
  const { status, verified } = await lookup(slug);
  return status === "active" && verified;
}
