import {
  sampleListings,
  sampleShops,
  type SampleListing,
  type SampleShop,
} from "@/app/[locale]/(root)/ads/_components/data";
import { hoursTableFrom } from "./hours";
import { getDirectoryBusinessBySlug } from "./directory/sampleDirectory";
import type { DirectoryBusiness } from "./directory/types";
import { slugify } from "./slug";
import type {
  ImageCrop,
  StorefrontBusiness,
  StorefrontProduct,
} from "./storefront";

/*
 * SAMPLE storefront data, in the same spirit as the /ads sample data: a
 * complete visual state until the schema and admin tools feed real content.
 * Never shown for a slug that has a real BusinessProfile row (see
 * getStorefront.ts). Contains made-up names, numbers and reviews.
 */

const CAT = "/images/marketplace/categories";
const ELECTRONICS = `${CAT}/electronics.webp`;

// Different parts of the one electronics photo (laptop left, phone centre,
// headphones right, earbuds case and watch low).
const CROP = {
  laptop: { x: 22, y: 55, zoom: 1.45 },
  phone: { x: 57, y: 52, zoom: 2.1 },
  headphones: { x: 88, y: 55, zoom: 1.9 },
  earbuds: { x: 46, y: 88, zoom: 2.7 },
  watch: { x: 72, y: 80, zoom: 2.5 },
  wide: { x: 50, y: 60, zoom: 1 },
} satisfies Record<string, ImageCrop>;

const iso = (now: Date, days: number) =>
  new Date(now.getTime() + days * 86_400_000).toISOString();

type P = Omit<StorefrontProduct, "image" | "href" | "collections" | "specs"> & {
  crop: ImageCrop;
  specs: string[];
  collections?: string[];
};

function product(p: P): StorefrontProduct {
  return {
    ...p,
    image: ELECTRONICS,
    href: `/ads/electronics?q=${encodeURIComponent(p.title)}`,
    collections: p.collections ?? [],
  };
}

function digitalHub(now: Date): StorefrontBusiness {
  const products: StorefrontProduct[] = [
    product({
      id: "dh1",
      title: 'MacBook Air M1 13" 256GB',
      price: 285000,
      condition: "new",
      warranty: { kind: "company", months: 12 },
      instalment: { provider: "epp", months: 12 },
      availability: "in-stock",
      deliveryDays: [1, 3],
      specs: ["256GB", "8GB RAM", "Apple M1"],
      category: "laptops",
      brand: "Apple",
      collections: ["apple-zone", "new-arrivals", "work-from-home"],
      addedDaysAgo: 3,
      pinned: true,
      crop: CROP.laptop,
    }),
    product({
      id: "dh2",
      title: "iPhone 14 128GB",
      price: 175000,
      lowestPrice30d: 195000,
      condition: "new",
      warranty: { kind: "company", months: 12 },
      instalment: { provider: "epp", months: 12 },
      availability: "in-stock",
      deliveryDays: [1, 3],
      specs: ["128GB", '6.1"', "iOS"],
      category: "phones",
      brand: "Apple",
      collections: ["apple-zone", "new-arrivals"],
      addedDaysAgo: 5,
      pinned: true,
      crop: CROP.phone,
    }),
    product({
      id: "dh3",
      title: "AirPods Pro 2 (USB-C)",
      price: 62000,
      condition: "new",
      warranty: { kind: "company", months: 12 },
      instalment: { provider: "koko", months: 3 },
      availability: "in-stock",
      deliveryDays: [1, 3],
      specs: ["USB-C", "ANC"],
      category: "audio",
      brand: "Apple",
      collections: ["apple-zone", "audio"],
      addedDaysAgo: 9,
      pinned: true,
      crop: CROP.earbuds,
    }),
    product({
      id: "dh4",
      title: "Dell XPS 13 Laptop",
      price: 299000,
      condition: "new",
      warranty: { kind: "company", months: 24 },
      instalment: { provider: "epp", months: 12 },
      availability: "few-left",
      deliveryDays: [1, 3],
      specs: ["i7", "16GB", "512GB SSD"],
      category: "laptops",
      brand: "Dell",
      collections: ["work-from-home"],
      addedDaysAgo: 20,
      pinned: true,
      crop: CROP.laptop,
    }),
    product({
      id: "dh5",
      title: "Sony WH-1000XM5",
      price: 125000,
      condition: "new",
      warranty: { kind: "company", months: 12 },
      instalment: { provider: "koko", months: 3 },
      availability: "in-stock",
      deliveryDays: [1, 3],
      specs: ["Wireless", "ANC", "30h"],
      category: "audio",
      brand: "Sony",
      collections: ["audio"],
      addedDaysAgo: 12,
      crop: CROP.headphones,
    }),
    product({
      id: "dh6",
      title: "Canon EOS 250D",
      price: 185000,
      condition: "used",
      warranty: { kind: "shop", months: 6 },
      availability: "in-stock",
      deliveryDays: [1, 3],
      specs: ["24.1MP", "With lens"],
      category: "cameras",
      brand: "Canon",
      addedDaysAgo: 30,
      negotiable: true,
      crop: CROP.wide,
    }),
    product({
      id: "dh7",
      title: "iPhone 13 128GB",
      price: 145000,
      condition: "used",
      warranty: { kind: "shop", months: 6 },
      availability: "in-stock",
      deliveryDays: [1, 3],
      specs: ["128GB", "Battery 91%"],
      category: "phones",
      brand: "Apple",
      collections: ["apple-zone"],
      addedDaysAgo: 16,
      crop: CROP.phone,
    }),
    product({
      id: "dh8",
      title: "Samsung Galaxy A54",
      price: 89000,
      condition: "new",
      warranty: { kind: "company", months: 12 },
      instalment: { provider: "koko", months: 3 },
      availability: "in-stock",
      deliveryDays: [1, 3],
      specs: ["128GB", "8GB RAM"],
      category: "phones",
      brand: "Samsung",
      addedDaysAgo: 25,
      crop: CROP.phone,
    }),
    product({
      id: "dh9",
      title: "Logitech Wireless Mouse",
      price: 9500,
      condition: "new",
      warranty: { kind: "shop", months: 6 },
      availability: "in-stock",
      deliveryDays: [1, 3],
      specs: ["Bluetooth", "Silent click"],
      category: "accessories",
      brand: "Logitech",
      collections: ["under-50k", "work-from-home"],
      addedDaysAgo: 40,
      crop: CROP.earbuds,
    }),
    product({
      id: "dh10",
      title: "7-in-1 USB-C Hub",
      price: 6900,
      condition: "new",
      warranty: { kind: "shop", months: 6 },
      availability: "in-stock",
      deliveryDays: [1, 3],
      specs: ["HDMI", "USB 3.0", "SD"],
      category: "accessories",
      collections: ["under-50k", "work-from-home"],
      addedDaysAgo: 45,
      crop: CROP.earbuds,
    }),
    product({
      id: "dh11",
      title: "Lenovo ThinkPad E14",
      price: 215000,
      condition: "reconditioned",
      warranty: { kind: "shop", months: 6 },
      availability: "few-left",
      deliveryDays: [1, 3],
      specs: ["i5", "16GB", "512GB SSD"],
      category: "laptops",
      brand: "Lenovo",
      collections: ["work-from-home"],
      addedDaysAgo: 22,
      crop: CROP.laptop,
    }),
    product({
      id: "dh12",
      title: "ASUS ROG Strix G15",
      price: 340000,
      condition: "new",
      warranty: { kind: "company", months: 24 },
      instalment: { provider: "epp", months: 12 },
      availability: "pre-order",
      deliveryDays: [7, 10],
      specs: ["RTX 4060", "16GB", "1TB SSD"],
      category: "gaming",
      brand: "ASUS",
      collections: ["gaming-setup", "new-arrivals"],
      addedDaysAgo: 2,
      crop: CROP.laptop,
    }),
    product({
      id: "dh13",
      title: "PS5 DualSense Controller",
      price: 24500,
      condition: "new",
      warranty: { kind: "shop", months: 3 },
      availability: "in-stock",
      deliveryDays: [1, 3],
      specs: ["Wireless", "Haptic"],
      category: "gaming",
      brand: "Sony",
      collections: ["gaming-setup", "under-50k"],
      addedDaysAgo: 18,
      crop: CROP.headphones,
    }),
    product({
      id: "dh14",
      title: "HP LaserJet Pro Printer",
      price: 48000,
      condition: "new",
      warranty: { kind: "company", months: 12 },
      availability: "in-stock",
      deliveryDays: [1, 3],
      specs: ["Mono", "Wi-Fi"],
      category: "accessories",
      brand: "HP",
      collections: ["work-from-home", "under-50k"],
      addedDaysAgo: 35,
      crop: CROP.wide,
    }),
    product({
      id: "dh15",
      title: "Apple Watch Series 8",
      price: 118000,
      condition: "used",
      warranty: { kind: "shop", months: 3 },
      availability: "sold",
      specs: ["45mm", "GPS"],
      category: "accessories",
      brand: "Apple",
      collections: ["apple-zone"],
      addedDaysAgo: 50,
      crop: CROP.watch,
    }),
    product({
      id: "dh16",
      title: "Anker 20,000mAh Power Bank",
      price: 12500,
      condition: "new",
      warranty: { kind: "shop", months: 6 },
      availability: "in-stock",
      deliveryDays: [1, 3],
      specs: ["20,000mAh", "PD 20W"],
      category: "accessories",
      collections: ["under-50k"],
      addedDaysAgo: 28,
      crop: CROP.watch,
    }),
    product({
      id: "dh17",
      title: "JBL Flip 6 Speaker",
      price: 38500,
      condition: "new",
      warranty: { kind: "company", months: 12 },
      availability: "in-stock",
      deliveryDays: [1, 3],
      specs: ["Waterproof", "12h"],
      category: "audio",
      brand: "JBL",
      collections: ["audio", "under-50k"],
      addedDaysAgo: 14,
      crop: CROP.headphones,
    }),
  ];

  return {
    slug: "digital-hub",
    name: "Digital Hub",
    tagline: "Your trusted tech partner in Sri Lanka",
    itemsKind: "products",
    categoryId: "electronics",
    categoryName: "Electronics",
    city: "Kandy",
    district: "Kandy",
    cover: ELECTRONICS,
    coverCrop: CROP.wide,
    brandColor: "#0c1f5e",
    logo: null,
    verified: true,
    verification: {
      phone: "2024-01-10",
      registration: "2024-01-12",
      address: "2024-01-15",
      authorisedDealer: "2024-01-20",
    },
    legalName: "Digital Hub (Pvt) Ltd",
    registrationNumber: "PV 00123456",
    registeredAddress: "123 Peradeniya Road, Kandy 20000",
    sinceYear: 2024,
    establishedYear: 2020,
    followers: 1240,
    rating: { average: 4.6, count: 38, distribution: [68, 18, 8, 3, 3] },
    response: { conversations: 38, medianMinutes: 35, replyRate: 0.92 },
    openingHours: {
      days: [1, 2, 3, 4, 5, 6],
      openMinute: 9 * 60,
      closeMinute: 19 * 60,
      overrides: { 0: { openMinute: 9 * 60, closeMinute: 17 * 60 } },
    },
    hoursSet: true,
    hoursTable: [
      {
        label: "Mon to Sat",
        value: "9:00 AM to 7:00 PM",
        days: [1, 2, 3, 4, 5, 6],
      },
      { label: "Sunday", value: "9:00 AM to 5:00 PM", days: [0] },
      { label: "Poya days", value: "Closed" },
      { label: "Public holidays", value: "9:00 AM to 5:00 PM" },
    ],
    phone: "94711000009",
    whatsapp: "94711000009",
    primaryAction: "whatsapp",
    highlights: [
      {
        key: "delivery",
        policy:
          "Islandwide delivery in 1 to 3 working days. Free delivery on orders above Rs. 50,000.",
      },
      {
        key: "warranty",
        policy:
          "Company warranty on new devices from Apple, Dell and Sony. Shop warranty of 6 months on used and reconditioned devices.",
      },
      {
        key: "easyPayments",
        policy:
          "Card EPP up to 12 months on selected products, and KOKO on selected accessories and phones.",
      },
      {
        key: "cod",
        policy: "Cash on delivery in Kandy, Colombo and Gampaha.",
      },
    ],
    collections: [
      {
        id: "new-arrivals",
        name: "New Arrivals",
        image: ELECTRONICS,
        crop: CROP.laptop,
      },
      {
        id: "apple-zone",
        name: "Apple Zone",
        image: ELECTRONICS,
        crop: CROP.phone,
      },
      {
        id: "gaming-setup",
        name: "Gaming Setup",
        image: ELECTRONICS,
        crop: CROP.headphones,
      },
      {
        id: "under-50k",
        name: "Under Rs. 50,000",
        image: ELECTRONICS,
        crop: CROP.earbuds,
      },
      {
        id: "work-from-home",
        name: "Work from Home",
        image: ELECTRONICS,
        crop: CROP.wide,
      },
      {
        id: "audio",
        name: "Audio & Headphones",
        image: ELECTRONICS,
        crop: CROP.headphones,
      },
    ],
    products,
    offers: [
      {
        id: "of1",
        title: "10% off all laptops",
        description: "Valid on selected laptops. Min. spend Rs. 100,000.",
        code: "WELCOME10",
        badge: "10% OFF",
        endsAt: iso(now, 3),
        image: ELECTRONICS,
        crop: CROP.laptop,
      },
      {
        id: "of2",
        title: "Free wireless mouse",
        description: "With selected laptops. While stocks last.",
        badge: "Free Gift",
        endsAt: iso(now, 7),
        image: ELECTRONICS,
        crop: CROP.earbuds,
      },
    ],
    brands: [
      { name: "Apple", authorised: true, proofVerifiedAt: "2024-01-20" },
      { name: "Dell", authorised: true, proofVerifiedAt: "2024-02-02" },
      { name: "Lenovo", authorised: true, proofVerifiedAt: "2024-02-11" },
      { name: "ASUS", authorised: false },
      { name: "HP", authorised: false },
      { name: "Canon", authorised: false },
      { name: "Sony", authorised: false },
      { name: "Samsung", authorised: false },
    ],
    reviews: [
      {
        id: "r1",
        name: "Tharindu P.",
        date: "2025-01-12T09:00:00.000Z",
        stars: 5,
        text: "Great service and genuine products. Got my MacBook with a clear warranty and fast delivery to Kandy. Highly recommended!",
        product: 'MacBook Air M1 13" 256GB',
        photos: [
          { image: ELECTRONICS, crop: CROP.laptop },
          { image: ELECTRONICS, crop: CROP.wide },
        ],
        helpful: 12,
        reply: {
          text: "Thank you Tharindu! We're happy you're enjoying your MacBook.",
          date: "2025-01-12T11:30:00.000Z",
        },
      },
      {
        id: "r2",
        name: "Nadeesha K.",
        date: "2024-12-28T09:00:00.000Z",
        stars: 5,
        text: "Bought AirPods Pro. Sealed box, warranty card stamped. They answered all my questions on WhatsApp within minutes.",
        product: "AirPods Pro 2 (USB-C)",
        helpful: 7,
      },
      {
        id: "r3",
        name: "Ruwan S.",
        date: "2024-12-02T09:00:00.000Z",
        stars: 4,
        text: "Good prices and honest description of the used camera. Delivery took two days longer than promised, but they kept me updated.",
        product: "Canon EOS 250D",
        helpful: 4,
        reply: {
          text: "Thanks for the honest feedback, Ruwan. We are working with our courier to keep delivery estimates accurate.",
          date: "2024-12-03T05:00:00.000Z",
        },
      },
      {
        id: "r4",
        name: "Amaya D.",
        date: "2024-11-15T09:00:00.000Z",
        stars: 3,
        text: "Product was fine but the phone arrived without the promised screen protector. Sorted after I messaged them.",
        helpful: 2,
      },
      {
        id: "r5",
        name: "Kasun M.",
        date: "2024-10-30T09:00:00.000Z",
        stars: 5,
        text: "Second purchase from Digital Hub. Easy payment plan on my laptop was smooth.",
        product: "Dell XPS 13 Laptop",
        helpful: 5,
      },
    ],
    questions: [
      {
        id: "q1",
        question: "Do you have this in stock at the Kandy branch?",
        date: "2025-01-10T09:00:00.000Z",
        answer: {
          text: "Yes, available at Kandy branch. You can also order online for islandwide delivery.",
          date: "2025-01-10T10:20:00.000Z",
        },
      },
      {
        id: "q2",
        question:
          "Is the warranty valid at any Apple service centre in Sri Lanka?",
        date: "2024-12-20T09:00:00.000Z",
        answer: {
          text: "Company warranty is honoured by the authorised Apple service provider. Keep your invoice and the sealed-box serial number.",
          date: "2024-12-20T12:00:00.000Z",
        },
      },
    ],
    about: {
      story:
        "Digital Hub is a leading electronics store in Kandy, offering laptops, smartphones, accessories and more. We provide genuine products, warranty and excellent after-sales support. Our team helps you choose the right device for your budget, and we deliver islandwide.",
      team: [
        { name: "Ishara Fernando", role: "Founder" },
        { name: "Dilan Perera", role: "Sales manager" },
        { name: "Nimali Silva", role: "Customer support" },
      ],
      teamSize: "10+",
      languages: ["English", "Sinhala", "Tamil"],
      payments: ["Visa", "Mastercard", "Bank transfer", "Cash on delivery"],
      instalmentProviders: ["epp", "koko"],
      deliveryAreas: "Islandwide",
      deliveryFee:
        "Free above Rs. 50,000. Otherwise Rs. 450 to Rs. 850 by area. 1 to 3 working days.",
      warrantyPolicy:
        "New devices carry the manufacturer's company warranty (12 to 24 months). Used and reconditioned devices carry a 6-month shop warranty covering hardware faults, not physical or liquid damage.",
      returnsPolicy:
        "Faulty items can be returned or exchanged within 7 days with the original invoice and packaging. Sealed items can be returned within 7 days, subject to inspection.",
      faq: [
        {
          q: "Are your products genuine?",
          a: "Yes. New devices come sealed with the company warranty. Used devices are tested and sold with a shop warranty.",
        },
        {
          q: "Can I pay in instalments?",
          a: "Yes, on selected products via Card EPP (up to 12 months) and KOKO (3 instalments). Look for the instalment line on the product.",
        },
        {
          q: "Do you deliver outside Kandy?",
          a: "We deliver islandwide in 1 to 3 working days.",
        },
      ],
      social: [
        { kind: "facebook", url: "https://facebook.com" },
        { kind: "instagram", url: "https://instagram.com" },
        { kind: "youtube", url: "https://youtube.com" },
      ],
    },
    branches: [
      {
        id: "b1",
        label: "Kandy (main)",
        address: "123 Peradeniya Road",
        district: "Kandy",
        phone: "94711000009",
        main: true,
      },
      {
        id: "b2",
        label: "Colombo",
        address: "45 Galle Road, Bambalapitiya",
        district: "Colombo",
        phone: "94711000019",
      },
    ],
    isNew: false,
  };
}

// A brand-new business: no reviews, a few products, hours not set yet.
function greenLeaf(): StorefrontBusiness {
  const base = digitalHub(new Date());
  return {
    ...base,
    slug: "green-leaf-nursery",
    name: "Green Leaf Nursery",
    tagline: "Fruit trees, ornamentals and garden supplies",
    itemsKind: "products",
    categoryId: "agriculture",
    categoryName: "Agriculture",
    city: "Kurunegala",
    district: "Kurunegala",
    cover: null,
    brandColor: "#166534",
    // Only the phone check is done; without the full verification there
    // is no tick, and the trust card says so plainly.
    verified: false,
    verification: { phone: "2026-09-01" },
    legalName: undefined,
    registrationNumber: undefined,
    registeredAddress: undefined,
    sinceYear: new Date().getFullYear(),
    establishedYear: undefined,
    followers: 0,
    rating: { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] },
    response: { conversations: 0, medianMinutes: 0, replyRate: 0 },
    hoursSet: false,
    hoursTable: [],
    highlights: [],
    collections: [],
    products: [],
    offers: [],
    brands: [],
    reviews: [],
    questions: [],
    about: {
      story: "",
      team: [],
      languages: ["Sinhala"],
      payments: ["Cash on delivery"],
      instalmentProviders: [],
      deliveryAreas: "",
      deliveryFee: "",
      warrantyPolicy: "",
      returnsPolicy: "",
      faq: [],
      social: [],
    },
    branches: [],
    isNew: true,
  };
}

/* ------------------------------------------------------------------ */

function conditionOf(
  c: SampleListing["condition"],
): StorefrontProduct["condition"] {
  if (c === "new") return "new";
  if (c === "reconditioned") return "reconditioned";
  if (c === "used" || c === "like-new") return "used";
  return undefined;
}

// Every other sample business gets a plain but complete page built from its
// card data, so a sponsored card or seller link never dead-ends.
function fromShop(shop: SampleShop, now: Date): StorefrontBusiness {
  const own: StorefrontProduct[] = [];
  const seen = new Set<string>();
  for (const l of sampleListings) {
    if (l.sellerName !== shop.name || seen.has(l.title)) continue;
    seen.add(l.title);
    own.push({
      id: l.id,
      title: l.title,
      href: `/ads/${l.categoryId}?q=${encodeURIComponent(l.title)}`,
      image: l.image,
      price: l.price,
      lowestPrice30d: l.originalPriceLabel
        ? Number(l.originalPriceLabel.replace(/[^\d]/g, ""))
        : undefined,
      condition: conditionOf(l.condition),
      availability: "in-stock",
      specs: l.attrs,
      category: l.subcategoryId,
      collections: [],
      addedDaysAgo: 2,
      negotiable: l.negotiable,
    });
  }
  const base = digitalHub(now);
  const stars = Math.round(shop.rating);
  return {
    ...base,
    slug: slugify(shop.name),
    name: shop.name,
    tagline: `${shop.category} in ${shop.location}`,
    itemsKind:
      shop.categoryId === "vehicles"
        ? "vehicles"
        : shop.categoryId === "property"
          ? "properties"
          : shop.categoryId === "services"
            ? "services"
            : "products",
    categoryId: shop.categoryId,
    categoryName: shop.category,
    city: shop.location,
    district: shop.location,
    cover: shop.cover,
    coverCrop: CROP.wide,
    phone: shop.phone,
    whatsapp: shop.phone,
    followers: 120 + shop.reviews * 7,
    rating: {
      average: shop.rating,
      count: shop.reviews,
      distribution: [0, 0, 0, 0, 0].map((_, i) =>
        i === 5 - stars ? 70 : i === 0 ? 20 : 10,
      ),
    },
    response: shop.response,
    highlights: shop.highlights.map((key) => ({
      key,
      policy: "Ask this business for the details of this service.",
    })),
    collections: [],
    products: own,
    offers: [],
    brands: [],
    reviews: base.reviews.slice(0, 2),
    questions: [],
    branches: [
      {
        id: "b1",
        label: `${shop.location} (main)`,
        address: `${shop.location} town`,
        district: shop.location,
        phone: shop.phone,
        main: true,
      },
    ],
    legalName: `${shop.name} (Pvt) Ltd`,
    registrationNumber: undefined,
    registeredAddress: undefined,
    about: {
      ...base.about,
      story: `${shop.name} is a verified ${shop.category.toLowerCase()} business in ${shop.location}, listing on SLMarket.lk.`,
      team: [],
      faq: [],
      social: [],
    },
    isNew: false,
  };
}

const DIST_BY_STARS = [
  [3, 3, 8, 22, 64],
  [2, 3, 10, 24, 61],
  [1, 2, 7, 20, 70],
];

// Every business in the sample directory gets a full page built from its
// directory record, so "View business" never dead-ends.
function fromDirectory(d: DirectoryBusiness, now: Date): StorefrontBusiness {
  const base = digitalHub(now);
  const level = d.verifiedLevel;
  const dist = DIST_BY_STARS[d.name.length % DIST_BY_STARS.length];
  const isNew = d.rating.count === 0 || d.createdDaysAgo <= 30;
  const products: StorefrontProduct[] = d.items.map((item, i) => ({
    id: `${d.id}-${item.id}`,
    title: item.title,
    href: `/ads/${d.categoryId}?q=${encodeURIComponent(item.title)}`,
    image: item.image,
    crop: item.crop,
    price: item.price,
    condition: i % 3 === 2 ? "used" : "new",
    warranty: level >= 3 ? { kind: "shop", months: 6 } : undefined,
    instalment: d.instalmentProviders[0]
      ? { provider: d.instalmentProviders[0] }
      : undefined,
    availability: "in-stock",
    deliveryDays: d.delivery.islandwide ? [1, 3] : undefined,
    specs: [],
    category: item.category,
    brand: item.brand,
    collections: [],
    addedDaysAgo: item.addedDaysAgo,
    pinned: item.pinned,
  }));
  const proofDate = "2025-03-14";
  return {
    ...base,
    slug: d.slug,
    name: d.name,
    tagline: d.tagline,
    itemsKind: d.itemsKind,
    categoryId: d.categoryId,
    categoryName: d.typeLabel,
    city: d.city,
    district: d.district,
    cover: d.cover,
    coverCrop: d.coverCrop,
    brandColor: d.brandColor,
    logo: d.logo,
    verified: level >= 2,
    verification: {
      phone: "2025-01-10",
      registration: level >= 2 ? "2025-01-14" : undefined,
      address: level >= 3 ? "2025-01-20" : undefined,
      authorisedDealer:
        level >= 4 && d.authorisedBrands.length ? "2025-02-02" : undefined,
    },
    legalName: level >= 2 ? `${d.name} (Pvt) Ltd` : undefined,
    registrationNumber:
      level >= 2
        ? `PV ${String(100000 + ((d.name.length * 7919) % 899999))}`
        : undefined,
    registeredAddress: level >= 3 ? `${d.city} town, ${d.district}` : undefined,
    sinceYear: new Date(
      now.getTime() - d.createdDaysAgo * 86_400_000,
    ).getFullYear(),
    establishedYear: undefined,
    followers: 20 + d.rating.count * 6,
    rating: {
      average: d.rating.average,
      count: d.rating.count,
      distribution: d.rating.count ? dist : [0, 0, 0, 0, 0],
    },
    response: d.response,
    openingHours: d.openingHours,
    hoursSet: d.hoursSet,
    hoursTable: d.hoursSet ? hoursTableFrom(d.openingHours) : [],
    phone: d.phone,
    whatsapp: d.whatsapp,
    highlights: d.highlights.map((key) => ({
      key,
      policy: "Ask this business for the details.",
    })),
    collections: [],
    products,
    offers: [],
    brands: [
      ...d.authorisedBrands.map((name) => ({
        name,
        authorised: true,
        proofVerifiedAt: proofDate,
      })),
      ...d.otherBrands.map((name) => ({ name, authorised: false })),
    ],
    reviews: d.rating.count > 0 ? base.reviews.slice(0, 3) : [],
    questions: [],
    about: {
      ...base.about,
      story: `${d.name} is a ${d.typeLabel.toLowerCase()} in ${d.city}. This is sample content.`,
      team: [],
      teamSize: undefined,
      instalmentProviders: d.instalmentProviders,
      deliveryAreas: d.delivery.islandwide
        ? "Islandwide"
        : d.delivery.districts.join(", "),
      faq: [],
      social: [],
    },
    branches: [
      {
        id: "b1",
        label: `${d.city} (main)`,
        address: d.location ? `${d.city} town` : "Location shared on request",
        district: d.district,
        phone: d.phone,
        main: true,
      },
    ],
    isNew,
  };
}

export function getSampleStorefront(slug: string, now = new Date()) {
  if (slug === "digital-hub") return digitalHub(now);
  if (slug === "green-leaf-nursery") return greenLeaf();
  const fromDir = getDirectoryBusinessBySlug(slug);
  if (fromDir) return fromDirectory(fromDir, now);
  const shop = sampleShops.find((s) => slugify(s.name) === slug);
  return shop ? fromShop(shop, now) : null;
}

export function sampleStorefrontSlugs() {
  return [
    "digital-hub",
    "green-leaf-nursery",
    ...sampleShops.map((s) => slugify(s.name)),
  ];
}
