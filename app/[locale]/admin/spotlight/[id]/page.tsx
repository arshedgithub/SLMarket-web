import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CampaignForm } from "@/components/admin/spotlight/CampaignForm";
import { campaignStats } from "@/lib/spotlight/admin";
import { CATEGORY_OPTIONS, DISTRICT_OPTIONS, toFormValue } from "../_lib";

export const metadata = { title: "Edit spotlight campaign" };

export default async function EditSpotlightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await db.spotlightCampaign.findUnique({
    where: { id },
    include: { businessProfile: { select: { slug: true } } },
  });
  if (!campaign) notFound();
  const stats = (await campaignStats([id])).get(id) ?? {
    impressions: 0,
    clicks: 0,
  };
  const ctr = stats.impressions
    ? ((stats.clicks / stats.impressions) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Edit spotlight campaign
        </h1>
        <dl className="mt-3 flex flex-wrap gap-3 text-sm">
          {[
            ["Impressions", stats.impressions.toLocaleString("en-US")],
            ["Clicks", stats.clicks.toLocaleString("en-US")],
            ["Click rate", `${ctr}%`],
          ].map(([k, val]) => (
            <div
              key={k}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2"
            >
              <dt className="text-xs font-semibold text-gray-600">{k}</dt>
              <dd className="text-base font-bold text-gray-900">{val}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-gray-600">
          An impression counts when half the slot has been on screen for a
          second.
        </p>
      </div>
      <CampaignForm
        id={id}
        initial={toFormValue(campaign)}
        initialDates={{
          startsAt: campaign.startsAt?.toISOString() ?? null,
          endsAt: campaign.endsAt?.toISOString() ?? null,
        }}
        categories={CATEGORY_OPTIONS}
        districts={DISTRICT_OPTIONS}
      />
    </div>
  );
}
