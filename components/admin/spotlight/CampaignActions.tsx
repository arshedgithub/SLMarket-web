"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function CampaignActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function call(method: "PATCH" | "DELETE", body?: unknown) {
    setBusy(true);
    const res = await fetch(`/api/admin/spotlight/${id}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      window.alert("That did not work. Please try again.");
      return;
    }
    router.refresh();
  }

  const btn =
    "h-9 rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-800 hover:border-blue-500 disabled:opacity-60";

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Link
        href={`/admin/spotlight/${id}`}
        className={`${btn} inline-flex items-center`}
      >
        Edit
      </Link>
      {status === "LIVE" || status === "SCHEDULED" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => call("PATCH", { status: "PAUSED" })}
          className={btn}
        >
          Pause
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => call("PATCH", { status: "LIVE" })}
          className={btn}
        >
          {status === "DRAFT" ? "Go live" : "Resume"}
        </button>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          window.confirm(
            "Delete this campaign? Its stats stay in the totals.",
          ) && call("DELETE")
        }
        className={`${btn} text-red-700 hover:border-red-500`}
      >
        Delete
      </button>
    </div>
  );
}
