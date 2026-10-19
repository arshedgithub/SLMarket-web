"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

type Status = "ACTIVE" | "RESERVED" | "SOLD";

export type OwnerLabels = {
  markSold: string;
  markReserved: string;
  markAvailable: string;
  failed: string;
};

// The owner's status buttons on their own ad (PATCH /api/listings/ad/<id>).
export function OwnerActions({
  listingId,
  status,
  labels,
}: {
  listingId: string;
  status: Status;
  labels: OwnerLabels;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<Status | null>(null);
  const [error, setError] = useState("");

  async function set(next: Status) {
    setBusy(next);
    setError("");
    const res = await fetch(`/api/listings/ad/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => null);
    setBusy(null);
    if (!res?.ok) return setError(labels.failed);
    router.refresh();
  }

  const options: { to: Status; label: string; Icon: typeof Clock }[] = [
    ...(status !== "SOLD"
      ? [{ to: "SOLD" as const, label: labels.markSold, Icon: CheckCircle2 }]
      : []),
    ...(status === "ACTIVE"
      ? [{ to: "RESERVED" as const, label: labels.markReserved, Icon: Clock }]
      : []),
    ...(status !== "ACTIVE"
      ? [
          {
            to: "ACTIVE" as const,
            label: labels.markAvailable,
            Icon: RotateCcw,
          },
        ]
      : []),
  ];

  return (
    <div className="mt-2 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {options.map(({ to, label, Icon }) => (
          <button
            key={to}
            type="button"
            onClick={() => set(to)}
            disabled={busy !== null}
            className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[var(--color-market-border-strong)] bg-[var(--color-market-surface)] text-[color:var(--color-market-text)] transition hover:border-blue-300 disabled:opacity-60"
          >
            {busy === to ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon aria-hidden className="h-4 w-4" />
            )}
            <span className="text-sm font-semibold">{label}</span>
          </button>
        ))}
      </div>
      {error && (
        <p role="status" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
