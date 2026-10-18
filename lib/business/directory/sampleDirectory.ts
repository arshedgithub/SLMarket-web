import type { BusinessHighlight } from "../highlights";
import type { InstalmentProviderId } from "../pricing";
import { DEFAULT_HOURS, type OpeningHours } from "../responseTime";
import { slugify } from "../slug";
import type { ImageCrop, ItemsKind } from "../storefront";
import { DISTRICT_CENTRES, type LatLng } from "./geo";
import type { DirectoryBusiness, DirectoryItem, VerifiedLevel } from "./types";

/*
 * SAMPLE directory data: about 90 made-up businesses across the island, so
 * every state of the directory (pagination, sponsored slots, map clusters,
 * approximate areas, businesses without a location, new businesses) has
 * something to show. Deterministic (seeded), so server and browser agree.
 * Replace by the real query and the search index; nothing here is real.
 */

const CAT = "/images/marketplace/categories";
const IMAGE: Record<string, string> = {
  electronics: `${CAT}/electronics.webp`,
  vehicles: `${CAT}/vehicles.webp`,
  property: `${CAT}/property.webp`,
  "home-garden": `${CAT}/home-garden.webp`,
  fashion: `${CAT}/fashion.webp`,
  food: `${CAT}/food.webp`,
  agriculture: `${CAT}/agriculture.webp`,
  education: `${CAT}/education.webp`,
  services: `${CAT}/services.webp`,
};

const CROPS: ImageCrop[] = [
  { x: 22, y: 55, zoom: 1.45 },
  { x: 57, y: 52, zoom: 2.1 },
  { x: 88, y: 55, zoom: 1.9 },
  { x: 46, y: 88, zoom: 2.7 },
  { x: 72, y: 80, zoom: 2.5 },
  { x: 50, y: 60, zoom: 1 },
  { x: 25, y: 30, zoom: 1.6 },
  { x: 75, y: 35, zoom: 1.7 },
  { x: 50, y: 50, zoom: 1.3 },
];

const PALETTE = [
  "#0c1f5e",
  "#1557d6",
  "#be185d",
  "#0f766e",
  "#7c2d12",
  "#4338ca",
  "#b91c1c",
  "#166534",
];

/* ---------------- seeded randomness ---------------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
type Rng = () => number;
const pick = <T>(r: Rng, list: readonly T[]) =>
  list[Math.floor(r() * list.length)];
const between = (r: Rng, a: number, b: number) => a + r() * (b - a);
const shuffled = <T>(r: Rng, list: readonly T[]) =>
  [...list]
    .map((v) => [r(), v] as const)
    .sort((x, y) => x[0] - y[0])
    .map(([, v]) => v);

/* ---------------- category templates ---------------- */

type ItemTemplate = {
  title: string;
  price: [number, number];
  category: string;
  brand?: string;
};
type Template = {
  itemsKind: ItemsKind;
  types: string[];
  subs: string[];
  items: ItemTemplate[];
  authorisedPool: string[];
  highlights: BusinessHighlight[][];
  instalment: boolean;
};

const TEMPLATES: Record<string, Template> = {
  electronics: {
    itemsKind: "products",
    types: [
      "Electronics Store",
      "Mobile Shop",
      "Computer Store",
      "Gaming Store",
      "Camera Shop",
      "Audio Store",
      "Home Appliances",
    ],
    subs: [
      "mobile-phones",
      "computers",
      "cameras",
      "audio",
      "gaming",
      "home-appliances",
    ],
    items: [
      {
        title: "iPhone 14 128GB",
        price: [150000, 210000],
        category: "phones",
        brand: "Apple",
      },
      {
        title: "Samsung Galaxy A54",
        price: [80000, 110000],
        category: "phones",
        brand: "Samsung",
      },
      {
        title: "MacBook Air M1",
        price: [240000, 320000],
        category: "laptops",
        brand: "Apple",
      },
      {
        title: "Dell XPS 13 Laptop",
        price: [250000, 330000],
        category: "laptops",
        brand: "Dell",
      },
      {
        title: "Sony WH-1000XM5",
        price: [95000, 135000],
        category: "audio",
        brand: "Sony",
      },
      {
        title: "Canon EOS 250D",
        price: [150000, 220000],
        category: "cameras",
        brand: "Canon",
      },
      {
        title: "AirPods Pro 2",
        price: [52000, 68000],
        category: "audio",
        brand: "Apple",
      },
      {
        title: "PlayStation 5",
        price: [150000, 190000],
        category: "gaming",
        brand: "Sony",
      },
      {
        title: "JBL Flip 6 Speaker",
        price: [30000, 42000],
        category: "audio",
        brand: "JBL",
      },
      {
        title: "HP LaserJet Printer",
        price: [38000, 62000],
        category: "accessories",
        brand: "HP",
      },
      {
        title: "Lenovo ThinkPad E14",
        price: [190000, 260000],
        category: "laptops",
        brand: "Lenovo",
      },
      {
        title: "Logitech Wireless Mouse",
        price: [5000, 12000],
        category: "accessories",
        brand: "Logitech",
      },
      {
        title: 'Samsung 55" 4K TV',
        price: [130000, 190000],
        category: "tvs",
        brand: "Samsung",
      },
      {
        title: "LG Refrigerator 260L",
        price: [110000, 160000],
        category: "appliances",
        brand: "LG",
      },
      {
        title: "Xiaomi Redmi Note 12",
        price: [55000, 75000],
        category: "phones",
        brand: "Xiaomi",
      },
      {
        title: "Apple Watch Series 8",
        price: [95000, 130000],
        category: "wearables",
        brand: "Apple",
      },
    ],
    authorisedPool: [
      "Apple",
      "Samsung",
      "Sony",
      "Dell",
      "HP",
      "Lenovo",
      "Canon",
      "JBL",
      "LG",
    ],
    highlights: [
      ["delivery", "warranty"],
      ["easyPayments", "cod"],
      ["warranty", "delivery", "easyPayments"],
      ["delivery", "easyPayments"],
    ],
    instalment: true,
  },
  vehicles: {
    itemsKind: "vehicles",
    types: [
      "Vehicle Dealer",
      "Car Dealer",
      "Motorbike Dealer",
      "Three Wheeler Dealer",
    ],
    subs: ["cars", "motorbikes", "three-wheelers"],
    items: [
      {
        title: "Toyota Aqua 2017",
        price: [5500000, 7500000],
        category: "cars",
        brand: "Toyota",
      },
      {
        title: "Honda Vezel 2016",
        price: [7000000, 9000000],
        category: "cars",
        brand: "Honda",
      },
      {
        title: "Suzuki Alto 2019",
        price: [3200000, 4200000],
        category: "cars",
        brand: "Suzuki",
      },
      {
        title: "Toyota Prius 2015",
        price: [5000000, 6800000],
        category: "cars",
        brand: "Toyota",
      },
      {
        title: "Yamaha FZ-S V3",
        price: [700000, 850000],
        category: "motorbikes",
        brand: "Yamaha",
      },
      {
        title: "Bajaj Pulsar 150",
        price: [550000, 700000],
        category: "motorbikes",
        brand: "Bajaj",
      },
      {
        title: "Bajaj Three Wheeler",
        price: [1000000, 1300000],
        category: "three-wheelers",
        brand: "Bajaj",
      },
      {
        title: "Nissan Leaf 2018",
        price: [5500000, 7000000],
        category: "cars",
        brand: "Nissan",
      },
      {
        title: "Suzuki Wagon R 2018",
        price: [4000000, 5000000],
        category: "cars",
        brand: "Suzuki",
      },
      {
        title: "Honda Dio",
        price: [420000, 520000],
        category: "motorbikes",
        brand: "Honda",
      },
    ],
    authorisedPool: ["Toyota", "Honda", "Suzuki", "Bajaj", "Yamaha"],
    highlights: [
      ["leasing", "inspection"],
      ["inspection", "delivery"],
      ["leasing"],
    ],
    instalment: false,
  },
  property: {
    itemsKind: "properties",
    types: ["Real Estate Agency", "Property Developer"],
    subs: ["houses-sale", "land-sale", "apartments", "houses-rent"],
    items: [
      {
        title: "3BR House for Sale",
        price: [15000000, 35000000],
        category: "houses-sale",
      },
      {
        title: "10 Perches Land",
        price: [2000000, 8000000],
        category: "land-sale",
      },
      {
        title: "Apartment for Rent",
        price: [90000, 250000],
        category: "apartments",
      },
      {
        title: "Luxury Apartment",
        price: [35000000, 80000000],
        category: "apartments",
      },
      {
        title: "Commercial Space",
        price: [150000, 400000],
        category: "commercial",
      },
      {
        title: "Annex for Rent",
        price: [35000, 80000],
        category: "houses-rent",
      },
    ],
    authorisedPool: [],
    highlights: [
      ["consultation", "siteVisits"],
      ["siteVisits"],
      ["consultation"],
    ],
    instalment: false,
  },
  services: {
    itemsKind: "services",
    types: [
      "Home Services",
      "Repair Service",
      "Cleaning Service",
      "Beauty Salon",
      "Event Services",
    ],
    subs: [
      "home-repairs",
      "cleaning",
      "beauty-wellness",
      "events",
      "tech-repair",
    ],
    items: [
      {
        title: "AC Repair and Service",
        price: [3500, 8000],
        category: "home-repairs",
      },
      {
        title: "Deep Home Cleaning",
        price: [6000, 15000],
        category: "cleaning",
      },
      {
        title: "Plumbing Repair",
        price: [2500, 8000],
        category: "home-repairs",
      },
      {
        title: "Electrician Visit",
        price: [2000, 6000],
        category: "home-repairs",
      },
      { title: "Pest Control", price: [7000, 18000], category: "cleaning" },
      {
        title: "Wedding Photography",
        price: [60000, 200000],
        category: "events",
      },
      {
        title: "Bridal Makeup",
        price: [15000, 50000],
        category: "beauty-wellness",
      },
      { title: "Laptop Repair", price: [3000, 12000], category: "tech-repair" },
    ],
    authorisedPool: [],
    highlights: [["warranty"], ["consultation", "warranty"], ["consultation"]],
    instalment: false,
  },
  "home-garden": {
    itemsKind: "products",
    types: ["Furniture Store", "Home Decor Store"],
    subs: ["furniture", "home-decor", "kitchen-dining"],
    items: [
      {
        title: "Sofa Set (3+1+1)",
        price: [85000, 180000],
        category: "furniture",
      },
      {
        title: "Dining Table Set",
        price: [95000, 220000],
        category: "furniture",
      },
      {
        title: "King Size Bed Frame",
        price: [75000, 160000],
        category: "furniture",
      },
      {
        title: "Wardrobe 4 Door",
        price: [60000, 130000],
        category: "furniture",
      },
      { title: "Decor Wall Art Set", price: [6000, 18000], category: "decor" },
      {
        title: "Kitchen Cabinet Set",
        price: [180000, 420000],
        category: "kitchen",
      },
    ],
    authorisedPool: [],
    highlights: [
      ["delivery", "assembly"],
      ["delivery", "easyPayments"],
    ],
    instalment: true,
  },
  fashion: {
    itemsKind: "products",
    types: ["Boutique", "Shoe Store", "Clothing Store"],
    subs: [
      "womens-clothing",
      "mens-clothing",
      "shoes",
      "bags",
      "wedding-bridal",
    ],
    items: [
      {
        title: "Designer Party Dress",
        price: [5000, 20000],
        category: "womens",
      },
      { title: "Leather Handbag", price: [6000, 18000], category: "bags" },
      { title: "Men's Formal Shirt", price: [2500, 6000], category: "mens" },
      { title: "Batik Saree", price: [8000, 30000], category: "womens" },
      { title: "Running Sneakers", price: [9000, 22000], category: "shoes" },
    ],
    authorisedPool: [],
    highlights: [
      ["cod", "returns"],
      ["delivery", "returns"],
    ],
    instalment: false,
  },
  food: {
    itemsKind: "products",
    types: ["Grocery Store", "Bakery", "Spice Merchant"],
    subs: ["spices", "bakery-sweets", "fresh-produce", "beverages"],
    items: [
      { title: "Organic Spice Pack", price: [900, 2500], category: "spices" },
      { title: "Ceylon Tea 500g", price: [1200, 3000], category: "beverages" },
      {
        title: "Fresh Fruits Box",
        price: [1500, 3500],
        category: "fresh-produce",
      },
      { title: "Coconut Oil 1L", price: [1200, 1800], category: "grocery" },
    ],
    authorisedPool: [],
    highlights: [["delivery", "freshness"], ["freshness"]],
    instalment: false,
  },
  agriculture: {
    itemsKind: "products",
    types: ["Plant Nursery", "Agro Supplier"],
    subs: ["seeds-plants", "fertilizer", "tools-equipment"],
    items: [
      { title: "Coconut Plants (10)", price: [4500, 9000], category: "plants" },
      {
        title: "Fertilizer 50kg",
        price: [9000, 15000],
        category: "fertilizer",
      },
      { title: "Mango Sapling", price: [300, 800], category: "plants" },
      { title: "Garden Tools Set", price: [4000, 9000], category: "tools" },
    ],
    authorisedPool: [],
    highlights: [["delivery"], ["delivery", "cod"]],
    instalment: false,
  },
  education: {
    itemsKind: "courses",
    types: ["Training Institute", "Language School"],
    subs: ["skills-training", "languages", "tuition-classes"],
    items: [
      { title: "IT Diploma Course", price: [85000, 160000], category: "it" },
      {
        title: "Spoken English Course",
        price: [18000, 35000],
        category: "languages",
      },
      { title: "A/L Physics Class", price: [3000, 6000], category: "tuition" },
    ],
    authorisedPool: [],
    highlights: [["consultation"], ["consultation", "easyPayments"]],
    instalment: false,
  },
};

const NAMES: Record<string, string[]> = {
  electronics: [
    "Mobile City",
    "GameHub LK",
    "Camera Pro",
    "HomeTech",
    "Audio World",
    "Smart Life",
    "PC Master",
    "Gadget Lanka",
    "Cyber Mart",
    "Techno Point",
    "Wave Electronics",
    "Power Plug",
    "Nexus Digital",
    "ByteShop LK",
    "iZone Lanka",
    "Ceylon Gadgets",
    "Lanka Laptops",
    "Sound Studio",
    "Volt Mart",
    "Pixel Point",
    "TabZone",
    "Circuit House",
  ],
  vehicles: [
    "AutoHub LK",
    "Prime Cars",
    "Lanka Motors",
    "Speedway Auto",
    "City Cars",
    "Bike World LK",
    "Royal Motors",
    "Green Wheels",
    "Hill Country Autos",
    "Coast Cars",
    "Ceylon Wheels",
    "Motor Mart",
  ],
  property: [
    "Prime Estates",
    "Lanka Homes",
    "Urban Realty",
    "Land Lanka",
    "City Estates",
    "Skyline Properties",
    "Green Acres Realty",
    "Heritage Homes",
    "Coastal Estates",
    "Metro Properties",
  ],
  services: [
    "FixIt Services",
    "CoolAir Services",
    "Sparkle Cleaners",
    "QuickFix LK",
    "HomeCare Pros",
    "Elite Plumbing",
    "Bright Electricians",
    "AC Masters",
    "Pest Away LK",
    "Paint Pro",
    "Wedding Wonders",
    "Glow Salon",
  ],
  "home-garden": [
    "HomeStyle",
    "Furniture Palace",
    "Cozy Living",
    "Garden Glory",
    "Timber Craft",
    "Decor House",
    "Kitchen Kingdom",
    "Bed and Home",
  ],
  fashion: [
    "Glamour.lk",
    "Trend Setters",
    "Silk Route",
    "Urban Threads",
    "Bridal Bliss",
    "Kids Corner",
    "Shoe Box LK",
    "Batik House",
  ],
  food: [
    "Spice Garden",
    "Ceylon Fresh",
    "Daily Fresh",
    "Tea Traders",
    "Coconut Grove",
    "Bakery Lane",
  ],
  agriculture: [
    "Green Leaf Nursery",
    "Farm Fresh Lanka",
    "AgroMart",
    "Seed and Soil",
    "Harvest Hub",
  ],
  education: [
    "BrightMinds Institute",
    "Lanka IT Academy",
    "English Hub",
    "Career Skills",
  ],
};

// Where sample businesses sit: heavy in the big cities, spread elsewhere.
const DISTRICT_POOL = [
  "Colombo",
  "Colombo",
  "Colombo",
  "Colombo",
  "Colombo",
  "Colombo",
  "Kandy",
  "Kandy",
  "Kandy",
  "Kandy",
  "Kandy",
  "Gampaha",
  "Gampaha",
  "Gampaha",
  "Kalutara",
  "Galle",
  "Galle",
  "Kurunegala",
  "Kurunegala",
  "Matara",
  "Jaffna",
  "Jaffna",
  "Batticaloa",
  "Anuradhapura",
  "Ratnapura",
  "Matale",
  "Nuwara Eliya",
  "Badulla",
  "Trincomalee",
  "Hambantota",
];

const HOURS: OpeningHours[] = [
  {
    ...DEFAULT_HOURS,
    openMinute: 9 * 60,
    closeMinute: 19 * 60,
    overrides: { 0: null },
  },
  {
    days: [0, 1, 2, 3, 4, 5, 6],
    openMinute: 8 * 60 + 30,
    closeMinute: 20 * 60,
  },
  {
    days: [1, 2, 3, 4, 5, 6],
    openMinute: 8 * 60 + 30,
    closeMinute: 17 * 60 + 30,
    overrides: { 0: { openMinute: 9 * 60, closeMinute: 13 * 60 } },
  },
];

/* ---------------- builders ---------------- */

type Spec = {
  name: string;
  categoryId: string;
  district: string;
  city?: string;
  typeLabel?: string;
  level?: VerifiedLevel;
  rating?: [number, number];
  authorised?: string[];
  highlights?: BusinessHighlight[];
  sponsored?: { impressionsToday: number; dailyPlan?: number };
  sub?: string[];
  exact?: boolean;
  items?: DirectoryItem[];
  itemCount?: number;
  response?: DirectoryBusiness["response"];
  delivery?: DirectoryBusiness["delivery"];
  instalment?: InstalmentProviderId[];
  hoursIndex?: number;
  tagline?: string;
};

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

function makeItems(r: Rng, cfg: Template, categoryId: string): DirectoryItem[] {
  const count = 3 + Math.floor(r() * 6);
  const chosen = shuffled(r, cfg.items).slice(
    0,
    Math.min(count, cfg.items.length),
  );
  const crops = shuffled(r, CROPS);
  return chosen.map((t, i) => ({
    id: `i${i}`,
    title: t.title,
    price: roundTo(
      between(r, t.price[0], t.price[1]),
      t.price[1] > 100000 ? 5000 : t.price[1] > 5000 ? 500 : 50,
    ),
    image: IMAGE[categoryId],
    crop: crops[i % crops.length],
    category: t.category,
    brand: t.brand,
    pinned: i < 3 && r() > 0.4,
    addedDaysAgo: Math.floor(between(r, 0, 40)),
  }));
}

function build(spec: Spec, index: number): DirectoryBusiness {
  const r = mulberry32(hash(spec.name) + index * 7919);
  const cfg = TEMPLATES[spec.categoryId];
  const centre = DISTRICT_CENTRES[spec.district];
  const slug = slugify(spec.name);

  const isNew = !spec.rating && r() < 0.07;
  const createdDaysAgo = isNew
    ? Math.floor(between(r, 3, 28))
    : Math.floor(between(r, 60, 900));
  const reviews = isNew
    ? r() < 0.6
      ? 0
      : Math.floor(between(r, 1, 4))
    : Math.floor(between(r, 6, 190));
  const rating = spec.rating
    ? { average: spec.rating[0], count: spec.rating[1] }
    : {
        average: reviews ? Math.round(between(r, 3.6, 4.9) * 10) / 10 : 0,
        count: reviews,
      };

  const levelRoll = r();
  const level: VerifiedLevel =
    spec.level ??
    (levelRoll < 0.1 ? 1 : levelRoll < 0.4 ? 2 : levelRoll < 0.75 ? 3 : 4);

  // A pin, an approximate area (home-based), or nothing.
  const locRoll = r();
  const jitter = (): LatLng => ({
    lat: centre.lat + between(r, -0.045, 0.045),
    lng: centre.lng + between(r, -0.045, 0.045),
  });
  let location: LatLng | null = null;
  let serviceArea: DirectoryBusiness["serviceArea"];
  if (spec.exact || locRoll < 0.84) location = jitter();
  else if (locRoll < 0.93) {
    location = jitter();
    serviceArea = { radiusKm: Math.round(between(r, 4, 12)) };
  }

  const items = spec.items ?? makeItems(r, cfg, spec.categoryId);
  const authorised =
    spec.authorised ??
    (level >= 4 && cfg.authorisedPool.length
      ? shuffled(r, cfg.authorisedPool).slice(0, 1 + Math.floor(r() * 2))
      : []);
  const itemBrands = [
    ...new Set(items.map((i) => i.brand).filter((b): b is string => !!b)),
  ];
  const otherBrands = itemBrands.filter((b) => !authorised.includes(b));

  const islandwide = spec.delivery?.islandwide ?? r() < 0.45;
  const hasInstalment =
    spec.instalment ??
    (cfg.instalment && r() < 0.6
      ? (["epp", "koko"] as InstalmentProviderId[])
      : []);

  const digits = String(Math.floor(between(r, 1000000, 9999999)));
  const inactive = !spec.rating && r() < 0.03;
  const secondary: string[] = [];
  if (spec.categoryId === "electronics" && r() < 0.15)
    secondary.push("home-garden");
  if (spec.categoryId === "services" && r() < 0.2)
    secondary.push("home-garden");

  return {
    id: `dir-${slug}`,
    slug,
    name: spec.name,
    tagline:
      spec.tagline ??
      `${spec.typeLabel ?? pick(r, cfg.types)} in ${spec.city ?? spec.district}`,
    itemsKind: cfg.itemsKind,
    categoryId: spec.categoryId,
    secondaryCategoryIds: secondary,
    subcategoryIds:
      spec.sub ?? shuffled(r, cfg.subs).slice(0, 1 + Math.floor(r() * 2)),
    typeLabel: spec.typeLabel ?? pick(r, cfg.types),
    district: spec.district,
    city: spec.city ?? spec.district,
    location,
    serviceArea,
    verifiedLevel: level,
    rating,
    response: spec.response ?? {
      conversations: isNew
        ? Math.floor(between(r, 0, 8))
        : Math.floor(between(r, 4, 130)),
      medianMinutes: pick(r, [15, 25, 40, 55, 90, 150, 300, 900]),
      replyRate: Math.round(between(r, 0.6, 0.99) * 100) / 100,
    },
    openingHours: HOURS[spec.hoursIndex ?? Math.floor(r() * HOURS.length)],
    hoursSet: r() < 0.92,
    highlights: spec.highlights ?? pick(r, cfg.highlights),
    authorisedBrands: authorised,
    otherBrands,
    delivery: spec.delivery ?? {
      islandwide,
      districts: islandwide ? [] : [spec.district],
    },
    instalmentProviders: hasInstalment,
    itemCount: Math.max(
      spec.itemCount ?? Math.floor(between(r, 8, 140)),
      items.length,
    ),
    items,
    logo: null,
    brandColor: PALETTE[hash(spec.name) % PALETTE.length],
    cover: IMAGE[spec.categoryId],
    coverCrop: pick(r, CROPS),
    phone: `9471${digits}`,
    whatsapp: `9471${digits}`,
    createdDaysAgo,
    lastActiveDaysAgo: inactive ? 120 : Math.floor(between(r, 0, 20)),
    completeness: Math.round(between(r, 0.55, 1) * 100) / 100,
    published: spec.rating ? true : r() > 0.02,
    suspended: spec.rating ? false : r() < 0.01,
    sponsored: spec.sponsored
      ? {
          categoryIds: [spec.categoryId],
          dailyPlan: spec.sponsored.dailyPlan ?? 6000,
          impressionsToday: spec.sponsored.impressionsToday,
        }
      : undefined,
  };
}

/* ---------------- the named businesses and the rest ---------------- */

function dhItem(
  id: string,
  title: string,
  price: number,
  crop: ImageCrop,
  category: string,
  brand: string,
  pinned = true,
): DirectoryItem {
  return {
    id,
    title,
    price,
    image: IMAGE.electronics,
    crop,
    category,
    brand,
    pinned,
    addedDaysAgo: 4,
  };
}

// The Kandy electronics view of the design, plus the businesses the rest of
// the app already links to (cards and seller names).
const NAMED: Spec[] = [
  {
    name: "Digital Hub",
    categoryId: "electronics",
    district: "Kandy",
    typeLabel: "Electronics Store",
    level: 4,
    rating: [4.6, 38],
    authorised: ["Apple"],
    highlights: ["delivery", "warranty", "easyPayments", "cod"],
    sponsored: { impressionsToday: 1200 },
    exact: true,
    itemCount: 17,
    hoursIndex: 0,
    response: { conversations: 38, medianMinutes: 35, replyRate: 0.92 },
    delivery: { islandwide: true, districts: [] },
    instalment: ["epp", "koko"],
    items: [
      dhItem(
        "dh1",
        'MacBook Air M1 13" 256GB',
        285000,
        CROPS[0],
        "laptops",
        "Apple",
      ),
      dhItem("dh2", "iPhone 14 128GB", 175000, CROPS[1], "phones", "Apple"),
      dhItem("dh3", "AirPods Pro 2 (USB-C)", 62000, CROPS[3], "audio", "Apple"),
      dhItem(
        "dh4",
        "Dell XPS 13 Laptop",
        299000,
        CROPS[0],
        "laptops",
        "Dell",
        false,
      ),
    ],
  },
  {
    name: "Mobile City",
    categoryId: "electronics",
    district: "Kandy",
    typeLabel: "Mobile Shop",
    level: 4,
    rating: [4.5, 52],
    highlights: ["delivery", "easyPayments"],
    sponsored: { impressionsToday: 2100 },
    exact: true,
    itemCount: 124,
    delivery: { islandwide: true, districts: [] },
    sub: ["mobile-phones"],
  },
  {
    name: "TechZone Sri Lanka",
    categoryId: "electronics",
    district: "Colombo",
    typeLabel: "Electronics Store",
    level: 4,
    rating: [4.8, 56],
    authorised: ["Sony", "Dell"],
    highlights: ["warranty", "cod"],
    exact: true,
    itemCount: 120,
    delivery: { islandwide: true, districts: [] },
  },
  {
    name: "GameHub LK",
    categoryId: "electronics",
    district: "Kandy",
    typeLabel: "Gaming Store",
    level: 3,
    rating: [4.3, 28],
    highlights: ["easyPayments", "delivery"],
    exact: true,
    itemCount: 64,
    delivery: { islandwide: true, districts: [] },
    instalment: ["epp"],
    sub: ["gaming"],
  },
  {
    name: "Camera Pro",
    categoryId: "electronics",
    district: "Kandy",
    typeLabel: "Camera Shop",
    level: 4,
    rating: [4.6, 76],
    authorised: ["Canon"],
    highlights: ["warranty", "delivery"],
    exact: true,
    itemCount: 98,
    sub: ["cameras"],
  },
  {
    name: "HomeTech",
    categoryId: "electronics",
    district: "Kandy",
    typeLabel: "Home Appliances",
    level: 3,
    rating: [4.4, 31],
    highlights: ["warranty", "delivery"],
    exact: true,
    itemCount: 76,
    sub: ["home-appliances"],
  },
  {
    name: "Audio World",
    categoryId: "electronics",
    district: "Kandy",
    typeLabel: "Audio Store",
    level: 4,
    rating: [4.5, 41],
    authorised: ["Sony"],
    highlights: ["easyPayments", "delivery"],
    exact: true,
    itemCount: 52,
    sub: ["audio"],
    instalment: ["epp"],
  },
  {
    name: "Smart Life",
    categoryId: "electronics",
    district: "Kandy",
    typeLabel: "Electronics Store",
    level: 2,
    rating: [4.2, 19],
    highlights: ["delivery", "warranty"],
    exact: true,
    itemCount: 48,
    delivery: { islandwide: true, districts: [] },
  },
  {
    name: "ElectroMart LK",
    categoryId: "electronics",
    district: "Gampaha",
    typeLabel: "Electronics Store",
    level: 3,
    rating: [4.5, 27],
    highlights: ["delivery", "cod"],
    itemCount: 64,
  },
  {
    name: "AutoHub LK",
    categoryId: "vehicles",
    district: "Gampaha",
    typeLabel: "Vehicle Dealer",
    level: 4,
    rating: [4.6, 41],
    authorised: ["Toyota"],
    highlights: ["leasing", "inspection"],
    sponsored: { impressionsToday: 900 },
    itemCount: 85,
  },
  {
    name: "Prime Cars",
    categoryId: "vehicles",
    district: "Kandy",
    typeLabel: "Car Dealer",
    level: 3,
    rating: [4.6, 28],
    highlights: ["leasing", "inspection"],
    sponsored: { impressionsToday: 3300 },
    exact: true,
    itemCount: 86,
  },
  {
    name: "HomeStyle",
    categoryId: "home-garden",
    district: "Kandy",
    typeLabel: "Furniture Store",
    level: 3,
    rating: [4.7, 33],
    highlights: ["delivery", "assembly"],
    itemCount: 96,
  },
  {
    name: "Glamour.lk",
    categoryId: "fashion",
    district: "Colombo",
    typeLabel: "Boutique",
    level: 4,
    rating: [4.8, 62],
    highlights: ["cod", "returns"],
    itemCount: 150,
  },
  {
    name: "Prime Estates",
    categoryId: "property",
    district: "Colombo",
    typeLabel: "Real Estate Agency",
    level: 4,
    rating: [4.7, 24],
    highlights: ["consultation", "siteVisits"],
    sponsored: { impressionsToday: 1500 },
    itemCount: 60,
  },
  {
    name: "FixIt Services",
    categoryId: "services",
    district: "Colombo",
    typeLabel: "Home Services",
    level: 3,
    rating: [4.6, 47],
    highlights: ["warranty"],
    itemCount: 110,
    sub: ["home-repairs"],
  },
];

function generate(): DirectoryBusiness[] {
  const named = new Set(NAMED.map((n) => n.name));
  const specs: Spec[] = [...NAMED];
  let i = 0;
  for (const [categoryId, names] of Object.entries(NAMES)) {
    for (const name of names) {
      if (named.has(name)) continue;
      const r = mulberry32(hash(`${categoryId}:${name}`));
      // Electronics leans towards Kandy, matching the design's Kandy view.
      const district =
        categoryId === "electronics" && r() < 0.3
          ? "Kandy"
          : DISTRICT_POOL[Math.floor(r() * DISTRICT_POOL.length)];
      const sponsor = i % 9 === 4;
      specs.push({
        name,
        categoryId,
        district,
        sponsored: sponsor
          ? { impressionsToday: Math.floor(between(r, 400, 4500)) }
          : undefined,
      });
      i++;
    }
  }
  return specs.map((s, idx) => build(s, idx));
}

let cache: DirectoryBusiness[] | null = null;
export function getSampleDirectory(): DirectoryBusiness[] {
  cache ??= generate();
  return cache;
}

export function getDirectoryBusinessBySlug(slug: string) {
  return getSampleDirectory().find((b) => b.slug === slug) ?? null;
}
