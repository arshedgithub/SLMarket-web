"use client";

import {
  getFieldGroups,
  type ListingField,
} from "@/config/const/listingFields";
import { categories } from "@/config/const/navLinks";
import { DynamicField } from "../fields/DynamicField";
import { FieldShell, TextField, TextAreaField } from "../fields/Primitives";
import type { AdDraft } from "../types";

function isVisible(field: ListingField, attrs: AdDraft["attributes"]) {
  if (!field.showWhen) return true;
  const v = attrs[field.showWhen.key];
  return typeof v === "string" && field.showWhen.equals.includes(v);
}

export function StepDetails({
  draft,
  patch,
  patchAttr,
  errors,
}: {
  draft: AdDraft;
  patch: (p: Partial<AdDraft>) => void;
  patchAttr: (key: string, value: string | number | boolean) => void;
  errors: Record<string, string>;
}) {
  const cat = categories.find((c) => c.id === draft.categoryId);
  const groups = getFieldGroups(draft.categoryId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-market-text)] sm:text-2xl">
          Tell buyers about it
        </h2>
        <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
          Clear titles and honest details get more replies.
        </p>
      </div>

      <div className="space-y-5">
        <FieldShell
          label="Title"
          required
          hint={`${draft.title.length}/70`}
          error={errors.title}
        >
          <TextField
            value={draft.title}
            maxLength={70}
            placeholder={
              cat?.id === "jobs"
                ? "e.g. Delivery Rider – Colombo"
                : cat?.id === "property"
                  ? "e.g. 3BR House for Sale in Nugegoda"
                  : "e.g. Toyota Aqua 2015 – Excellent Condition"
            }
            onChange={(e) => patch({ title: e.target.value })}
          />
        </FieldShell>

        {groups.map((group) => {
          const visibleFields = group.fields.filter((f) =>
            isVisible(f, draft.attributes),
          );
          if (visibleFields.length === 0) return null;
          return (
            <div
              key={group.title}
              className="rounded-2xl border border-border bg-background p-5"
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-market-text-muted)]">
                {group.title}
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                {visibleFields.map((field) => (
                  <div
                    key={field.key}
                    className={
                      field.type === "segmented" ||
                      field.type === "chips" ||
                      field.type === "multichips"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <DynamicField
                      field={field}
                      value={draft.attributes[field.key]}
                      error={errors[`attr.${field.key}`]}
                      onChange={(v) => patchAttr(field.key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <FieldShell
          label="Description"
          required
          hint={`${draft.description.length}/2000`}
          error={errors.description}
        >
          <TextAreaField
            value={draft.description}
            maxLength={2000}
            placeholder="Condition, reason for selling, what's included, anything a buyer should know…"
            onChange={(e) => patch({ description: e.target.value })}
          />
        </FieldShell>
      </div>
    </div>
  );
}
