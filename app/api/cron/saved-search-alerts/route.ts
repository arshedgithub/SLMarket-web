import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/utils/escape-html";
import { getAdFeed } from "@/lib/listings/feed";
import { adsForSavedSearch } from "@/lib/listings/savedSearch";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://slmarket.lk";
const SHOWN_PER_SEARCH = 5;

/*
 * Daily (cron-job.org, x-cron-secret header): one email per user listing
 * the new ads for each saved search with alerts on, since the last alert.
 * Searches with nothing new are left alone.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const [ads, searches] = await Promise.all([
    getAdFeed(),
    db.savedSearch.findMany({
      where: { alerts: true },
      select: {
        id: true,
        label: true,
        query: true,
        createdAt: true,
        lastNotifiedAt: true,
        user: { select: { id: true, email: true, name: true } },
      },
    }),
  ]);

  const byUser = new Map<
    string,
    {
      email: string;
      name: string;
      items: { id: string; label: string; query: string; ads: typeof ads }[];
    }
  >();
  for (const s of searches) {
    const since = (s.lastNotifiedAt ?? s.createdAt).getTime();
    const fresh = adsForSavedSearch(
      ads.filter((a) => Date.parse(a.postedAt) > since),
      s.query,
    );
    if (fresh.length === 0) continue;
    const entry = byUser.get(s.user.id) ?? {
      email: s.user.email,
      name: s.user.name,
      items: [],
    };
    entry.items.push({ id: s.id, label: s.label, query: s.query, ads: fresh });
    byUser.set(s.user.id, entry);
  }

  let sent = 0;
  for (const { email, name, items } of byUser.values()) {
    const sections = items
      .map((item) => {
        const rows = item.ads
          .slice(0, SHOWN_PER_SEARCH)
          .map(
            (a) =>
              `<tr><td style="padding:6px 0;"><a href="${APP_URL}/ad/${encodeURIComponent(a.slug)}" style="color:#1557d6;font-weight:600;text-decoration:none;">${escapeHtml(a.title)}</a><br><span style="color:#4b5563;font-size:13px;">${escapeHtml(a.priceLabel)} · ${escapeHtml(a.location)}</span></td></tr>`,
          )
          .join("");
        const more =
          item.ads.length > SHOWN_PER_SEARCH
            ? item.ads.length - SHOWN_PER_SEARCH
            : 0;
        return `<h2 style="font-size:16px;margin:24px 0 4px;color:#10213f;">${escapeHtml(item.label)}</h2>
<table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
<a href="${APP_URL}${item.query}" style="display:inline-block;margin-top:8px;color:#1557d6;font-size:14px;">${more ? `See all ${item.ads.length} new ads` : "See the search"}</a>`;
      })
      .join("");
    try {
      await sendEmail({
        to: email,
        subject: `New ads for your saved ${items.length === 1 ? "search" : "searches"} on SLMarket.lk`,
        html: `<!DOCTYPE html><html lang="en"><body style="margin:0;padding:24px;background:#f6f9fe;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px 32px;">
<p style="margin:0 0 4px;font-size:15px;color:#10213f;">Hi ${escapeHtml(name)},</p>
<p style="margin:0;color:#4b5563;font-size:14px;">New ads match your saved searches.</p>
${sections}
<p style="margin:28px 0 0;color:#6b7280;font-size:12px;">You get this because alerts are on for these searches. <a href="${APP_URL}/dashboard/saved-searches" style="color:#6b7280;">Manage your saved searches</a>.</p>
</div></body></html>`,
      });
      sent++;
      await db.savedSearch.updateMany({
        where: { id: { in: items.map((i) => i.id) } },
        data: { lastNotifiedAt: now },
      });
    } catch {
      // Left for the next run.
    }
  }

  return NextResponse.json({ users: byUser.size, sent });
}
