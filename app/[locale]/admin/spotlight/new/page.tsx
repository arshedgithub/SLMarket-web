import {
  CampaignForm,
  EMPTY_CAMPAIGN,
} from "@/components/admin/spotlight/CampaignForm";
import { CATEGORY_OPTIONS, DISTRICT_OPTIONS } from "../_lib";

export const metadata = { title: "New spotlight campaign" };

export default function NewSpotlightPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          New spotlight campaign
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Shown in the sponsored slots between ads. Every slot is labelled
          Sponsored.
        </p>
      </div>
      <CampaignForm
        initial={EMPTY_CAMPAIGN}
        categories={CATEGORY_OPTIONS}
        districts={DISTRICT_OPTIONS}
      />
    </div>
  );
}
