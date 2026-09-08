export type PriceMode = "fixed" | "negotiable" | "free" | "contact";

export type AdDraft = {
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string;
  /** Dynamic per-category answers, keyed by field.key */
  attributes: Record<string, string | number | boolean>;
  images: string[];
  videoUrl: string;
  district: string;
  city: string;
  priceMode: PriceMode;
  price: string;
  contactPhone: string;
  showPhone: boolean;
  whatsapp: boolean;
};

export const EMPTY_DRAFT: AdDraft = {
  categoryId: "",
  subcategoryId: "",
  title: "",
  description: "",
  attributes: {},
  images: [],
  videoUrl: "",
  district: "",
  city: "",
  priceMode: "fixed",
  price: "",
  contactPhone: "",
  showPhone: true,
  whatsapp: true,
};

export const STEPS = [
  { id: "category", label: "Category" },
  { id: "details", label: "Details" },
  { id: "photos", label: "Photos" },
  { id: "location", label: "Location" },
  { id: "price", label: "Price" },
  { id: "review", label: "Review" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];
