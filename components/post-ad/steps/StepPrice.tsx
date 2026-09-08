"use client";

import { Phone } from "lucide-react";
import { FieldShell, SegmentedControl, ToggleRow } from "../fields/Primitives";
import type { AdDraft, PriceMode } from "../types";

const MODE_LABEL: Record<PriceMode, string> = {
  fixed: "Fixed price",
  negotiable: "Negotiable",
  free: "Free",
  contact: "Contact for price",
};

export function StepPrice({
  draft,
  patch,
  errors,
}: {
  draft: AdDraft;
  patch: (p: Partial<AdDraft>) => void;
  errors: Record<string, string>;
}) {
  const isJob = draft.categoryId === "jobs";
  const isService = draft.categoryId === "services";
  const isRent =
    draft.categoryId === "property" &&
    draft.attributes.listingType === "Rent out";

  const priceLabel = isJob ? "Salary" : isService ? "Your rate" : "Price";

  const modes: PriceMode[] = isJob
    ? ["fixed", "negotiable", "contact"]
    : ["fixed", "negotiable", "free", "contact"];

  const showAmount =
    draft.priceMode === "fixed" || draft.priceMode === "negotiable";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-market-text)] sm:text-2xl">
          Set your {priceLabel.toLowerCase()}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
          You can always change this later.
        </p>
      </div>

      <FieldShell label={`${priceLabel} type`} required>
        <SegmentedControl
          options={modes.map((m) => MODE_LABEL[m])}
          value={MODE_LABEL[draft.priceMode]}
          onChange={(v) => {
            const mode = (Object.keys(MODE_LABEL) as PriceMode[]).find(
              (k) => MODE_LABEL[k] === v,
            );
            if (mode) patch({ priceMode: mode });
          }}
        />
      </FieldShell>

      {showAmount && (
        <FieldShell
          label={priceLabel}
          required
          hint={isRent ? "per month" : undefined}
          error={errors.price}
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--color-market-text-muted)]">
              Rs.
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={draft.price}
              placeholder="0"
              onChange={(e) => patch({ price: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-3.5 text-base font-semibold text-[var(--color-market-text)] outline-none transition placeholder:font-normal placeholder:text-[var(--color-market-text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            {isRent && (
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--color-market-text-muted)]">
                / month
              </span>
            )}
          </div>
        </FieldShell>
      )}

      {/* Contact */}
      <div className="space-y-4 rounded-2xl border border-border bg-background p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-market-text-muted)]">
          How buyers reach you
        </p>

        <FieldShell label="Phone number" required error={errors.contactPhone}>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-market-text-muted)]" />
            <input
              type="tel"
              value={draft.contactPhone}
              placeholder="07X XXX XXXX"
              onChange={(e) =>
                patch({ contactPhone: e.target.value.replace(/[^\d\s+]/g, "") })
              }
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3.5 text-sm text-[var(--color-market-text)] outline-none transition placeholder:text-[var(--color-market-text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </FieldShell>

        <ToggleRow
          label="Show my number on the listing"
          hint="Off means buyers can only reach you through in-app chat"
          checked={draft.showPhone}
          onChange={(v) => patch({ showPhone: v })}
        />
        <ToggleRow
          label="Allow WhatsApp messages"
          checked={draft.whatsapp}
          onChange={(v) => patch({ whatsapp: v })}
        />
      </div>
    </div>
  );
}
