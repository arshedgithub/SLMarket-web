import { categoryIcon } from "@/config/const/categoryIcons";

/*
 * One icon style for every category: brand blue on a light brand tint,
 * turning solid blue when its tile is hovered, focused or selected
 * (the parent carries the `group` class).
 */
export function CategoryIconBox({
  iconName,
  size = "md",
  selected = false,
}: {
  iconName: string;
  size?: "sm" | "md";
  selected?: boolean;
}) {
  const Icon = categoryIcon(iconName);
  const box = size === "sm" ? "h-8 w-8 rounded-lg" : "h-11 w-11 rounded-xl";
  const glyph = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center transition-colors ${box} ${
        selected
          ? "bg-blue-600 text-white"
          : "bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white group-focus-visible:bg-blue-600 group-focus-visible:text-white dark:bg-blue-950 dark:text-blue-300"
      }`}
    >
      <Icon className={glyph} />
    </span>
  );
}
