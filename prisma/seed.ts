// The app's client: on Neon it connects over HTTPS/WebSockets (port 443),
// which works on networks that block the Postgres port.
import { db } from "../lib/db";
import {
  RETIRED_SEED_SLUGS,
  SEED_AD_DETAILS,
  SEED_AD_EXTRA_PHOTOS,
  SEED_PHOTO_FOCUS,
  SEED_PHOTOS,
} from "./seed-data";

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

// Demo photos live in the development Cloudinary account (see
// prisma/seed-data.ts SEED_PHOTOS), never in the repo.
const COVER = (id: string) => `${SEED_PHOTOS}/business-covers/${id}.webp`;
const LISTING_IMG = `${SEED_PHOTOS}/listings`;

// Demo shop pins (plausible points in each town, not real addresses).
const SHOP_LOCATION: Record<string, { latitude: number; longitude: number }> = {
  "techzone-sri-lanka": { latitude: 6.8897, longitude: 79.8562 },
  careerlink: { latitude: 6.9101, longitude: 79.8516 },
  "fixit-services": { latitude: 6.8925, longitude: 79.877 },
  "glamour-lk": { latitude: 6.9067, longitude: 79.8634 },
  "prime-estates": { latitude: 6.9105, longitude: 79.8669 },
  homestyle: { latitude: 7.2936, longitude: 80.635 },
  "petcare-lanka": { latitude: 7.2083, longitude: 79.8358 },
  "autohub-lk": { latitude: 7.0917, longitude: 79.9997 },
  "digital-hub": { latitude: 6.8935, longitude: 79.8553 },
};

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
    cover: COVER("electronics"),
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
    cover: COVER("vehicles"),
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
    cover: COVER("home-garden"),
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
    cover: COVER("fashion"),
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
    cover: COVER("animals-pets"),
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
    cover: COVER("property"),
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
    cover: COVER("services"),
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
    cover: COVER("jobs"),
  },
  {
    slug: "digital-hub",
    name: "Digital Hub",
    categoryId: "electronics",
    businessType: "STORE" as const,
    district: "Colombo",
    city: "Colombo",
    tier: "PREMIUM" as const,
    contactPhone: "0711000009",
    ownerEmail: "seed-digitalhub@demo.slmarket.lk",
    ownerName: "Digital Hub",
    bio: "Laptops, phones and audio from Apple, Dell and Lenovo, with shop warranty and islandwide delivery.",
    cover: COVER("electronics"),
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
        ...SHOP_LOCATION[b.slug],
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
        ...SHOP_LOCATION[b.slug],
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
    slug: "toyota-vios-2014",
    title: "Toyota Vios 2014",
    categoryId: "vehicles",
    subcategoryId: "cars",
    description:
      "Well-maintained Toyota Vios 2014, 1300cc petrol, automatic. Two owners, full service history, accident-free.",
    district: "Colombo",
    city: "Colombo",
    price: 5650000,
    image: `${LISTING_IMG}/toyota-vios.webp`,
    attrs: ["Petrol", "Automatic", "2014"],
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
    image: `${LISTING_IMG}/modern-house-rent.webp`,
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
    image: `${LISTING_IMG}/iphone-13.webp`,
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
    image: `${LISTING_IMG}/sofa-set.webp`,
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
    image: `${LISTING_IMG}/dell-xps-13.webp`,
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
    image: `${LISTING_IMG}/yamaha-fz-s.webp`,
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
    image: `${LISTING_IMG}/dining-table.webp`,
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
    image: `${LISTING_IMG}/canon-eos-250d.webp`,
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
    image: `${LISTING_IMG}/house-negombo.webp`,
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
    // Job ads have no photo: they show as a text card.
    image: null,
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
    image: `${LISTING_IMG}/land-gampaha.webp`,
    attrs: ["Land", "10 Perches"],
    hoursAgo: 96,
  },
  {
    slug: "designer-party-dress",
    title: "Designer Party Dress",
    categoryId: "fashion",
    subcategoryId: "womens-clothing",
    description:
      "Brand-new ivory party dress, size M, never worn. Sweetheart neckline with a beaded lace waist.",
    district: "Colombo",
    city: "Colombo",
    price: 6500,
    image: `${LISTING_IMG}/party-dress.webp`,
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
    image: `${LISTING_IMG}/spice-pack.webp`,
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
    image: `${LISTING_IMG}/deep-cleaning.webp`,
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
    image: `${LISTING_IMG}/mountain-bike.webp`,
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
    image: `${LISTING_IMG}/labrador-puppy.webp`,
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
    image: `${LISTING_IMG}/tuition-science.webp`,
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
    image: `${LISTING_IMG}/facial-skincare.webp`,
    attrs: ["1 Hour", "All Skin Types"],
    hoursAgo: 8,
  },
  {
    slug: "honda-vezel-2016-galle",
    title: "Honda Vezel 2016",
    categoryId: "vehicles",
    subcategoryId: "cars",
    description:
      "Hybrid SUV in very good condition, regularly serviced, second owner.",
    district: "Galle",
    city: "Galle",
    price: 6850000,
    image: `${LISTING_IMG}/honda-vezel.webp`,
    attrs: ["Hybrid", "Automatic", "2016"],
    hoursAgo: 48,
  },
  {
    slug: "bajaj-three-wheeler-gampaha",
    title: "Bajaj Three Wheeler",
    categoryId: "vehicles",
    subcategoryId: "three-wheelers",
    description:
      "Bajaj RE 4 stroke, 2019, well maintained and ready to run. Documents clear.",
    district: "Gampaha",
    city: "Gampaha",
    price: 1150000,
    negotiable: true,
    image: `${LISTING_IMG}/bajaj-three-wheeler.webp`,
    attrs: ["Petrol", "Manual", "2019"],
    hoursAgo: 24,
  },
  {
    slug: "apartment-for-rent-colombo",
    title: "Apartment for Rent",
    categoryId: "property",
    subcategoryId: "apartments",
    description:
      "Sea view apartment with parking and 24 hour security, fully furnished.",
    district: "Colombo",
    city: "Colombo",
    price: 120000,
    image: `${LISTING_IMG}/apartment-sea-view.webp`,
    attrs: ["2 Beds", "2 Baths", "1,150 sq.ft"],
    hoursAgo: 48,
    business: "prime-estates",
  },
  {
    slug: "macbook-air-m1",
    title: "MacBook Air M1",
    categoryId: "electronics",
    subcategoryId: "computers",
    description:
      "8GB RAM, 256GB SSD, battery health 94%. Comes with the original charger.",
    district: "Colombo",
    city: "Colombo",
    price: 285000,
    image: `${LISTING_IMG}/macbook-air-m1.webp`,
    attrs: ["Like New", "8GB RAM", "256GB SSD"],
    hoursAgo: 3,
    business: "digital-hub",
  },
  {
    slug: "iphone-14-128gb-kandy",
    title: "iPhone 14 128GB",
    categoryId: "electronics",
    subcategoryId: "mobile-phones",
    description:
      "iPhone 14, 128GB, like new with 5 months of Apple warranty left.",
    district: "Kandy",
    city: "Kandy",
    price: 249000,
    image: `${LISTING_IMG}/iphone-14.webp`,
    attrs: ["Like New", "128GB", "Original"],
    hoursAgo: 6,
    business: "digital-hub",
  },
  {
    slug: "airpods-pro-2",
    title: "AirPods Pro 2",
    categoryId: "electronics",
    subcategoryId: "audio",
    description:
      "Brand new, sealed AirPods Pro (2nd generation) with USB-C case.",
    district: "Kandy",
    city: "Kandy",
    price: 62000,
    image: `${LISTING_IMG}/airpods-pro.webp`,
    attrs: ["Brand New", "USB-C", "Sealed"],
    hoursAgo: 24,
    business: "digital-hub",
  },
];

async function seedListings(
  owners: Record<string, string>,
  businesses: Record<string, string>,
) {
  console.log("Seeding listings...");

  const personalSeller = await db.user.upsert({
    where: { email: "seed-personal-seller@demo.slmarket.lk" },
    // A demo number (not a real person's) so private-seller contact,
    // including the email check before the number shows, can be tried.
    update: { phone: "94770000099", phoneVerified: true },
    create: {
      email: "seed-personal-seller@demo.slmarket.lk",
      name: "Demo Seller",
      role: "USER",
      district: "Colombo",
      phone: "94770000099",
      phoneVerified: true,
    },
  });

  await db.listing.deleteMany({ where: { slug: { in: RETIRED_SEED_SLUGS } } });

  for (const l of LISTING_SEED) {
    const sellerId = l.business ? owners[l.business] : personalSeller.id;
    const businessProfileId = l.business ? businesses[l.business] : null;
    const createdAt = new Date(Date.now() - l.hoursAgo * 3600 * 1000);
    // Structured details (listingFields keys) next to the card highlights.
    const attributes = { highlights: l.attrs, ...SEED_AD_DETAILS[l.slug] };
    const images = [
      ...(l.image ? [l.image] : []),
      ...(SEED_AD_EXTRA_PHOTOS[l.slug] ?? []),
    ];
    const focus = SEED_PHOTO_FOCUS[l.slug];
    const photoFocus = focus ? [focus] : undefined;

    const listing = await db.listing.upsert({
      where: { slug: l.slug },
      update: {
        title: l.title,
        description: l.description,
        price: l.price,
        attributes,
        images,
        photoFocus,
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
        attributes,
        images,
        photoFocus,
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
