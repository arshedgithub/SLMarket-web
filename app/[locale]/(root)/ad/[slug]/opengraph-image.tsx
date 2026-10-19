import { ImageResponse } from "next/og";
import { getAdView } from "@/lib/listings/adView";
import { categories } from "@/config/const/navLinks";

export const alt = "Listing preview on SLMarket.lk";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function categoryLabel(categoryId: string | undefined) {
  if (!categoryId) return "Listing";
  return categories.find((c) => c.id === categoryId)?.name ?? "Listing";
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getAdView(slug);

  const title = listing?.title ?? "SLMarket.lk Listing";
  // Ads are shared on WhatsApp constantly: the preview carries the price.
  const price =
    listing?.priceRange ??
    (listing?.price != null && listing.pricingType !== "CONTACT"
      ? `Rs. ${listing.price.toLocaleString("en-US")}`
      : null);
  // The renderer fetches images itself, so a site path needs the origin.
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://slmarket.lk";
  const photo = listing?.photos[0];
  const image = photo ? new URL(photo, base).toString() : undefined;
  const label = categoryLabel(listing?.categoryId);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0c1a30",
          fontFamily: "sans-serif",
        }}
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(180deg, rgba(12,26,48,0.05) 0%, rgba(12,26,48,0.55) 55%, rgba(12,26,48,0.97) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#1557d6",
                color: "white",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              SL
            </div>
            <span style={{ color: "white", fontSize: 26, fontWeight: 700 }}>
              SLMarket<span style={{ color: "#ffd166" }}>.lk</span>
            </span>
          </div>

          <span
            style={{
              display: "flex",
              color: "#fbbf24",
              fontSize: 20,
              fontWeight: 600,
              marginTop: 28,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {label}
          </span>

          <div
            style={{
              display: "flex",
              color: "white",
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.2,
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
          {price && (
            <div
              style={{
                display: "flex",
                color: "#ffd166",
                fontSize: 40,
                fontWeight: 800,
                marginTop: 14,
              }}
            >
              {price}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
