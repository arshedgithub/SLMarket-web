import {
  Banknote,
  CalendarCheck,
  ClipboardCheck,
  CreditCard,
  FileText,
  Home,
  Leaf,
  RotateCcw,
  ShieldCheck,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { BusinessHighlight } from "@/lib/business/highlights";

export const HIGHLIGHT_ICONS: Record<BusinessHighlight, LucideIcon> = {
  delivery: Truck,
  warranty: ShieldCheck,
  easyPayments: CreditCard,
  cod: Banknote,
  returns: RotateCcw,
  inspection: ClipboardCheck,
  leasing: FileText,
  consultation: Home,
  siteVisits: CalendarCheck,
  assembly: Wrench,
  freshness: Leaf,
};
