import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding subscription plans...");

  const plans = [
    {
      name: "free",
      displayName: "Free",
      priceUsd: 0,
      priceLkr: 0,
      priceUsdAnnual: 0,
      priceLkrAnnual: 0,
      maxListings: 3,
      maxReelsPerMonth: 0,
      maxImagesPerListing: 3,
      maxCertificationImages: 3,
      listingDurationDays: 30, // listings expire after 30 days
      hasShopProfile: false,
      hasAnalytics: false,
      hasRealtimeAlerts: false,
      hasDigitalMarketing: false,
      hasWhatsappBroadcast: false,
      hasPrioritySearch: false,
      hasApiAccess: false,
      hasWholesaleListings: false,
      monthlyFreeBoosts: 0,
      freeBoostsRemaining: 0,
      supportLevel: "community",
      badgeFastTrack: false,
      badgeFree: false,
      homepageFeatureWeekly: false,
      sortOrder: 0,
    },
    {
      name: "basic",
      displayName: "Basic",
      priceUsd: 9,
      priceLkr: 2970,
      priceUsdAnnual: 90,
      priceLkrAnnual: 29700,
      maxListings: 20,
      maxReelsPerMonth: 1,
      maxImagesPerListing: 5,
      maxCertificationImages: 5,
      listingDurationDays: 90, // listings expire after 90 days
      hasShopProfile: true,
      hasAnalytics: false,
      hasRealtimeAlerts: false,
      hasDigitalMarketing: false,
      hasWhatsappBroadcast: false,
      hasPrioritySearch: false,
      hasApiAccess: false,
      hasWholesaleListings: false,
      monthlyFreeBoosts: 1,
      freeBoostsRemaining: 1,
      supportLevel: "email",
      badgeFastTrack: false,
      badgeFree: false,
      homepageFeatureWeekly: false,
      sortOrder: 1,
    },
    {
      name: "pro",
      displayName: "Pro",
      priceUsd: 25,
      priceLkr: 8250,
      priceUsdAnnual: 250,
      priceLkrAnnual: 82500,
      maxListings: null,
      maxReelsPerMonth: null,
      maxImagesPerListing: 7,
      maxCertificationImages: 5,
      listingDurationDays: 180, // listings expire after 180 days
      hasShopProfile: true,
      hasAnalytics: true,
      hasRealtimeAlerts: true,
      hasDigitalMarketing: true,
      hasWhatsappBroadcast: false,
      hasPrioritySearch: true,
      hasApiAccess: false,
      hasWholesaleListings: false,
      monthlyFreeBoosts: 3,
      freeBoostsRemaining: 3,
      supportLevel: "priority",
      badgeFastTrack: true,
      badgeFree: false,
      homepageFeatureWeekly: false,
      sortOrder: 2,
    },
    {
      name: "dealer",
      displayName: "Dealer",
      priceUsd: 60,
      priceLkr: 19800,
      priceUsdAnnual: 600,
      priceLkrAnnual: 198000,
      maxListings: null,
      maxReelsPerMonth: null,
      maxImagesPerListing: 7,
      maxCertificationImages: 5,
      listingDurationDays: null, // never expires
      hasShopProfile: true,
      hasAnalytics: true,
      hasRealtimeAlerts: true,
      hasDigitalMarketing: true,
      hasWhatsappBroadcast: true,
      hasPrioritySearch: true,
      hasApiAccess: true,
      hasWholesaleListings: true,
      monthlyFreeBoosts: 7,
      freeBoostsRemaining: 7,
      supportLevel: "dedicated",
      badgeFastTrack: true,
      badgeFree: true,
      homepageFeatureWeekly: true,
      sortOrder: 3,
    },
  ];

  const planRecords: Record<string, { id: string }> = {};
  for (const plan of plans) {
    planRecords[plan.name] = await db.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`  ✓ ${plan.displayName} plan`);
  }

  const coupons = [
    {
      code: "WELCOME50",
      description: "50% off all plans",
      discountType: "PERCENTAGE" as const,
      discountValue: 50,
      applicablePlanIds: [],
      billingCycle: null,
      maxUses: 200,
      maxUsesPerUser: 1,
      isActive: true,
    },
    {
      code: "ANNUAL20",
      description: "20% off when billed annually",
      discountType: "PERCENTAGE" as const,
      discountValue: 20,
      applicablePlanIds: [],
      billingCycle: "ANNUAL" as const,
      maxUses: null,
      maxUsesPerUser: 1,
      isActive: true,
    },
    {
      code: "PROFREE",
      description: "Pro plan free",
      discountType: "PERCENTAGE" as const,
      discountValue: 100,
      applicablePlanIds: [planRecords.pro.id],
      billingCycle: null,
      maxUses: 100,
      maxUsesPerUser: 1,
      isActive: true,
    },
  ];

  for (const coupon of coupons) {
    await db.couponCode.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
    console.log(`  ✓ Coupon: ${coupon.code}`);
  }

  await seedDemoContent(planRecords);

  console.log("Seed complete!");
}

// ─── Demo sellers + listings ────────────────────────────────────────────────
// Gives the homepage (featured/new-arrival carousels, featured shops,
// category grids) something real to render instead of its empty-state
// fallbacks. Reuses the category browsing images already in /public so this
// doesn't depend on any external image host. Upserted by email/slug so
// re-running `npm run seed` is safe.

const GEM_IMG = (name: string) => `/images/categories/gems/${name}`;
const JEWELLERY_IMG = (name: string) => `/images/categories/jewellery/${name}`;
const METAL_IMG = (name: string) =>
  `/images/categories/precious-metals/${name}`;
const SERVICE_IMG = (name: string) => `/images/categories/services/${name}`;

async function seedDemoContent(planRecords: Record<string, { id: string }>) {
  console.log("Seeding demo sellers...");

  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const sellers = [
    {
      email: "seed-ceylon-gem-traders@lumevelo.demo",
      name: "Ceylon Gem Traders",
      role: "SELLER" as const,
      isVerified: true,
      country: "LK",
      locationCity: "Ratnapura, Sri Lanka",
      shopSlug: "ceylon-gem-traders",
      shopBio:
        "Third-generation Ratnapura gem dealers specialising in certified Ceylon sapphires and rubies, exported worldwide since 1985.",
      shopBannerUrl: GEM_IMG("all.png"),
      specialties: ["Sapphire", "Ruby", "Certification"],
      plan: "dealer",
      kind: "premium" as const,
    },
    {
      email: "seed-royal-sapphire-house@lumevelo.demo",
      name: "Royal Sapphire House",
      role: "SELLER" as const,
      isVerified: true,
      country: "LK",
      locationCity: "Colombo, Sri Lanka",
      shopSlug: "royal-sapphire-house",
      shopBio:
        "Fine jewellery house crafting bespoke sapphire and diamond pieces, with an in-house GIA-trained gemmologist on every order.",
      shopBannerUrl: JEWELLERY_IMG("all.png"),
      specialties: ["Fine Jewellery", "Custom Design", "Diamonds"],
      plan: "pro",
      kind: "premium" as const,
    },
    {
      email: "seed-goldmark-bullion@lumevelo.demo",
      name: "Goldmark Bullion",
      role: "SELLER" as const,
      isVerified: true,
      country: "LK",
      locationCity: "Kandy, Sri Lanka",
      shopSlug: "goldmark-bullion",
      shopBio:
        "Licensed precious metals dealer trading certified 22K/24K gold and silver bullion at live market rates.",
      shopBannerUrl: METAL_IMG("all.png"),
      specialties: ["Gold", "Silver", "Bullion"],
      plan: "pro",
      kind: "premium" as const,
    },
    {
      email: "seed-anura-perera@lumevelo.demo",
      name: "Anura Perera",
      role: "SELLER" as const,
      isVerified: false,
      country: "LK",
      locationCity: "Galle, Sri Lanka",
      shopSlug: null,
      shopBio: null,
      shopBannerUrl: null,
      specialties: ["Loose Gemstones"],
      plan: "free",
      kind: "individual" as const,
    },
    {
      email: "seed-nadeesha-silva@lumevelo.demo",
      name: "Nadeesha Silva",
      role: "SELLER" as const,
      isVerified: false,
      country: "LK",
      locationCity: "Negombo, Sri Lanka",
      shopSlug: null,
      shopBio: null,
      shopBannerUrl: null,
      specialties: ["Handmade Jewellery"],
      plan: "basic",
      kind: "individual" as const,
    },
  ];

  const sellerRecords: Record<string, { id: string; name: string }> = {};
  for (const s of sellers) {
    const user = await db.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        isVerified: s.isVerified,
        country: s.country,
        locationCity: s.locationCity,
        shopSlug: s.shopSlug,
        shopBio: s.shopBio,
        shopBannerUrl: s.shopBannerUrl,
        specialties: s.specialties,
      },
      create: {
        email: s.email,
        name: s.name,
        role: s.role,
        isVerified: s.isVerified,
        country: s.country,
        locationCity: s.locationCity,
        shopSlug: s.shopSlug,
        shopBio: s.shopBio,
        shopBannerUrl: s.shopBannerUrl,
        specialties: s.specialties,
      },
    });
    sellerRecords[s.email] = user;

    await db.sellerSubscription.upsert({
      where: { sellerId: user.id },
      update: { planId: planRecords[s.plan].id, status: "ACTIVE" },
      create: {
        sellerId: user.id,
        planId: planRecords[s.plan].id,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: oneYearFromNow,
      },
    });
    console.log(
      `  ✓ ${s.kind === "premium" ? "Premium shop" : "Individual seller"}: ${s.name}`,
    );
  }

  const ceylon = sellerRecords["seed-ceylon-gem-traders@lumevelo.demo"].id;
  const royal = sellerRecords["seed-royal-sapphire-house@lumevelo.demo"].id;
  const goldmark = sellerRecords["seed-goldmark-bullion@lumevelo.demo"].id;
  const anura = sellerRecords["seed-anura-perera@lumevelo.demo"].id;
  const nadeesha = sellerRecords["seed-nadeesha-silva@lumevelo.demo"].id;

  console.log("Seeding demo listings...");

  const listings = [
    // Gems
    {
      slug: "ceylon-blue-sapphire-4-25ct",
      sellerId: ceylon,
      title: "Natural Ceylon Blue Sapphire",
      description:
        "Unheated oval-cut blue sapphire from Ratnapura, GIA certified with excellent cornflower-blue colour and clarity.",
      price: 4250,
      images: [GEM_IMG("sapphire.webp")],
      category: "GEM" as const,
      gemType: "Sapphire",
      gemOrigin: "Sri Lanka",
      caratWeight: 4.25,
      treatmentStatus: "unheated",
      certificationBody: "GIA",
      currentLocation: "Ratnapura",
      isFeaturedHomepage: true,
      isBoosted: true,
    },
    {
      slug: "emerald-cut-emerald-5-12ct",
      sellerId: ceylon,
      title: "Emerald Cut Colombian Emerald",
      description:
        "Vivid green emerald-cut emerald with minor oil treatment, accompanied by a Gübelin report.",
      price: 3850,
      images: [GEM_IMG("emerald.png")],
      category: "GEM" as const,
      gemType: "Emerald",
      gemOrigin: "Colombia",
      caratWeight: 5.12,
      treatmentStatus: "fracture-filled",
      certificationBody: "Gübelin",
      currentLocation: "Colombo",
      isFeaturedHomepage: true,
      isBoosted: false,
    },
    {
      slug: "ruby-gemstone-3-18ct",
      sellerId: anura,
      title: "Mozambique Ruby Gemstone",
      description:
        "Rich pigeon-blood red ruby, oval cut, heated for colour enhancement — a classic ruby for fine jewellery.",
      price: 2780,
      images: [GEM_IMG("ruby.png")],
      category: "GEM" as const,
      gemType: "Ruby",
      gemOrigin: "Mozambique",
      caratWeight: 3.18,
      treatmentStatus: "heated",
      currentLocation: "Galle",
      isFeaturedHomepage: false,
      isBoosted: false,
    },
    {
      slug: "yellow-sapphire-cushion-2-45ct",
      sellerId: ceylon,
      title: "Yellow Sapphire Cushion Cut",
      description:
        "Bright canary-yellow Ceylon sapphire, cushion cut, unheated with a lively brilliance.",
      price: 1125,
      images: [GEM_IMG("other-gems.png")],
      category: "GEM" as const,
      gemType: "Yellow Sapphire",
      gemOrigin: "Sri Lanka",
      caratWeight: 2.45,
      treatmentStatus: "unheated",
      currentLocation: "Ratnapura",
      isFeaturedHomepage: false,
      isBoosted: false,
    },
    {
      slug: "tanzanite-pear-2-78ct",
      sellerId: anura,
      title: "Tanzanite Gemstone Pear Cut",
      description:
        "Violet-blue tanzanite, pear cut, heat-treated (standard for tanzanite) with excellent transparency.",
      price: 890,
      images: [GEM_IMG("tourmaline.png")],
      category: "GEM" as const,
      gemType: "Tanzanite",
      gemOrigin: "Tanzania",
      caratWeight: 2.78,
      treatmentStatus: "heated",
      currentLocation: "Galle",
      isFeaturedHomepage: true,
      isBoosted: false,
    },
    // Jewellery
    {
      slug: "diamond-ring-18k-white-gold",
      sellerId: royal,
      title: "Diamond Solitaire Ring, 18K White Gold",
      description:
        "Classic six-prong solitaire engagement ring, 1.2ct centre diamond set in 18K white gold.",
      price: 4950,
      images: [JEWELLERY_IMG("rings.png")],
      category: "JEWELLERY" as const,
      jewelleryType: "Rings",
      metalType: "White Gold",
      metalPurity: "18K",
      gemType: "Diamond",
      currentLocation: "Colombo",
      isFeaturedHomepage: true,
      isBoosted: true,
    },
    {
      slug: "sapphire-pendant-necklace",
      sellerId: royal,
      title: "Blue Sapphire Pendant Necklace",
      description:
        "Elegant halo pendant featuring a natural Ceylon sapphire surrounded by pavé diamonds, on an 18-inch chain.",
      price: 2150,
      images: [JEWELLERY_IMG("necklaces.png")],
      category: "JEWELLERY" as const,
      jewelleryType: "Necklaces",
      metalType: "Yellow Gold",
      metalPurity: "18K",
      gemType: "Sapphire",
      currentLocation: "Colombo",
      isFeaturedHomepage: false,
      isBoosted: false,
    },
    {
      slug: "handmade-gemstone-earrings",
      sellerId: nadeesha,
      title: "Handmade Gemstone Drop Earrings",
      description:
        "Artisan-crafted sterling silver drop earrings set with mixed semi-precious gemstones.",
      price: 145,
      images: [JEWELLERY_IMG("earrings.png")],
      category: "JEWELLERY" as const,
      jewelleryType: "Earrings",
      metalType: "Silver",
      metalPurity: "925",
      currentLocation: "Negombo",
      isFeaturedHomepage: false,
      isBoosted: false,
    },
    {
      slug: "wedding-set-bridal-jewellery",
      sellerId: royal,
      title: "Bridal Wedding & Engagement Set",
      description:
        "Matching ring, earring and pendant bridal set in 18K gold with brilliant-cut diamond accents.",
      price: 6200,
      images: [JEWELLERY_IMG("wedding_sets.png")],
      category: "JEWELLERY" as const,
      jewelleryType: "Wedding & Engagement Sets",
      metalType: "Yellow Gold",
      metalPurity: "18K",
      currentLocation: "Colombo",
      isFeaturedHomepage: true,
      isBoosted: false,
    },
    // Precious metals
    {
      slug: "gold-bar-22k-10g",
      sellerId: goldmark,
      title: "22K Gold Bar, 10 Grams",
      description:
        "Assay-certified 22K gold bar, 10g, hallmarked with serial number and purity stamp.",
      price: 780,
      images: [METAL_IMG("gold.png")],
      category: "PRECIOUS_METAL" as const,
      metalType: "Gold",
      metalPurity: "22K",
      weightGrams: 10,
      currentLocation: "Kandy",
      isFeaturedHomepage: true,
      isBoosted: false,
    },
    {
      slug: "silver-bullion-coin-set",
      sellerId: goldmark,
      title: "Silver Bullion Coin Set (10 x 1oz)",
      description:
        "Ten 1oz .999 fine silver bullion coins, sealed mint tube, ideal for investment or gifting.",
      price: 320,
      images: [METAL_IMG("silver.png")],
      category: "PRECIOUS_METAL" as const,
      metalType: "Silver",
      metalPurity: "999",
      weightGrams: 311,
      currentLocation: "Kandy",
      isFeaturedHomepage: false,
      isBoosted: false,
    },
    {
      slug: "platinum-ingot-5g",
      sellerId: goldmark,
      title: "Platinum Ingot, 5 Grams",
      description:
        "Investment-grade platinum ingot, 5g, with certificate of authenticity.",
      price: 260,
      images: [METAL_IMG("platinum.png")],
      category: "PRECIOUS_METAL" as const,
      metalType: "Platinum",
      metalPurity: "999",
      weightGrams: 5,
      currentLocation: "Kandy",
      isFeaturedHomepage: false,
      isBoosted: false,
    },
    // Services
    {
      slug: "gem-certification-service",
      sellerId: ceylon,
      title: "Gem Certification & Grading",
      description:
        "Independent certification and grading for coloured gemstones, with detailed reports covering origin, treatment and clarity.",
      price: 75,
      images: [SERVICE_IMG("certification.png")],
      category: "SERVICE" as const,
      serviceType: "Gem Certification",
      pricingType: "starting from",
      turnaroundTime: "3-5 business days",
      serviceArea: ["Colombo", "Ratnapura"],
      currentLocation: "Ratnapura",
      isFeaturedHomepage: false,
      isBoosted: false,
    },
    {
      slug: "custom-jewellery-design-service",
      sellerId: royal,
      title: "Custom Jewellery Design",
      description:
        "Bespoke jewellery design service — from concept sketches to finished piece, tailored to your style and budget.",
      price: 200,
      images: [SERVICE_IMG("custom_design.png")],
      category: "SERVICE" as const,
      serviceType: "Custom Jewellery Design",
      pricingType: "starting from",
      turnaroundTime: "2-4 weeks",
      serviceArea: ["Island-wide"],
      currentLocation: "Colombo",
      isFeaturedHomepage: true,
      isBoosted: false,
    },
    {
      slug: "jewellery-repair-polishing-service",
      sellerId: nadeesha,
      title: "Jewellery Repair & Polishing",
      description:
        "Professional repair, resizing and polishing for rings, chains and bracelets. Free quote before any work begins.",
      price: 25,
      images: [SERVICE_IMG("repair.png")],
      category: "SERVICE" as const,
      serviceType: "Jewellery Repair & Polishing",
      pricingType: "starting from",
      turnaroundTime: "1-2 business days",
      serviceArea: ["Negombo", "Colombo"],
      currentLocation: "Negombo",
      isFeaturedHomepage: false,
      isBoosted: false,
    },
    {
      slug: "gold-metal-testing-service",
      sellerId: goldmark,
      title: "Gold & Metal Purity Testing",
      description:
        "Non-destructive XRF testing for gold, silver and platinum purity — instant results while you wait.",
      price: 15,
      images: [SERVICE_IMG("gold_testing.png")],
      category: "SERVICE" as const,
      serviceType: "Gold & Metal Testing",
      pricingType: "fixed",
      turnaroundTime: "Same day",
      serviceArea: ["Kandy"],
      currentLocation: "Kandy",
      isFeaturedHomepage: false,
      isBoosted: false,
    },
  ];

  for (const listing of listings) {
    const { slug, ...data } = listing;
    await db.listing.upsert({
      where: { slug },
      update: { ...data, currency: "USD", status: "ACTIVE" },
      create: { slug, ...data, currency: "USD", status: "ACTIVE" },
    });
    console.log(`  ✓ Listing: ${listing.title}`);
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
