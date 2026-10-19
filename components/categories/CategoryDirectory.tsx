import { Link } from "@/i18n/navigation";
import { CategoryIconBox } from "./CategoryIconBox";

export type CategoryNavItem = {
  id: string;
  name: string;
  iconName: string;
  subcategories: { id: string; name: string }[];
};

/*
 * Every category with its sub-categories, as plain links: the "All
 * categories" panel and the /categories page show the same list.
 */
export function CategoryDirectory({
  categories,
  onNavigate,
  columnsClassName = "sm:grid-cols-2 lg:grid-cols-4",
}: {
  categories: CategoryNavItem[];
  onNavigate?: () => void;
  columnsClassName?: string;
}) {
  return (
    <ul className={`grid gap-x-6 gap-y-6 ${columnsClassName}`}>
      {categories.map((c) => (
        <li key={c.id}>
          <Link
            href={`/ads/${c.id}`}
            onClick={onNavigate}
            className="group flex items-center gap-2.5 text-[15px] font-bold text-[var(--color-market-text)] hover:text-blue-700"
          >
            <CategoryIconBox iconName={c.iconName} size="sm" />
            {c.name}
          </Link>
          <ul className="mt-2 grid gap-1.5 pl-[42px]">
            {c.subcategories.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/ads/${c.id}/${s.id}`}
                  onClick={onNavigate}
                  className="text-sm text-[var(--color-market-text-secondary)] hover:text-blue-700 hover:underline"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
