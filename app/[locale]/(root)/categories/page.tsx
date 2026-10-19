import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { categories } from "@/config/const/navLinks";
import { localeAlternates } from "@/lib/seo/hreflang";
import { CategoryDirectory } from "@/components/categories/CategoryDirectory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.categoriesPage" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: { languages: localeAlternates("/categories") },
  };
}

// Every category and sub-category on one crawlable page.
export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home.categoriesPage" });
  const tCat = await getTranslations({ locale, namespace: "categories" });

  const all = categories.map((c) => ({
    id: c.id,
    name: tCat(`${c.id}.name`),
    iconName: c.icon,
    subcategories: c.subcategories.map((s) => ({
      id: s.id,
      name: tCat(`${c.id}.subcategories.${s.id}`),
    })),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[var(--color-market-text)]">
        {t("title")}
      </h1>
      <p className="mt-2 text-[15px] text-[var(--color-market-text-secondary)]">
        {t("intro")}
      </p>
      <div className="mt-8">
        <CategoryDirectory
          categories={all}
          columnsClassName="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />
      </div>
    </div>
  );
}
