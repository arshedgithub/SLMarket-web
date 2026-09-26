import type { ComponentType } from "react";
import {
  Car,
  Home,
  Smartphone,
  Sofa,
  Shirt,
  Utensils,
  Tractor,
  PawPrint,
  Wrench,
  BriefcaseBusiness,
  Sparkles,
  Dumbbell,
  GraduationCap,
  Grid3x3,
  Package,
} from "lucide-react";

type IconComponent = ComponentType<{ className?: string }>;

// Maps the string `icon` field in config/const/navLinks.ts to a lucide
// component. Single source of truth so the navbar, homepage and category
// rail never drift.
export const CATEGORY_ICONS: Record<string, IconComponent> = {
  Car,
  Home,
  Smartphone,
  Sofa,
  Shirt,
  Utensils,
  Tractor,
  PawPrint,
  Wrench,
  BriefcaseBusiness,
  Sparkles,
  Dumbbell,
  GraduationCap,
  Grid3x3,
};

export const CATEGORY_ICON_FALLBACK: IconComponent = Package;

export function categoryIcon(name: string): IconComponent {
  return CATEGORY_ICONS[name] ?? CATEGORY_ICON_FALLBACK;
}

// Solid accent per category id, and the matching white glyph at
// public/images/marketplace/categories/icons/<id>.webp — the same pair the
// homepage's category cards use, so any colour-circle-plus-icon treatment
// (category chips, cards, badges) looks identical everywhere.
export const CATEGORY_ACCENT: Record<string, string> = {
  vehicles: "bg-blue-600",
  property: "bg-orange-500",
  electronics: "bg-violet-600",
  "home-garden": "bg-green-600",
  fashion: "bg-pink-600",
  food: "bg-amber-500",
  agriculture: "bg-lime-600",
  education: "bg-sky-500",
  "animals-pets": "bg-red-500",
  services: "bg-slate-600",
  jobs: "bg-indigo-600",
  "health-beauty": "bg-rose-500",
  hobbies: "bg-teal-600",
  other: "bg-gray-500",
};

export function categoryAccent(id: string): string {
  return CATEGORY_ACCENT[id] ?? "bg-blue-600";
}

export function categoryGlyphSrc(id: string): string {
  return `/images/marketplace/categories/icons/${id}.webp`;
}
