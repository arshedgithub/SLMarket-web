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
