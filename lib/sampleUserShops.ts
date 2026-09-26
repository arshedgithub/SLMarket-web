/*
 * Placeholder "my business profiles" data — used by the account/profile
 * menu (Navigation) and the post-ad flow's Location (branches) and Seller
 * steps. Real shop-account data (and branch management under Business
 * Profile → Locations & Branches) isn't built yet, so this stands in the
 * same way sample listings/shops stand in elsewhere in the app. Swap for a
 * real `db.shop.findMany({ where: { ownerId } })` query once that exists.
 */

export type SampleShopBranch = { id: string; label: string };

export type SampleUserShop = {
  id: string;
  name: string;
  category: string;
  location: string;
  verified: boolean;
  branches: SampleShopBranch[];
};

export const SAMPLE_USER_SHOPS: SampleUserShop[] = [
  {
    id: "greenfields",
    name: "GreenFields LK",
    category: "Agriculture & Farming",
    location: "Kurunegala",
    verified: true,
    branches: [
      { id: "kurunegala-main", label: "Kurunegala - Main Road" },
      { id: "kegalle-town", label: "Kegalle - Town Center" },
      { id: "puttalam-market", label: "Puttalam - Market Street" },
    ],
  },
  {
    id: "homestyle",
    name: "HomeStyle",
    category: "Home & Garden",
    location: "Colombo",
    verified: false,
    branches: [
      { id: "colombo-bambalapitiya", label: "Colombo - Bambalapitiya" },
    ],
  },
  {
    id: "techzone",
    name: "TechZone Sri Lanka",
    category: "Electronics",
    location: "Colombo",
    verified: true,
    branches: [
      { id: "colombo-bambalapitiya-2", label: "Colombo - Bambalapitiya" },
      { id: "kandy-peradeniya", label: "Kandy - Peradeniya Road" },
    ],
  },
];

export const ALL_SAMPLE_BRANCHES: (SampleShopBranch & { shopName: string })[] =
  SAMPLE_USER_SHOPS.flatMap((shop) =>
    shop.branches.map((b) => ({ ...b, shopName: shop.name })),
  );
