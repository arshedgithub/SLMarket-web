import { db } from "@/lib/db";
import { campaignSchema, type CampaignData } from "./campaignPayload";

/*
 * Server helpers for the admin spotlight screens and API: save a campaign
 * from the form's payload, and read campaigns with their totals.
 */

export type CampaignSaveResult =
  | { ok: true; id: string }
  | { ok: false; message: string; field?: string };

function toRow(c: CampaignData, businessProfileId: string | null) {
  return {
    kind: c.kind,
    status: c.status,
    businessProfileId,
    advertiser: c.advertiser,
    tier: c.tier,
    pinned: c.pinned,
    headline: c.headline,
    subline: c.subline,
    ctaLabel: c.ctaLabel,
    destType: c.destType,
    destValue: c.destValue,
    imageId: c.imageId,
    imageWidth: c.imageWidth ?? null,
    imageHeight: c.imageHeight ?? null,
    focalX: c.focalX,
    focalY: c.focalY,
    altText: c.altText,
    imageOnly: c.imageOnly,
    logoId: c.logoId,
    cropOverrides: c.cropOverrides ?? undefined,
    targetCategory: c.targetCategory,
    targetDistrict: c.targetDistrict,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
  };
}

export async function saveCampaign(
  body: unknown,
  id?: string,
): Promise<CampaignSaveResult> {
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      message: first.message,
      field: first.path[0]?.toString(),
    };
  }
  let businessProfileId: string | null = null;
  if (parsed.data.businessSlug) {
    const b = await db.businessProfile.findUnique({
      where: { slug: parsed.data.businessSlug },
      select: { id: true },
    });
    if (!b)
      return {
        ok: false,
        message: "No business has that page name.",
        field: "businessSlug",
      };
    businessProfileId = b.id;
  }
  const row = toRow(parsed.data, businessProfileId);
  if (id) {
    const updated = await db.spotlightCampaign.updateMany({
      where: { id },
      data: row,
    });
    if (updated.count === 0)
      return { ok: false, message: "Campaign not found." };
    return { ok: true, id };
  }
  const created = await db.spotlightCampaign.create({
    data: row,
    select: { id: true },
  });
  return { ok: true, id: created.id };
}

export type CampaignStats = { impressions: number; clicks: number };

// All-time and today's totals per campaign ("c:<id>" in the daily stats).
export async function campaignStats(
  ids: string[],
): Promise<Map<string, CampaignStats>> {
  if (ids.length === 0) return new Map();
  const rows = await db.spotlightStatDaily.groupBy({
    by: ["spotId"],
    where: { spotId: { in: ids.map((id) => `c:${id}`) } },
    _sum: { impressions: true, clicks: true },
  });
  return new Map(
    rows.map((r) => [
      r.spotId.slice(2),
      { impressions: r._sum.impressions ?? 0, clicks: r._sum.clicks ?? 0 },
    ]),
  );
}
