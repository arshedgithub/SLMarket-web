/*
 * Per-category "advanced options" for the ad-posting flow.
 *
 * Each category maps to a small set of structured fields, rendered by
 * components/post-ad/fields/DynamicField.tsx. The goal is a short, guided
 * set of choices (segmented buttons, chips, steppers) rather than a wall
 * of dropdowns.
 */

export type ListingFieldType =
  | "segmented" // 2-5 mutually exclusive options, shown as a button row
  | "chips" // single-select pills, good for 5-12 options
  | "multichips" // multi-select pills
  | "stepper" // integer +/- control
  | "number" // free numeric entry with a unit suffix
  | "text" // short free text
  | "toggle"; // boolean switch with a hint

export type ListingField = {
  key: string;
  label: string;
  type: ListingFieldType;
  options?: string[];
  unit?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  min?: number;
  max?: number;
  /** Only show this field when another field has one of these values. */
  showWhen?: { key: string; equals: string[] };
};

export type FieldGroup = {
  title: string;
  fields: ListingField[];
};

const CONDITION: ListingField = {
  key: "condition",
  label: "Condition",
  type: "segmented",
  options: ["Brand new", "Used", "Refurbished"],
  required: true,
};

export const LISTING_FIELDS: Record<string, FieldGroup[]> = {
  vehicles: [
    {
      title: "The essentials",
      fields: [
        {
          key: "condition",
          label: "Condition",
          type: "segmented",
          options: ["Brand new", "Used", "Reconditioned"],
          required: true,
        },
        {
          key: "brand",
          label: "Make",
          type: "text",
          placeholder: "Toyota, Honda, Bajaj…",
          required: true,
        },
        {
          key: "model",
          label: "Model",
          type: "text",
          placeholder: "Aqua, Vezel, CT100…",
          required: true,
        },
        {
          key: "year",
          label: "Year of manufacture",
          type: "number",
          unit: "",
          placeholder: "2018",
          required: true,
          min: 1950,
          max: 2026,
        },
      ],
    },
    {
      title: "Specs",
      fields: [
        {
          key: "mileage",
          label: "Mileage",
          type: "number",
          unit: "km",
          placeholder: "45000",
        },
        {
          key: "fuelType",
          label: "Fuel",
          type: "segmented",
          options: ["Petrol", "Diesel", "Hybrid", "Electric"],
        },
        {
          key: "transmission",
          label: "Transmission",
          type: "segmented",
          options: ["Automatic", "Manual"],
        },
        {
          key: "engineCapacity",
          label: "Engine capacity",
          type: "number",
          unit: "cc",
          placeholder: "1500",
        },
        {
          key: "bodyType",
          label: "Body type",
          type: "chips",
          options: [
            "Sedan",
            "Hatchback",
            "SUV",
            "Van",
            "Cab",
            "Wagon",
            "Coupe",
            "Pickup",
            "Bus",
            "Lorry",
          ],
        },
      ],
    },
  ],

  property: [
    {
      title: "What's on offer",
      fields: [
        {
          key: "listingType",
          label: "I want to",
          type: "segmented",
          options: ["Sell", "Rent out"],
          required: true,
        },
        {
          key: "propertyType",
          label: "Property type",
          type: "chips",
          options: [
            "House",
            "Apartment",
            "Land",
            "Commercial",
            "Room",
            "Annex",
            "Villa",
            "Warehouse",
          ],
          required: true,
        },
      ],
    },
    {
      title: "Size & layout",
      fields: [
        {
          key: "bedrooms",
          label: "Bedrooms",
          type: "stepper",
          min: 0,
          max: 12,
          showWhen: {
            key: "propertyType",
            equals: ["House", "Apartment", "Villa", "Annex", "Room"],
          },
        },
        {
          key: "bathrooms",
          label: "Bathrooms",
          type: "stepper",
          min: 0,
          max: 12,
          showWhen: {
            key: "propertyType",
            equals: [
              "House",
              "Apartment",
              "Villa",
              "Annex",
              "Room",
              "Commercial",
            ],
          },
        },
        {
          key: "floorArea",
          label: "Floor area",
          type: "number",
          unit: "sqft",
          placeholder: "1800",
        },
        {
          key: "landSize",
          label: "Land size",
          type: "number",
          unit: "perches",
          placeholder: "10",
        },
        {
          key: "parking",
          label: "Parking spaces",
          type: "stepper",
          min: 0,
          max: 10,
        },
        {
          key: "furnishing",
          label: "Furnishing",
          type: "segmented",
          options: ["Unfurnished", "Semi-furnished", "Furnished"],
          showWhen: {
            key: "propertyType",
            equals: [
              "House",
              "Apartment",
              "Villa",
              "Annex",
              "Room",
              "Commercial",
            ],
          },
        },
      ],
    },
  ],

  electronics: [
    {
      title: "The essentials",
      fields: [
        CONDITION,
        {
          key: "deviceType",
          label: "Type of device",
          type: "chips",
          options: [
            "Phone",
            "Laptop",
            "Tablet",
            "TV",
            "Camera",
            "Audio",
            "Console",
            "Wearable",
            "Accessory",
            "Home appliance",
          ],
          required: true,
        },
        {
          key: "brand",
          label: "Brand",
          type: "text",
          placeholder: "Apple, Samsung, Dell…",
        },
        {
          key: "model",
          label: "Model",
          type: "text",
          placeholder: "iPhone 13, Galaxy S23…",
        },
      ],
    },
    {
      title: "Good to know",
      fields: [
        {
          key: "warranty",
          label: "Warranty",
          type: "segmented",
          options: ["No warranty", "Under warranty", "Seller warranty"],
        },
        {
          key: "accessories",
          label: "Included accessories",
          type: "text",
          placeholder: "Box, charger, case…",
        },
      ],
    },
  ],

  "home-garden": [
    {
      title: "The essentials",
      fields: [
        CONDITION,
        {
          key: "itemType",
          label: "Category",
          type: "chips",
          options: [
            "Furniture",
            "Home decor",
            "Kitchen & dining",
            "Bedding & bath",
            "Garden & outdoor",
            "Tools & DIY",
            "Lighting",
            "Appliance",
          ],
          required: true,
        },
        {
          key: "material",
          label: "Main material",
          type: "text",
          placeholder: "Teak, steel, glass…",
        },
      ],
    },
    {
      title: "Details",
      fields: [
        {
          key: "dimensions",
          label: "Dimensions",
          type: "text",
          placeholder: "L x W x H",
        },
        {
          key: "assemblyRequired",
          label: "Assembly required",
          type: "toggle",
          hint: "Buyer needs to assemble this",
        },
        { key: "delivery", label: "Delivery available", type: "toggle" },
      ],
    },
  ],

  fashion: [
    {
      title: "The essentials",
      fields: [
        CONDITION,
        {
          key: "itemType",
          label: "Item type",
          type: "chips",
          options: [
            "Clothing",
            "Shoes",
            "Bag",
            "Watch",
            "Jewellery",
            "Accessory",
            "Sunglasses",
          ],
          required: true,
        },
        {
          key: "gender",
          label: "For",
          type: "segmented",
          options: ["Women", "Men", "Kids", "Unisex"],
        },
      ],
    },
    {
      title: "Details",
      fields: [
        { key: "brand", label: "Brand", type: "text", placeholder: "Optional" },
        {
          key: "size",
          label: "Size",
          type: "text",
          placeholder: "M, UK 8, 32…",
        },
        {
          key: "color",
          label: "Colour",
          type: "text",
          placeholder: "Optional",
        },
      ],
    },
  ],

  food: [
    {
      title: "The essentials",
      fields: [
        {
          key: "foodType",
          label: "Category",
          type: "chips",
          options: [
            "Fresh produce",
            "Rice & grains",
            "Spices & condiments",
            "Bakery & sweets",
            "Beverages",
            "Homemade meals",
            "Catering",
          ],
          required: true,
        },
        {
          key: "pricedBy",
          label: "Priced by",
          type: "segmented",
          options: ["Per kg", "Per item", "Per pack", "Bulk order"],
        },
      ],
    },
    {
      title: "Good to know",
      fields: [
        { key: "homemade", label: "Homemade / small batch", type: "toggle" },
        { key: "delivery", label: "Delivery available", type: "toggle" },
        {
          key: "minOrder",
          label: "Minimum order",
          type: "text",
          placeholder: "e.g. 5 kg, 10 boxes",
        },
      ],
    },
  ],

  agriculture: [
    {
      title: "The essentials",
      fields: [
        {
          key: "itemType",
          label: "Category",
          type: "chips",
          options: [
            "Machinery",
            "Seeds & plants",
            "Fertilizer & chemicals",
            "Tools & equipment",
            "Irrigation",
            "Harvest & crops",
            "Animal feed",
          ],
          required: true,
        },
        {
          key: "condition",
          label: "Condition",
          type: "segmented",
          options: ["Brand new", "Used", "Reconditioned"],
          showWhen: {
            key: "itemType",
            equals: ["Machinery", "Tools & equipment", "Irrigation"],
          },
        },
        { key: "brand", label: "Brand", type: "text", placeholder: "Optional" },
      ],
    },
    {
      title: "Quantity",
      fields: [
        {
          key: "quantity",
          label: "Quantity available",
          type: "text",
          placeholder: "e.g. 500 kg, 20 units",
        },
        {
          key: "delivery",
          label: "Delivery / transport available",
          type: "toggle",
        },
      ],
    },
  ],

  "animals-pets": [
    {
      title: "The essentials",
      fields: [
        {
          key: "listingType",
          label: "This listing is",
          type: "segmented",
          options: ["For sale", "For adoption", "For stud", "Lost & found"],
          required: true,
        },
        {
          key: "animalType",
          label: "Animal",
          type: "chips",
          options: [
            "Dog",
            "Cat",
            "Bird",
            "Fish",
            "Rabbit",
            "Farm animal",
            "Poultry",
            "Other",
          ],
          required: true,
        },
        { key: "breed", label: "Breed", type: "text", placeholder: "Optional" },
      ],
    },
    {
      title: "Health & background",
      fields: [
        {
          key: "age",
          label: "Age",
          type: "text",
          placeholder: "e.g. 3 months, 2 years",
        },
        { key: "vaccinated", label: "Vaccinated", type: "toggle" },
        {
          key: "pedigree",
          label: "Pedigree / papers available",
          type: "toggle",
        },
      ],
    },
  ],

  services: [
    {
      title: "The essentials",
      fields: [
        {
          key: "serviceCategory",
          label: "Service type",
          type: "chips",
          options: [
            "Home repairs",
            "Cleaning",
            "Tuition & classes",
            "Events",
            "Transport & movers",
            "Beauty & wellness",
            "Business services",
            "Tech repair",
          ],
          required: true,
        },
        {
          key: "serviceMode",
          label: "Where you work",
          type: "segmented",
          options: ["At your place", "At my place", "Online", "Island-wide"],
          required: true,
        },
      ],
    },
    {
      title: "About you",
      fields: [
        {
          key: "experience",
          label: "Years of experience",
          type: "number",
          unit: "yrs",
          placeholder: "5",
        },
        {
          key: "availability",
          label: "Availability",
          type: "text",
          placeholder: "e.g. Weekdays, evenings, 24/7",
        },
        {
          key: "teamSize",
          label: "Team size",
          type: "stepper",
          min: 1,
          max: 50,
        },
      ],
    },
  ],

  jobs: [
    {
      title: "The role",
      fields: [
        {
          key: "employmentType",
          label: "Employment type",
          type: "segmented",
          options: ["Full-time", "Part-time", "Contract", "Internship"],
          required: true,
        },
        {
          key: "workMode",
          label: "Work mode",
          type: "segmented",
          options: ["On-site", "Hybrid", "Remote"],
          required: true,
        },
        {
          key: "industry",
          label: "Industry",
          type: "text",
          placeholder: "IT, hospitality, retail…",
        },
        {
          key: "positions",
          label: "Open positions",
          type: "stepper",
          min: 1,
          max: 100,
        },
      ],
    },
    {
      title: "Candidate",
      fields: [
        {
          key: "experienceLevel",
          label: "Experience level",
          type: "chips",
          options: [
            "Entry level",
            "Junior",
            "Mid level",
            "Senior",
            "Lead / Manager",
          ],
        },
        {
          key: "salaryPeriod",
          label: "Salary shown is",
          type: "segmented",
          options: ["Per month", "Per day", "Per hour", "Per project"],
        },
      ],
    },
  ],

  "health-beauty": [
    {
      title: "The essentials",
      fields: [
        CONDITION,
        {
          key: "itemType",
          label: "Category",
          type: "chips",
          options: [
            "Skincare",
            "Haircare",
            "Makeup",
            "Fragrance",
            "Supplements",
            "Medical equipment",
            "Fitness",
          ],
          required: true,
        },
        { key: "brand", label: "Brand", type: "text", placeholder: "Optional" },
      ],
    },
    {
      title: "Good to know",
      fields: [
        { key: "sealed", label: "Sealed / unopened", type: "toggle" },
        {
          key: "expiry",
          label: "Expiry / best before",
          type: "text",
          placeholder: "Optional",
        },
      ],
    },
  ],

  hobbies: [
    {
      title: "The essentials",
      fields: [
        CONDITION,
        {
          key: "itemType",
          label: "Category",
          type: "chips",
          options: [
            "Handmade craft",
            "Art",
            "Collectible",
            "Musical instrument",
            "Books",
            "Sports equipment",
            "Antique",
            "Toys & games",
          ],
          required: true,
        },
        { key: "handmade", label: "Handmade by me", type: "toggle" },
      ],
    },
  ],
};

export function getFieldGroups(categoryId: string): FieldGroup[] {
  return LISTING_FIELDS[categoryId] ?? [];
}
