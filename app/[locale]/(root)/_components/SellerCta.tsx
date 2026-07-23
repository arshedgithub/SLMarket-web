"use client";

import { ArrowRight, Store } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSellerCta } from "@/hooks/useSellerCta";

// Home page CTAs that depend on the viewer's session (guest vs. seller).
// Pulled out as client components so the home page itself has no
// per-request auth() call and can be safely served as static/ISR HTML —
// otherwise whichever visitor's session triggered the first render would
// get baked into the cached page for everyone until the next revalidation.
export function HeroSellerLink() {
  const { isSeller, href } = useSellerCta();
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 border-2 border-white/70 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
    >
      <Store className="w-4 h-4" />{" "}
      {isSeller ? "Go to Seller Dashboard" : "Become a Seller"}
    </Link>
  );
}

export function BottomSellerCta() {
  const { isSeller, href } = useSellerCta();
  return (
    <>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
        {isSeller
          ? "Manage Your Shop on Lumevelo"
          : "Sell Your Gems, Jewellery, or Services on Lumevelo"}
      </h2>
      <p className="text-gray-200 max-w-2xl mx-auto mb-6">
        {isSeller
          ? "List new inventory, track enquiries, and grow your shop's reach on Lumevelo."
          : "Set up your shop, list your inventory, and reach buyers actively searching for certified gems, precious metals, and jewellery."}
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 bg-white text-primary-dark font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {isSeller ? "Go to Dashboard" : "Start Selling"}{" "}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </>
  );
}
