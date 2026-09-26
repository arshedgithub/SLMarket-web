import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// ─── Subscription plans ─────────────────────────────────────────────────────
// Business-profile paid plans aren't sold yet, but the rows exist so
// BusinessSubscription and the pricing page have real plans to point at.

async function seedPlans() {
  console.log("Seeding subscription plans...");

  const plans = [
    {
      name: "free",
      displayName: "Free",
      priceUsd: 0,
      priceLkr: 0,
      maxListings: 3,
      maxImagesPerListing: 3,
      maxBranches: 1,
      hasBusinessProfile: false,
      hasAnalytics: false,
      hasRealtimeAlerts: false,
      hasDigitalMarketing: false,
      hasWhatsappBroadcast: false,
      hasPrioritySearch: false,
      hasApiAccess: false,
      listingDurationDays: 30,
      monthlyFreeBoosts: 0,
      supportLevel: "community",
      badgeFastTrack: false,
      badgeFree: true,
      homepageFeatureWeekly: false,
      sortOrder: 0,
    },
    {
      name: "basic",
      displayName: "Basic",
      priceUsd: 9,
      priceLkr: 2900,
      maxListings: 15,
      maxImagesPerListing: 5,
      maxBranches: 2,
      hasBusinessProfile: true,
      hasAnalytics: false,
      hasRealtimeAlerts: true,
      hasDigitalMarketing: false,
      hasWhatsappBroadcast: false,
      hasPrioritySearch: false,
      hasApiAccess: false,
      listingDurationDays: 60,
      monthlyFreeBoosts: 1,
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
      priceLkr: 7900,
      maxListings: null,
      maxImagesPerListing: 8,
      maxBranches: 5,
      hasBusinessProfile: true,
      hasAnalytics: true,
      hasRealtimeAlerts: true,
      hasDigitalMarketing: true,
      hasWhatsappBroadcast: true,
      hasPrioritySearch: true,
      hasApiAccess: false,
      listingDurationDays: null,
      monthlyFreeBoosts: 5,
      supportLevel: "priority",
      badgeFastTrack: true,
      badgeFree: false,
      homepageFeatureWeekly: true,
      sortOrder: 2,
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
  return planRecords;
}

// ─── Business profiles ──────────────────────────────────────────────────────
// One demo owner per business, upserted by email so re-seeding is safe. The
// name/category/district/tier below match what the /listings page's sample
// businesses used to show, so switching that page over to real data later
// lands on familiar-looking content.

const CAT_IMG = "/images/marketplace/categories";

const BUSINESS_SEED = [
  {
    slug: "techzone-sri-lanka",
    name: "TechZone Sri Lanka",
    categoryId: "electronics",
    businessType: "STORE" as const,
    district: "Colombo",
    city: "Colombo",
    tier: "VERIFIED" as const,
    contactPhone: "0711000001",
    ownerEmail: "seed-techzone@demo.slmarket.lk",
    ownerName: "TechZone Sri Lanka",
    bio: "Authorised reseller of laptops, phones and audio gear, with full manufacturer warranty on every sale.",
    cover: `${CAT_IMG}/electronics.webp`,
  },
  {
    slug: "autohub-lk",
    name: "AutoHub LK",
    categoryId: "vehicles",
    businessType: "DEALER" as const,
    district: "Gampaha",
    city: "Gampaha",
    tier: "TOP_RATED" as const,
    contactPhone: "0711000002",
    ownerEmail: "seed-autohub@demo.slmarket.lk",
    ownerName: "AutoHub LK",
    bio: "Reconditioned and brand-new vehicle dealer serving the Gampaha and Colombo districts since 2015.",
    cover: `${CAT_IMG}/vehicles.webp`,
  },
  {
    slug: "homestyle",
    name: "HomeStyle",
    categoryId: "home-garden",
    businessType: "STORE" as const,
    district: "Kandy",
    city: "Kandy",
    tier: "PREMIUM" as const,
    contactPhone: "0711000003",
    ownerEmail: "seed-homestyle@demo.slmarket.lk",
    ownerName: "HomeStyle",
    bio: "Furniture and home decor studio, custom orders welcome.",
    cover: `${CAT_IMG}/home-garden.webp`,
  },
  {
    slug: "glamour-lk",
    name: "Glamour.lk",
    categoryId: "fashion",
    businessType: "STORE" as const,
    district: "Colombo",
    city: "Colombo",
    tier: "VERIFIED" as const,
    contactPhone: "0711000004",
    ownerEmail: "seed-glamour@demo.slmarket.lk",
    ownerName: "Glamour.lk",
    bio: "Women's fashion boutique with new arrivals every week.",
    cover: `${CAT_IMG}/fashion.webp`,
  },
  {
    slug: "petcare-lanka",
    name: "PetCare Lanka",
    categoryId: "animals-pets",
    businessType: "STORE" as const,
    district: "Gampaha",
    city: "Negombo",
    tier: "TOP_RATED" as const,
    contactPhone: "0711000005",
    ownerEmail: "seed-petcare@demo.slmarket.lk",
    ownerName: "PetCare Lanka",
    bio: "Responsible breeder and pet supplies shop, all animals vaccinated and health-checked.",
    cover: `${CAT_IMG}/animals.webp`,
  },
  {
    slug: "prime-estates",
    name: "Prime Estates",
    categoryId: "property",
    businessType: "AGENCY" as const,
    district: "Colombo",
    city: "Colombo",
    tier: "PREMIUM" as const,
    contactPhone: "0711000006",
    ownerEmail: "seed-primeestates@demo.slmarket.lk",
    ownerName: "Prime Estates",
    bio: "Licensed real estate agency covering land, houses and apartments across the Western Province.",
    cover: `${CAT_IMG}/property.webp`,
  },
  {
    slug: "fixit-services",
    name: "FixIt Services",
    categoryId: "services",
    businessType: "SERVICE_PROVIDER" as const,
    district: "Colombo",
    city: "Colombo",
    tier: "PREMIUM" as const,
    contactPhone: "0711000007",
    ownerEmail: "seed-fixit@demo.slmarket.lk",
    ownerName: "FixIt Services",
    bio: "Home repairs, appliance servicing and cleaning, same-day appointments available.",
    cover: `${CAT_IMG}/services.webp`,
  },
  {
    slug: "careerlink",
    name: "CareerLink",
    categoryId: "jobs",
    businessType: "AGENCY" as const,
    district: "Colombo",
    city: "Colombo",
    tier: "VERIFIED" as const,
    contactPhone: "0711000008",
    ownerEmail: "seed-careerlink@demo.slmarket.lk",
    ownerName: "CareerLink",
    bio: "Recruitment agency placing candidates in full-time and part-time roles across Sri Lanka.",
    cover: `${CAT_IMG}/jobs.webp`,
  },
];

async function seedBusinesses() {
  console.log("Seeding business profiles...");
  const owners: Record<string, string> = {};
  const businesses: Record<string, string> = {};

  for (const b of BUSINESS_SEED) {
    const owner = await db.user.upsert({
      where: { email: b.ownerEmail },
      update: { name: b.ownerName },
      create: {
        email: b.ownerEmail,
        name: b.ownerName,
        role: "USER",
        district: b.district,
      },
    });
    owners[b.slug] = owner.id;

    const business = await db.businessProfile.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        categoryId: b.categoryId,
        businessType: b.businessType,
        bio: b.bio,
        bannerUrl: b.cover,
        district: b.district,
        city: b.city,
        tier: b.tier,
        isVerified: true,
      },
      create: {
        ownerId: owner.id,
        name: b.name,
        slug: b.slug,
        categoryId: b.categoryId,
        businessType: b.businessType,
        bio: b.bio,
        bannerUrl: b.cover,
        contactPhone: b.contactPhone,
        district: b.district,
        city: b.city,
        tier: b.tier,
        isVerified: true,
      },
    });
    businesses[b.slug] = business.id;
    console.log(`  ✓ ${b.name}`);
  }
  return { owners, businesses };
}

// ─── Listings ────────────────────────────────────────────────────────────────
// Matches the content that used to live in the /listings page's in-browser
// sample array, so the transition to real data doesn't change what a visitor
// sees. `business` (a BUSINESS_SEED slug) posts it under that business
// profile; omitting it posts under a personal demo account instead.

const LISTING_SEED = [
  {
    slug: "toyota-aqua-2017",
    title: "Toyota Aqua 2017",
    categoryId: "vehicles",
    subcategoryId: "cars",
    description:
      "Well-maintained Toyota Aqua 2017, hybrid, automatic transmission. Single owner, full service history, accident-free.",
    district: "Colombo",
    city: "Colombo",
    price: 6950000,
    image: `${CAT_IMG}/vehicles.webp`,
    attrs: ["Hybrid", "Automatic", "2017"],
    featured: true,
    hoursAgo: 5,
  },
  {
    slug: "modern-house-for-rent-rajagiriya",
    title: "Modern House for Rent",
    categoryId: "property",
    subcategoryId: "houses-rent",
    description:
      "Spacious 3-bedroom modern house for rent in Rajagiriya, close to schools and main road access. Available immediately.",
    district: "Colombo",
    city: "Rajagiriya",
    price: 250000,
    image: `${CAT_IMG}/property.webp`,
    attrs: ["3 Beds", "3 Baths", "2,500 sq.ft"],
    negotiable: true,
    hoursAgo: 24,
    business: "prime-estates",
  },
  {
    slug: "iphone-13-128gb",
    title: "iPhone 13 128GB",
    categoryId: "electronics",
    subcategoryId: "mobile-phones",
    description:
      "iPhone 13, 128GB, like-new condition with original box and accessories. Battery health 92%.",
    district: "Colombo",
    city: "Colombo",
    price: 175000,
    // seed-only hint (not a DB field) — seedListings() turns this into a
    // genuine PriceHistory pair: held 10 days, dropped 2 days ago.
    priceDropFrom: 195000,
    image: `${CAT_IMG}/electronics.webp`,
    attrs: ["Like New", "128GB", "Original"],
    hoursAgo: 288,
    business: "techzone-sri-lanka",
  },
  {
    slug: "sofa-set-3-1-1",
    title: "Sofa Set (3+1+1)",
    categoryId: "home-garden",
    subcategoryId: "furniture",
    description:
      "Used sofa set in good condition, 3+1+1 seater, fabric upholstery. Pickup from Gampaha.",
    district: "Gampaha",
    city: "Gampaha",
    price: 85000,
    image: `${CAT_IMG}/home-garden.webp`,
    attrs: ["Used", "Good Condition"],
    hoursAgo: 3,
  },
  {
    slug: "dell-xps-13-laptop",
    title: "Dell XPS 13 Laptop",
    categoryId: "electronics",
    subcategoryId: "computers",
    description:
      "Dell XPS 13, Intel i7, 16GB RAM, 512GB SSD. Lightly used, excellent condition.",
    district: "Colombo",
    city: "Colombo",
    price: 299000,
    image: `${CAT_IMG}/electronics.webp`,
    attrs: ["i7", "16GB", "512GB SSD"],
    featured: true,
    promotionType: "COUPON" as const,
    promotionDetail: "10% off with code WELCOME10",
    hoursAgo: 4,
    business: "techzone-sri-lanka",
  },
  {
    slug: "yamaha-fz-s-v3",
    title: "Yamaha FZ-S V3",
    categoryId: "vehicles",
    subcategoryId: "motorbikes",
    description:
      "Yamaha FZ-S V3, 2019, 150cc, 32,000 km on the clock. Well maintained, all documents in order.",
    district: "Kandy",
    city: "Kandy",
    price: 780000,
    image: `${CAT_IMG}/vehicles.webp`,
    attrs: ["2019", "150cc", "32,000 km"],
    hoursAgo: 6,
  },
  {
    slug: "dining-table-set-negombo",
    title: "Dining Table Set",
    categoryId: "home-garden",
    subcategoryId: "furniture",
    description:
      "Solid wood dining table with 6 chairs, used but well cared for.",
    district: "Gampaha",
    city: "Negombo",
    price: 120000,
    image: `${CAT_IMG}/home-garden.webp`,
    attrs: ["6 Chairs", "Solid Wood"],
    hoursAgo: 24,
  },
  {
    slug: "canon-eos-250d",
    title: "Canon EOS 250D",
    categoryId: "electronics",
    subcategoryId: "cameras",
    description:
      "Canon EOS 250D DSLR with 18-55mm kit lens, 24.1MP, like-new condition, low shutter count.",
    district: "Colombo",
    city: "Colombo",
    price: 185000,
    image: `${CAT_IMG}/electronics.webp`,
    attrs: ["24.1MP", "With Lens", "Like New"],
    negotiable: true,
    hoursAgo: 24,
  },
  {
    slug: "3br-house-negombo",
    title: "3BR House, Negombo",
    categoryId: "property",
    subcategoryId: "houses-sale",
    description:
      "3-bedroom house for sale in Negombo, close to the beach and town centre.",
    district: "Gampaha",
    city: "Negombo",
    price: 18500000,
    image: `${CAT_IMG}/property.webp`,
    attrs: ["House", "3 Beds"],
    featured: true,
    hoursAgo: 48,
    business: "prime-estates",
  },
  {
    slug: "accountant-full-time-colombo",
    title: "Accountant (Full-time)",
    categoryId: "jobs",
    subcategoryId: "full-time",
    description:
      "Full-time accountant position, Colombo-based firm. 2+ years experience required.",
    district: "Colombo",
    city: "Colombo",
    price: 80000,
    pricingType: "STARTING_FROM" as const,
    image: `${CAT_IMG}/jobs.webp`,
    attrs: ["Full-time", "Colombo"],
    hoursAgo: 72,
    business: "careerlink",
  },
  {
    slug: "10-perches-land-gampaha",
    title: "10 Perches Land",
    categoryId: "property",
    subcategoryId: "land-sale",
    description:
      "10 perches of clear, freehold land in Gampaha, ready to build.",
    district: "Gampaha",
    city: "Gampaha",
    price: 2800000,
    image: `${CAT_IMG}/property.webp`,
    attrs: ["Land", "10 Perches"],
    hoursAgo: 96,
  },
  {
    slug: "designer-party-dress",
    title: "Designer Party Dress",
    categoryId: "fashion",
    subcategoryId: "womens-clothing",
    description: "Brand-new designer party dress, size M, never worn.",
    district: "Colombo",
    city: "Colombo",
    price: 6500,
    image: `${CAT_IMG}/fashion.webp`,
    attrs: ["Women", "Size M"],
    promotionType: "COUPON" as const,
    promotionDetail: "Buy 2 get 10% off",
    hoursAgo: 5,
    business: "glamour-lk",
  },
  {
    slug: "organic-spice-pack",
    title: "Organic Spice Pack",
    categoryId: "food",
    subcategoryId: "spices",
    description:
      "1kg organic spice pack, sourced directly from Matale growers.",
    district: "Matale",
    city: "Matale",
    price: 1200,
    image: `${CAT_IMG}/food.webp`,
    attrs: ["Organic", "1kg"],
    hoursAgo: 6,
  },
  {
    slug: "home-deep-cleaning-colombo",
    title: "Home Deep Cleaning",
    categoryId: "services",
    subcategoryId: "cleaning",
    description:
      "Professional home deep cleaning service, same-day booking, fully insured team.",
    district: "Colombo",
    city: "Colombo",
    price: 4500,
    image: `${CAT_IMG}/services.webp`,
    attrs: ["Same Day", "Insured"],
    hoursAgo: 24,
    business: "fixit-services",
  },
  {
    slug: "mountain-bike-21-speed",
    title: "Mountain Bike, 21-Speed",
    categoryId: "hobbies",
    subcategoryId: "cycling",
    description:
      "21-speed mountain bike in good working condition, recently serviced.",
    district: "Nuwara Eliya",
    city: "Nuwara Eliya",
    price: 32000,
    image: `${CAT_IMG}/hobbies.webp`,
    attrs: ["21-Speed", "Good Condition"],
    negotiable: true,
    hoursAgo: 48,
  },
  {
    slug: "labrador-puppies-kurunegala",
    title: "Labrador Puppies",
    categoryId: "animals-pets",
    subcategoryId: "dogs",
    description:
      "2-month-old Labrador puppies, vaccinated and dewormed, both parents on site.",
    district: "Kurunegala",
    city: "Kurunegala",
    price: 15000,
    image: `${CAT_IMG}/animals.webp`,
    attrs: ["Vaccinated", "2 Months"],
    featured: true,
    hoursAgo: 3,
    business: "petcare-lanka",
  },
  {
    slug: "tuition-physical-science-kandy",
    title: "Tuition, Physical Science",
    categoryId: "education",
    subcategoryId: "tuition-classes",
    description:
      "Physical Science tuition for grades 10-11, online classes available.",
    district: "Kandy",
    city: "Kandy",
    price: 3000,
    image: `${CAT_IMG}/education.webp`,
    attrs: ["Grade 10 to 11", "Online"],
    hoursAgo: 24,
  },
  {
    slug: "facial-skincare-package",
    title: "Facial & Skincare Package",
    categoryId: "health-beauty",
    subcategoryId: "skincare",
    description:
      "Full facial and skincare package at a Colombo salon, all skin types welcome.",
    district: "Colombo",
    city: "Colombo",
    price: 5000,
    image: `${CAT_IMG}/health-beauty.webp`,
    attrs: ["1 Hour", "All Skin Types"],
    hoursAgo: 8,
  },
];

async function seedListings(
  owners: Record<string, string>,
  businesses: Record<string, string>,
) {
  console.log("Seeding listings...");

  const personalSeller = await db.user.upsert({
    where: { email: "seed-personal-seller@demo.slmarket.lk" },
    update: {},
    create: {
      email: "seed-personal-seller@demo.slmarket.lk",
      name: "Demo Seller",
      role: "USER",
      district: "Colombo",
    },
  });

  for (const l of LISTING_SEED) {
    const sellerId = l.business ? owners[l.business] : personalSeller.id;
    const businessProfileId = l.business ? businesses[l.business] : null;
    const createdAt = new Date(Date.now() - l.hoursAgo * 3600 * 1000);

    const listing = await db.listing.upsert({
      where: { slug: l.slug },
      update: {
        title: l.title,
        description: l.description,
        price: l.price,
        status: "ACTIVE",
      },
      create: {
        sellerId,
        businessProfileId,
        title: l.title,
        slug: l.slug,
        description: l.description,
        categoryId: l.categoryId,
        subcategoryId: l.subcategoryId,
        attributes: { highlights: l.attrs },
        images: [l.image],
        pricingType: l.pricingType ?? "FIXED",
        price: l.price,
        negotiable: Boolean(l.negotiable),
        promotionType: l.promotionType ?? "NONE",
        promotionDetail: l.promotionDetail ?? null,
        district: l.district,
        city: l.city,
        isFeaturedHomepage: Boolean(l.featured),
        status: "ACTIVE",
        createdAt,
      },
    });

    const hasHistory = await db.priceHistory.findFirst({
      where: { listingId: listing.id },
      select: { id: true },
    });
    if (!hasHistory && l.price != null) {
      if (l.priceDropFrom) {
        const droppedAt = new Date(Date.now() - 2 * 24 * 3600 * 1000);
        const heldFrom = new Date(droppedAt.getTime() - 10 * 24 * 3600 * 1000);
        await db.priceHistory.createMany({
          data: [
            {
              listingId: listing.id,
              price: l.priceDropFrom,
              startedAt: heldFrom,
              endedAt: droppedAt,
            },
            { listingId: listing.id, price: l.price, startedAt: droppedAt },
          ],
        });
      } else {
        await db.priceHistory.create({
          data: { listingId: listing.id, price: l.price, startedAt: createdAt },
        });
      }
    }

    console.log(`  ✓ ${l.title}`);
  }
}

async function main() {
  await seedPlans();
  const { owners, businesses } = await seedBusinesses();
  await seedListings(owners, businesses);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
