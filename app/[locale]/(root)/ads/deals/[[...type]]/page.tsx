import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  buildDealsMetadata,
  ListingsPageShell,
} from "../../_components/ListingsPageShell";
import { parseDealRouteType } from "../../_components/dealRoutes";

interface Props {
  params: Promise<{ locale: string; type?: string[] }>;
}

// /ads/deals            -> every deal type
// /ads/deals/<type>     -> one deal type (coupons, price-drops)
function resolveDealType(segments: string[] | undefined) {
  if (!segments?.length) return { valid: true, dealType: null } as const;
  const dealType =
    segments.length === 1 ? parseDealRouteType(segments[0]) : null;
  return { valid: dealType !== null, dealType } as const;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, type } = await params;
  return buildDealsMetadata(locale, resolveDealType(type).dealType);
}

export default async function DealsListingsPage({ params }: Props) {
  const { locale, type } = await params;
  const { valid, dealType } = resolveDealType(type);
  if (!valid) notFound();

  return (
    <ListingsPageShell
      locale={locale}
      categoryId={null}
      dealType={dealType}
      isDeals
    />
  );
}
