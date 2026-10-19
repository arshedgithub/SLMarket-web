import Link from "next/link";
import { Pin, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { campaignStats } from "@/lib/spotlight/admin";
import { CampaignActions } from "@/components/admin/spotlight/CampaignActions";
import { previewUrl } from "./_lib";

export const metadata = { title: "Spotlight campaigns" };

const STATUS_STYLE: Record<string, string> = {
  LIVE: "bg-emerald-50 text-emerald-800",
  SCHEDULED: "bg-blue-50 text-blue-800",
  PAUSED: "bg-amber-50 text-amber-800",
  DRAFT: "bg-gray-100 text-gray-700",
};

const fmtDate = (d: Date | null) =>
  d
    ? d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Colombo",
      })
    : "";

export default async function AdminSpotlightPage() {
  const campaigns = await db.spotlightCampaign.findMany({
    orderBy: [{ pinned: "desc" }, { tier: "asc" }, { createdAt: "desc" }],
    include: { businessProfile: { select: { name: true, slug: true } } },
  });
  const stats = await campaignStats(campaigns.map((c) => c.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Spotlight campaigns
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Sponsored slots between ads. Order: pinned, then tier, then fewest
            impressions today. Premium, top rated and verified businesses fill
            free slots without a campaign.
          </p>
        </div>
        <Link
          href="/admin/spotlight/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus aria-hidden className="h-4 w-4" />
          New campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-14 text-center">
          <p className="font-semibold text-gray-900">No campaigns yet</p>
          <p className="mt-1 text-sm text-gray-600">
            Until there are, eligible premium businesses fill the slots.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-700">
              <tr>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Runs</th>
                <th className="px-4 py-3">Targeting</th>
                <th className="px-4 py-3 text-right">Impressions</th>
                <th className="px-4 py-3 text-right">Clicks</th>
                <th className="px-4 py-3 text-right">Click rate</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map((c) => {
                const s = stats.get(c.id) ?? { impressions: 0, clicks: 0 };
                const thumb = previewUrl(c.imageId, 240);
                return (
                  <tr key={c.id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {thumb && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumb}
                              alt=""
                              className="h-full w-full object-cover"
                              style={{
                                objectPosition: `${c.focalX * 100}% ${c.focalY * 100}%`,
                              }}
                            />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 font-semibold text-gray-900">
                            {c.pinned && (
                              <Pin
                                aria-label="Pinned"
                                className="h-3.5 w-3.5 text-blue-700"
                              />
                            )}
                            <span className="truncate">
                              {c.headline ??
                                c.businessProfile?.name ??
                                c.altText ??
                                "Untitled"}
                            </span>
                          </p>
                          <p className="text-xs text-gray-600">
                            {c.kind === "BUSINESS"
                              ? "Premium business"
                              : "Image campaign"}
                            {c.businessProfile
                              ? ` · ${c.businessProfile.name}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[c.status]}`}
                      >
                        {c.status.charAt(0) + c.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{c.tier}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {c.startsAt || c.endsAt
                        ? `${fmtDate(c.startsAt) || "Now"} to ${fmtDate(c.endsAt) || "open"}`
                        : "Open"}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {[c.targetCategory, c.targetDistrict]
                        .filter(Boolean)
                        .join(" · ") || "Everywhere"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-900">
                      {s.impressions.toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-900">
                      {s.clicks.toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-900">
                      {s.impressions
                        ? `${((s.clicks / s.impressions) * 100).toFixed(1)}%`
                        : "0.0%"}
                    </td>
                    <td className="px-4 py-3">
                      <CampaignActions id={c.id} status={c.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
