/*
 * SLMarket.lk category taxonomy: the single source of truth for the
 * navbar "Browse Categories" popup, the mobile menu, the homepage
 * category grids and the seller-registration category picker.
 *
 * `icon` is a lucide-react icon name; components map it to a component
 * (see components/layout/navigation.tsx and the homepage).
 * `image` is the hero/grid thumbnail. It may be empty, in which case
 * the UI falls back to the icon on a gradient tile.
 */

export type Subcategory = {
  id: string;
  name: string;
  href: string;
};

export type Category = {
  id: string;
  name: string;
  href: string;
  icon: string;
  image: string;
  subcategories: Subcategory[];
};

const img = (name: string, ext: "webp" | "png" | "svg" = "webp") =>
  `/images/marketplace/categories/${name}.${ext}`;

export const categories: Category[] = [
  {
    id: "vehicles",
    name: "Vehicles",
    href: "/vehicles",
    icon: "Car",
    image: img("vehicles"),
    subcategories: [
      { id: "cars", name: "Cars", href: "/vehicles?type=cars" },
      {
        id: "motorbikes",
        name: "Motorbikes",
        href: "/vehicles?type=motorbikes",
      },
      {
        id: "three-wheelers",
        name: "Three Wheelers",
        href: "/vehicles?type=three-wheelers",
      },
      {
        id: "vans-lorries",
        name: "Vans, Lorries & Buses",
        href: "/vehicles?type=vans-lorries",
      },
      {
        id: "auto-parts",
        name: "Auto Parts & Accessories",
        href: "/vehicles?type=auto-parts",
      },
      { id: "bicycles", name: "Bicycles", href: "/vehicles?type=bicycles" },
      {
        id: "boats",
        name: "Boats & Water Transport",
        href: "/vehicles?type=boats",
      },
      {
        id: "rentals",
        name: "Vehicle Rentals",
        href: "/vehicles?type=rentals",
      },
    ],
  },
  {
    id: "property",
    name: "Property",
    href: "/property",
    icon: "Home",
    image: img("property"),
    subcategories: [
      {
        id: "houses-sale",
        name: "Houses for Sale",
        href: "/property?type=houses-sale",
      },
      {
        id: "land-sale",
        name: "Land for Sale",
        href: "/property?type=land-sale",
      },
      {
        id: "apartments",
        name: "Apartments",
        href: "/property?type=apartments",
      },
      {
        id: "houses-rent",
        name: "Houses for Rent",
        href: "/property?type=houses-rent",
      },
      {
        id: "commercial",
        name: "Commercial Property",
        href: "/property?type=commercial",
      },
      {
        id: "rooms-annexes",
        name: "Rooms & Annexes",
        href: "/property?type=rooms-annexes",
      },
      {
        id: "holiday",
        name: "Holiday & Short Term",
        href: "/property?type=holiday",
      },
    ],
  },
  {
    id: "electronics",
    name: "Electronics",
    href: "/electronics",
    icon: "Smartphone",
    image: img("electronics"),
    subcategories: [
      {
        id: "mobile-phones",
        name: "Mobile Phones",
        href: "/electronics?type=mobile-phones",
      },
      {
        id: "computers",
        name: "Computers & Laptops",
        href: "/electronics?type=computers",
      },
      { id: "tvs", name: "TVs", href: "/electronics?type=tvs" },
      { id: "cameras", name: "Cameras", href: "/electronics?type=cameras" },
      {
        id: "audio",
        name: "Audio & Headphones",
        href: "/electronics?type=audio",
      },
      { id: "gaming", name: "Gaming", href: "/electronics?type=gaming" },
      {
        id: "home-appliances",
        name: "Home Appliances",
        href: "/electronics?type=home-appliances",
      },
      {
        id: "accessories",
        name: "Accessories",
        href: "/electronics?type=accessories",
      },
    ],
  },
  {
    id: "home-garden",
    name: "Home & Garden",
    href: "/home-garden",
    icon: "Sofa",
    image: img("home-garden"),
    subcategories: [
      {
        id: "furniture",
        name: "Furniture",
        href: "/home-garden?type=furniture",
      },
      {
        id: "home-decor",
        name: "Home Decor",
        href: "/home-garden?type=home-decor",
      },
      {
        id: "kitchen-dining",
        name: "Kitchen & Dining",
        href: "/home-garden?type=kitchen-dining",
      },
      {
        id: "bedding-bath",
        name: "Bedding & Bath",
        href: "/home-garden?type=bedding-bath",
      },
      {
        id: "garden-outdoor",
        name: "Garden & Outdoor",
        href: "/home-garden?type=garden-outdoor",
      },
      {
        id: "tools-diy",
        name: "Tools & DIY",
        href: "/home-garden?type=tools-diy",
      },
      { id: "lighting", name: "Lighting", href: "/home-garden?type=lighting" },
    ],
  },
  {
    id: "fashion",
    name: "Fashion",
    href: "/fashion",
    icon: "Shirt",
    image: img("fashion"),
    subcategories: [
      {
        id: "womens-clothing",
        name: "Women's Clothing",
        href: "/fashion?type=womens-clothing",
      },
      {
        id: "mens-clothing",
        name: "Men's Clothing",
        href: "/fashion?type=mens-clothing",
      },
      {
        id: "kids-clothing",
        name: "Kids' Clothing",
        href: "/fashion?type=kids-clothing",
      },
      { id: "shoes", name: "Shoes", href: "/fashion?type=shoes" },
      { id: "bags", name: "Bags & Luggage", href: "/fashion?type=bags" },
      { id: "watches", name: "Watches", href: "/fashion?type=watches" },
      {
        id: "jewellery-accessories",
        name: "Jewellery & Accessories",
        href: "/fashion?type=jewellery-accessories",
      },
      {
        id: "wedding-bridal",
        name: "Wedding & Bridal",
        href: "/fashion?type=wedding-bridal",
      },
    ],
  },
  {
    id: "food",
    name: "Food & Groceries",
    href: "/food",
    icon: "Utensils",
    image: img("food"),
    subcategories: [
      {
        id: "fresh-produce",
        name: "Fresh Produce",
        href: "/food?type=fresh-produce",
      },
      {
        id: "rice-grains",
        name: "Rice & Grains",
        href: "/food?type=rice-grains",
      },
      { id: "spices", name: "Spices & Condiments", href: "/food?type=spices" },
      {
        id: "bakery-sweets",
        name: "Bakery & Sweets",
        href: "/food?type=bakery-sweets",
      },
      { id: "beverages", name: "Beverages", href: "/food?type=beverages" },
      { id: "homemade", name: "Homemade Food", href: "/food?type=homemade" },
      { id: "catering", name: "Catering", href: "/food?type=catering" },
    ],
  },
  {
    id: "agriculture",
    name: "Agriculture & Farming",
    href: "/agriculture",
    icon: "Tractor",
    image: img("agriculture"),
    subcategories: [
      {
        id: "farm-machinery",
        name: "Farm Machinery",
        href: "/agriculture?type=farm-machinery",
      },
      {
        id: "seeds-plants",
        name: "Seeds & Plants",
        href: "/agriculture?type=seeds-plants",
      },
      {
        id: "fertilizer",
        name: "Fertilizer & Chemicals",
        href: "/agriculture?type=fertilizer",
      },
      {
        id: "tools-equipment",
        name: "Tools & Equipment",
        href: "/agriculture?type=tools-equipment",
      },
      {
        id: "irrigation",
        name: "Irrigation",
        href: "/agriculture?type=irrigation",
      },
      {
        id: "harvest-crops",
        name: "Harvest & Crops",
        href: "/agriculture?type=harvest-crops",
      },
      {
        id: "animal-feed",
        name: "Animal Feed",
        href: "/agriculture?type=animal-feed",
      },
    ],
  },
  {
    id: "education",
    name: "Education",
    href: "/education",
    icon: "GraduationCap",
    image: img("education"),
    subcategories: [
      {
        id: "tuition-classes",
        name: "Tuition & Classes",
        href: "/education?type=tuition-classes",
      },
      {
        id: "online-courses",
        name: "Online Courses",
        href: "/education?type=online-courses",
      },
      {
        id: "exam-preparation",
        name: "Exam Preparation",
        href: "/education?type=exam-preparation",
      },
      {
        id: "languages",
        name: "Language Classes",
        href: "/education?type=languages",
      },
      {
        id: "skills-training",
        name: "Skills & Vocational",
        href: "/education?type=skills-training",
      },
      {
        id: "study-abroad",
        name: "Study Abroad",
        href: "/education?type=study-abroad",
      },
      {
        id: "books-stationery",
        name: "Books & Stationery",
        href: "/education?type=books-stationery",
      },
    ],
  },
  {
    id: "animals-pets",
    name: "Animals & Pets",
    href: "/animals-pets",
    icon: "PawPrint",
    image: img("animals", "webp"),
    subcategories: [
      { id: "dogs", name: "Dogs", href: "/animals-pets?type=dogs" },
      { id: "cats", name: "Cats", href: "/animals-pets?type=cats" },
      { id: "birds", name: "Birds", href: "/animals-pets?type=birds" },
      {
        id: "fish-aquariums",
        name: "Fish & Aquariums",
        href: "/animals-pets?type=fish-aquariums",
      },
      {
        id: "farm-animals",
        name: "Farm Animals",
        href: "/animals-pets?type=farm-animals",
      },
      { id: "poultry", name: "Poultry", href: "/animals-pets?type=poultry" },
      { id: "pet-food", name: "Pet Food", href: "/animals-pets?type=pet-food" },
      {
        id: "pet-accessories",
        name: "Pet Accessories",
        href: "/animals-pets?type=pet-accessories",
      },
      {
        id: "veterinary",
        name: "Veterinary",
        href: "/animals-pets?type=veterinary",
      },
    ],
  },
  {
    id: "services",
    name: "Services",
    href: "/services",
    icon: "Wrench",
    image: img("services"),
    subcategories: [
      {
        id: "home-repairs",
        name: "Home Repairs",
        href: "/services?type=home-repairs",
      },
      { id: "cleaning", name: "Cleaning", href: "/services?type=cleaning" },
      {
        id: "tuition",
        name: "Tuition & Classes",
        href: "/services?type=tuition",
      },
      {
        id: "events",
        name: "Weddings & Events",
        href: "/services?type=events",
      },
      {
        id: "movers",
        name: "Transport & Movers",
        href: "/services?type=movers",
      },
      {
        id: "beauty-wellness",
        name: "Beauty & Wellness",
        href: "/services?type=beauty-wellness",
      },
      {
        id: "software-it",
        name: "Software & IT",
        href: "/services?type=software-it",
      },
      {
        id: "business",
        name: "Business Services",
        href: "/services?type=business",
      },
      {
        id: "tech-repair",
        name: "Tech Repair",
        href: "/services?type=tech-repair",
      },
    ],
  },
  {
    id: "jobs",
    name: "Jobs",
    href: "/jobs",
    icon: "BriefcaseBusiness",
    image: img("jobs"),
    subcategories: [
      { id: "full-time", name: "Full Time", href: "/jobs?type=full-time" },
      { id: "part-time", name: "Part Time", href: "/jobs?type=part-time" },
      {
        id: "internships",
        name: "Internships",
        href: "/jobs?type=internships",
      },
      {
        id: "work-from-home",
        name: "Work From Home",
        href: "/jobs?type=work-from-home",
      },
      { id: "drivers", name: "Drivers", href: "/jobs?type=drivers" },
      {
        id: "domestic-staff",
        name: "Domestic Staff",
        href: "/jobs?type=domestic-staff",
      },
      {
        id: "hospitality",
        name: "Hospitality",
        href: "/jobs?type=hospitality",
      },
      {
        id: "sales-marketing",
        name: "Sales & Marketing",
        href: "/jobs?type=sales-marketing",
      },
    ],
  },
  {
    id: "health-beauty",
    name: "Health & Beauty",
    href: "/health-beauty",
    icon: "Sparkles",
    image: img("health-beauty"),
    subcategories: [
      {
        id: "skincare",
        name: "Skincare",
        href: "/health-beauty?type=skincare",
      },
      {
        id: "haircare",
        name: "Haircare",
        href: "/health-beauty?type=haircare",
      },
      { id: "makeup", name: "Makeup", href: "/health-beauty?type=makeup" },
      {
        id: "fragrances",
        name: "Fragrances",
        href: "/health-beauty?type=fragrances",
      },
      {
        id: "supplements",
        name: "Supplements",
        href: "/health-beauty?type=supplements",
      },
      {
        id: "medical-equipment",
        name: "Medical Equipment",
        href: "/health-beauty?type=medical-equipment",
      },
      { id: "fitness", name: "Fitness", href: "/health-beauty?type=fitness" },
    ],
  },
  {
    id: "hobbies",
    name: "Sports & Hobbies",
    href: "/hobbies",
    icon: "Dumbbell",
    image: img("hobbies"),
    subcategories: [
      {
        id: "sports-equipment",
        name: "Sports Equipment",
        href: "/hobbies?type=sports-equipment",
      },
      {
        id: "fitness-gym",
        name: "Fitness & Gym",
        href: "/hobbies?type=fitness-gym",
      },
      {
        id: "outdoor-camping",
        name: "Outdoor & Camping",
        href: "/hobbies?type=outdoor-camping",
      },
      { id: "cycling", name: "Cycling", href: "/hobbies?type=cycling" },
      {
        id: "musical-instruments",
        name: "Musical Instruments",
        href: "/hobbies?type=musical-instruments",
      },
      {
        id: "handmade-crafts",
        name: "Handmade Crafts",
        href: "/hobbies?type=handmade-crafts",
      },
      {
        id: "art-collectibles",
        name: "Art & Collectibles",
        href: "/hobbies?type=art-collectibles",
      },
      {
        id: "books-magazines",
        name: "Books & Magazines",
        href: "/hobbies?type=books-magazines",
      },
      {
        id: "toys-games",
        name: "Toys & Games",
        href: "/hobbies?type=toys-games",
      },
    ],
  },
  {
    id: "other",
    name: "Other",
    href: "/other",
    icon: "Grid3x3",
    image: img("other", "svg"),
    subcategories: [
      {
        id: "everything-else",
        name: "Everything Else",
        href: "/other?type=everything-else",
      },
      {
        id: "free-giveaway",
        name: "Free & Giveaway",
        href: "/other?type=free-giveaway",
      },
      { id: "wanted", name: "Wanted", href: "/other?type=wanted" },
      {
        id: "lost-found",
        name: "Lost & Found",
        href: "/other?type=lost-found",
      },
      { id: "community", name: "Community", href: "/other?type=community" },
    ],
  },
];

export const featuredLinks = [
  {
    title: "Popular",
    items: [
      { name: "Cars for Sale", href: "/vehicles?type=cars" },
      { name: "Houses for Rent", href: "/property?type=houses-rent" },
      { name: "Mobile Phones", href: "/electronics?type=mobile-phones" },
      { name: "Part Time Jobs", href: "/jobs?type=part-time" },
    ],
  },
  {
    title: "Deals & Offers",
    items: [
      { name: "Today's Deals", href: "/deals" },
      { name: "Best Prices", href: "/search?sort=price" },
      { name: "Local Sellers", href: "/search?filter=local" },
    ],
  },
  {
    title: "New Listings",
    items: [
      { name: "Newly Listed", href: "/search?sort=newest" },
      { name: "Verified Sellers", href: "/search?filter=verified" },
      { name: "Free to List", href: "/sell" },
    ],
  },
];
