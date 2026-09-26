"use client";

import { Check, Globe2, MapPin, Store } from "lucide-react";
import {
  SRI_LANKA_DISTRICTS,
  flatCities,
} from "@/config/const/sriLankaLocations";
import { ALL_SAMPLE_BRANCHES } from "@/lib/sampleUserShops";
import { SelectField, ToggleRow } from "../fields/Primitives";
import type { AdDraft, LocationType } from "../types";

const LOCATION_TYPES: {
  value: LocationType;
  icon: typeof MapPin;
  title: string;
  desc: string;
}[] = [
  {
    value: "single",
    icon: MapPin,
    title: "One Location",
    desc: "Item/service is available from a specific place.",
  },
  {
    value: "branches",
    icon: Store,
    title: "Multiple Branches",
    desc: "Available from several shop locations.",
  },
  {
    value: "islandwide",
    icon: Globe2,
    title: "Islandwide",
    desc: "Available throughout Sri Lanka.",
  },
];

export function StepLocation({
  draft,
  patch,
  errors,
}: {
  draft: AdDraft;
  patch: (p: Partial<AdDraft>) => void;
  errors: Record<string, string>;
}) {
  const citiesForDistrict = draft.district
    ? (SRI_LANKA_DISTRICTS.find((d) => d.name === draft.district)?.cities ?? [])
    : [];

  const toggleBranch = (id: string) => {
    const set = new Set(draft.selectedBranchIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    patch({ selectedBranchIds: Array.from(set) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--color-market-text)]">
          Where is this listing available?
        </h2>
        <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
          Tell buyers where this item is available.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {LOCATION_TYPES.map((opt) => {
          const active = draft.locationType === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => patch({ locationType: opt.value })}
              className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all ${
                active
                  ? "border-primary bg-primary/[0.06] ring-1 ring-primary/25"
                  : "border-border bg-surface hover:border-primary/30"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  active
                    ? "bg-primary text-white"
                    : "bg-background text-primary"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-sm font-bold text-[var(--color-market-text)]">
                {opt.title}
              </span>
              <span className="text-xs text-[var(--color-market-text-muted)]">
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="space-y-5">
          {draft.locationType === "single" && (
            <div>
              <p className="mb-3 text-sm font-semibold text-[var(--color-market-text)]">
                Location details
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--color-market-text-muted)]">
                    District{" "}
                    <span className="text-[var(--color-market-danger)]">*</span>
                  </label>
                  <SelectField
                    placeholder="Select district"
                    value={draft.district}
                    onChange={(v) => patch({ district: v, city: "" })}
                  >
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--color-market-text-muted)]">
                    City / Town{" "}
                    <span className="text-[var(--color-market-danger)]">*</span>
                  </label>
                  <SelectField
                    placeholder="Select city"
                    value={draft.city}
                    disabled={!draft.district}
                    onChange={(v) => patch({ city: v })}
                  >
                    {citiesForDistrict.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </SelectField>
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold text-[var(--color-market-text-muted)]">
                  Area (optional)
                </label>
                <SelectField
                  placeholder="Select area"
                  value={draft.area}
                  onChange={(v) => patch({ area: v })}
                >
                  {flatCities
                    .filter((c) => c.district === draft.district)
                    .map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city}
                      </option>
                    ))}
                </SelectField>
              </div>
              {errors.city && (
                <p className="mt-2 text-xs font-medium text-[var(--color-market-danger)]">
                  {errors.city}
                </p>
              )}
            </div>
          )}

          {draft.locationType === "branches" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--color-market-text)]">
                  Available at
                </p>
                <button
                  type="button"
                  onClick={() =>
                    patch({
                      selectedBranchIds: ALL_SAMPLE_BRANCHES.map((b) => b.id),
                    })
                  }
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Select all branches
                </button>
              </div>
              <div className="space-y-2">
                {ALL_SAMPLE_BRANCHES.map((b) => {
                  const active = draft.selectedBranchIds.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBranch(b.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                        active
                          ? "border-primary bg-primary/[0.06]"
                          : "border-border bg-surface hover:border-primary/30"
                      }`}
                    >
                      <span
                        className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border-2 ${
                          active
                            ? "border-primary bg-primary text-white"
                            : "border-[var(--color-market-border-strong)]"
                        }`}
                      >
                        {active && <Check className="h-3 w-3" />}
                      </span>
                      <span className="text-sm font-medium text-[var(--color-market-text)]">
                        {b.label}
                      </span>
                      <span className="ml-auto text-xs text-[var(--color-market-text-muted)]">
                        {b.shopName}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.city && (
                <p className="mt-2 text-xs font-medium text-[var(--color-market-danger)]">
                  {errors.city}
                </p>
              )}
            </div>
          )}

          {draft.locationType === "islandwide" && (
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-[var(--color-market-text)]">
                <Globe2 className="h-4 w-4 text-primary" />
                Available Islandwide
              </p>
              <p className="mt-1.5 text-sm text-[var(--color-market-text-muted)]">
                Buyers anywhere in Sri Lanka can purchase or request this
                listing.
              </p>
            </div>
          )}

          {/* Delivery */}
          <div>
            <p className="mb-3 text-sm font-semibold text-[var(--color-market-text)]">
              Delivery options
            </p>
            <ToggleRow
              label="Delivery available"
              hint="You can deliver this item to buyers."
              checked={draft.deliveryAvailable}
              onChange={(v) => patch({ deliveryAvailable: v })}
            />
            {draft.deliveryAvailable && draft.locationType !== "islandwide" && (
              <label className="mt-3 flex cursor-pointer items-center gap-2.5 px-1 text-sm text-[var(--color-market-text-secondary)]">
                <input
                  type="checkbox"
                  checked={draft.islandwideDelivery}
                  onChange={(e) =>
                    patch({ islandwideDelivery: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                />
                Islandwide delivery available
              </label>
            )}
            {draft.deliveryAvailable && (
              <p className="mt-2 text-xs text-[var(--color-market-text-muted)]">
                You can still discuss delivery details with buyers via chat.
              </p>
            )}
          </div>
        </div>

        {/* Map preview */}
        {draft.locationType !== "islandwide" && (
          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className="relative flex h-40 items-center justify-center bg-[linear-gradient(135deg,#e7effc_0%,#f4f8fe_60%,#eaf1fc_100%)] dark:bg-[linear-gradient(135deg,#16243a_0%,#111d30_60%,#16243a_100%)]">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--color-market-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-market-border) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                <MapPin className="h-5 w-5" />
              </span>
            </div>
            <div className="p-3.5">
              <p className="text-sm font-bold text-[var(--color-market-text)]">
                {draft.city || draft.district || "Select a location"}
              </p>
              {draft.district && (
                <p className="text-xs text-[var(--color-market-text-muted)]">
                  {draft.district} District, Sri Lanka
                </p>
              )}
              <p className="mt-2 text-[11px] text-[var(--color-market-text-muted)]">
                Your exact address is never shown publicly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
