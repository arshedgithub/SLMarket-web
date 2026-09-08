export interface MegaMenuAdSlide {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  href: string;
  cta?: string;
}

const marketplaceMegaMenuAds: MegaMenuAdSlide[] = [
  {
    id: "vehicles",
    title: "Your next vehicle is here",
    subtitle: "Cars, bikes, vans and three-wheelers from local sellers",
    image: "/images/marketplace/categories/vehicles.webp",
    href: "/vehicles",
    cta: "Browse vehicles",
  },
  {
    id: "property",
    title: "Find your next home",
    subtitle: "Houses, land and apartments across Sri Lanka",
    image: "/images/marketplace/categories/property.webp",
    href: "/property",
    cta: "Explore property",
  },
  {
    id: "electronics",
    title: "Great tech. Better prices.",
    subtitle: "Phones, laptops, cameras and accessories",
    image: "/images/marketplace/categories/electronics.webp",
    href: "/electronics",
    cta: "Shop electronics",
  },
  {
    id: "land",
    title: "Land for every plan",
    subtitle: "Residential, agricultural and commercial plots",
    image: "/images/marketplace/categories/agriculture.webp",
    href: "/property?type=land-sale",
    cta: "View land",
  },
];

export async function getMegaMenuAds(): Promise<MegaMenuAdSlide[]> {
  /*
   * Kept async so it can later be swapped for database/CMS-driven
   * promotions without touching Navigation.
   */
  return marketplaceMegaMenuAds;
}
