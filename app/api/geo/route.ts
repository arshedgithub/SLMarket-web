import { NextRequest, NextResponse } from "next/server";
import { SRI_LANKA_DISTRICTS } from "@/config/const/sriLankaLocations";

export const dynamic = "force-dynamic";

/*
 * GET: the visitor's likely district, from the town their connection comes
 * from (Vercel's IP location header), for prefilling "where" in the
 * homepage search. No permission prompt, nothing stored. null when the
 * town is unknown or outside Sri Lanka.
 */
export function GET(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country");
  const rawCity = req.headers.get("x-vercel-ip-city");
  if (country !== "LK" || !rawCity)
    return NextResponse.json({ district: null });
  const city = decodeURIComponent(rawCity).toLowerCase();
  const district =
    SRI_LANKA_DISTRICTS.find(
      (d) =>
        d.name.toLowerCase() === city ||
        d.cities.some((c) => c.toLowerCase() === city),
    )?.name ?? null;
  return NextResponse.json(
    { district },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
