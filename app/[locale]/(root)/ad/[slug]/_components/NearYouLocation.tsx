"use client";

import { useEffect, useState } from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { nearestDistrict, rememberGpsDistrict } from "@/lib/listings/nearYou";

/*
 * GPS for "near you". Never asks uninvited: when the visitor has already
 * allowed location for the site it is used quietly; otherwise a small
 * "Use my location" button asks. The district goes into a cookie and the
 * page re-renders its recommendations from there.
 */
export function NearYouLocation({
  label,
  busyLabel,
}: {
  label: string;
  busyLabel: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<
    "unknown" | "prompt" | "granted" | "denied"
  >("unknown");
  const [busy, setBusy] = useState(false);

  const locate = () => {
    if (!navigator.geolocation) return;
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        setState("granted");
        const district = nearestDistrict(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        if (district && rememberGpsDistrict(district)) router.refresh();
      },
      () => {
        setBusy(false);
        setState("denied");
      },
      { maximumAge: 10 * 60 * 1000, timeout: 10_000 },
    );
  };

  useEffect(() => {
    let cancelled = false;
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((status) => {
        if (cancelled) return;
        setState(status.state as "prompt" | "granted" | "denied");
        if (status.state === "granted") locate();
      })
      .catch(() => setState("prompt"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state !== "prompt") return null;
  return (
    <button
      type="button"
      onClick={locate}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-60"
    >
      {busy ? (
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
      ) : (
        <LocateFixed aria-hidden className="h-4 w-4" />
      )}
      <span className="text-sm font-semibold">{busy ? busyLabel : label}</span>
    </button>
  );
}
