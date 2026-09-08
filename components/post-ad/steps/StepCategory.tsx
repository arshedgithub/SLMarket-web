"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { categories } from "@/config/const/navLinks";
import type { AdDraft } from "../types";

export function StepCategory({
  draft,
  patch,
}: {
  draft: AdDraft;
  patch: (p: Partial<AdDraft>) => void;
}) {
  const active = categories.find((c) => c.id === draft.categoryId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-market-text)] sm:text-2xl">
          What are you posting?
        </h2>
        <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
          Pick a category. We&apos;ll tailor the next steps to it.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const selected = draft.categoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                patch({
                  categoryId: cat.id,
                  subcategoryId: "",
                  attributes: {},
                })
              }
              className={`group relative overflow-hidden rounded-2xl border text-left transition-all ${
                selected
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-border hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <div className="relative aspect-[1.3] overflow-hidden bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-900">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 45vw, 220px"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                {selected && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <p className="px-3 py-2.5 text-sm font-semibold text-[var(--color-market-text)]">
                {cat.name}
              </p>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="mb-3 text-sm font-semibold text-[var(--color-market-text)]">
            Which best describes it?
          </p>
          <div className="flex flex-wrap gap-2">
            {active.subcategories.map((sub) => {
              const selected = draft.subcategoryId === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => patch({ subcategoryId: sub.id })}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-[var(--color-market-text-secondary)] hover:border-primary/40 hover:text-[var(--color-market-text)]"
                  }`}
                >
                  {selected && <Check className="h-3.5 w-3.5" />}
                  {sub.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
