"use client";

import Image from "next/image";
import { Check, Loader2, Save, X } from "lucide-react";

export function PostAdHeader({
  saveState,
  onClose,
  onSaveDraft,
}: {
  saveState: "idle" | "saving" | "saved";
  onClose: () => void;
  onSaveDraft: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-8">
      <Image
        src="/logo.webp"
        alt="SLMarket.lk"
        width={760}
        height={147}
        className="h-6 w-auto sm:h-7"
      />

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1.5 text-xs font-medium text-[var(--color-market-text-muted)] sm:flex">
          {saveState === "saving" && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
            </>
          )}
          {saveState === "saved" && (
            <>
              <Check className="h-3.5 w-3.5 text-[var(--color-market-success)]" />{" "}
              Draft saved
            </>
          )}
        </span>

        <button
          type="button"
          onClick={onSaveDraft}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-[var(--color-market-text-secondary)] transition hover:border-primary/40 hover:text-primary sm:text-sm"
        >
          <Save className="h-3.5 w-3.5" />
          Save Draft
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-market-text-muted)] transition hover:bg-background hover:text-[var(--color-market-text)]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
