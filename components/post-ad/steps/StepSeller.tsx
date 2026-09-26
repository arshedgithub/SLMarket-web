"use client";

import { BadgeCheck, Info, Phone, Plus, Store, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SAMPLE_USER_SHOPS } from "@/lib/sampleUserShops";
import { FieldShell, ToggleRow } from "../fields/Primitives";
import type { AdDraft } from "../types";

export function StepSeller({
  draft,
  patch,
  errors,
  sellerName,
}: {
  draft: AdDraft;
  patch: (p: Partial<AdDraft>) => void;
  errors: Record<string, string>;
  sellerName: string;
}) {
  const selectedShop = SAMPLE_USER_SHOPS.find((s) => s.id === draft.shopId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-[var(--color-market-text)]">
          Publish as
        </h2>
        <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
          Choose whether to post this listing from your personal account or a
          shop.
        </p>
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => patch({ sellerMode: "personal", shopId: "" })}
          className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
            draft.sellerMode === "personal"
              ? "border-primary bg-primary/[0.06] ring-1 ring-primary/25"
              : "border-border bg-surface hover:border-primary/30"
          }`}
        >
          <span
            className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 ${
              draft.sellerMode === "personal"
                ? "border-primary"
                : "border-[var(--color-market-border-strong)]"
            }`}
          >
            {draft.sellerMode === "personal" && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-[var(--color-market-text-secondary)]">
            <User className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold text-[var(--color-market-text)]">
              {sellerName}
            </span>
            <span className="text-xs text-[var(--color-market-text-muted)]">
              Personal listing
            </span>
          </span>
        </button>

        {SAMPLE_USER_SHOPS.map((shop) => {
          const active =
            draft.sellerMode === "shop" && draft.shopId === shop.id;
          return (
            <button
              key={shop.id}
              type="button"
              onClick={() => patch({ sellerMode: "shop", shopId: shop.id })}
              className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                active
                  ? "border-primary bg-primary/[0.06] ring-1 ring-primary/25"
                  : "border-border bg-surface hover:border-primary/30"
              }`}
            >
              <span
                className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 ${
                  active
                    ? "border-primary"
                    : "border-[var(--color-market-border-strong)]"
                }`}
              >
                {active && <span className="h-2 w-2 rounded-full bg-primary" />}
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Store className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-bold text-[var(--color-market-text)]">
                    {shop.name}
                  </span>
                  {shop.verified && (
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </span>
                <span className="text-xs text-[var(--color-market-text-muted)]">
                  {shop.category} · {shop.location}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-background px-2.5 py-1 text-[11px] font-semibold text-[var(--color-market-text-secondary)]">
                {shop.branches.length} Branch
                {shop.branches.length === 1 ? "" : "es"}
              </span>
            </button>
          );
        })}

        <Link
          href="/business/new"
          className="flex w-full items-center gap-3.5 rounded-2xl border border-dashed border-border p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/[0.03]"
        >
          <span className="flex h-4.5 w-4.5 shrink-0" />
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-primary">
            <Plus className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold text-primary">
              Create shop profile
            </span>
            <span className="text-xs text-[var(--color-market-text-muted)]">
              Set up a business profile to sell under a shop name
            </span>
          </span>
        </Link>
      </div>

      {(selectedShop || SAMPLE_USER_SHOPS.length > 0) && (
        <p className="flex items-start gap-2 rounded-xl bg-background p-3.5 text-xs text-[var(--color-market-text-secondary)]">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          {selectedShop
            ? `This listing will also appear in ${selectedShop.name}'s business profile.`
            : "Listings posted from a shop will also be visible on your business profile page and help you reach more buyers."}
        </p>
      )}

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
