"use client";

import { LocationPicker } from "../LocationPicker";
import type { AdDraft } from "../types";

export function StepLocation({
  draft,
  patch,
  errors,
}: {
  draft: AdDraft;
  patch: (p: Partial<AdDraft>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-market-text)] sm:text-2xl">
          Where is it?
        </h2>
        <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
          Buyers filter by area, so this really matters. Your exact address is
          never shown.
        </p>
      </div>

      <LocationPicker
        district={draft.district}
        city={draft.city}
        onChange={(next) => patch(next)}
      />

      {errors.city && (
        <p className="text-xs font-medium text-[var(--color-market-danger)]">
          {errors.city}
        </p>
      )}
    </div>
  );
}
