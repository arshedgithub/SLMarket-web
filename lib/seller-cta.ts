// Pure href/label-key mapping used by useSellerCta — kept separate so the
// rule itself lives in one place even though every caller today is
// client-side. Returns a translation key (nav.json) rather than literal
// text so every caller renders it in the viewer's locale instead of
// hardcoded English.
export function getSellerCta(isSeller: boolean): {
  href: string;
  labelKey: "sellerDashboard" | "startSelling";
} {
  return isSeller
    ? { href: "/dashboard", labelKey: "sellerDashboard" }
    : { href: "/seller-registration", labelKey: "startSelling" };
}
