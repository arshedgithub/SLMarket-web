// Client-side ad analytics (see app/api/ads/events/route.ts). sendBeacon
// survives the page navigating away (WhatsApp, tel: links), and failures
// are ignored: analytics never gets in the way of a buyer.
export function trackAd(
  event: string,
  data: Record<string, string | number | boolean | null>,
) {
  try {
    const body = JSON.stringify({ event, data });
    if (navigator.sendBeacon?.("/api/ads/events", body)) return;
    void fetch("/api/ads/events", {
      method: "POST",
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
