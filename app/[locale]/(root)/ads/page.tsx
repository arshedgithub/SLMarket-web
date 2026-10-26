import type { Metadata } from "next";
import {
  buildListingsMetadata,
  ListingsPageShell,
} from "./_components/ListingsPageShell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildListingsMetadata(locale, null);
}

export default async function ListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ListingsPageShell locale={locale} categoryId={null} />;
}
