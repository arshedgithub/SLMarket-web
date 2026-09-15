import type { ReactNode } from "react";

type IconType = React.ComponentType<{ className?: string }>;

/* Shared section eyebrow pill — one look for every homepage section. */
export function SectionEyebrow({
  icon: Icon,
  children,
}: {
  icon: IconType;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 shadow-sm dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
      <Icon className="h-3 w-3" />
      {children}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  eyebrowIcon,
  heading,
  headingHighlight,
  subheading,
  right,
  className = "",
}: {
  eyebrow?: string;
  eyebrowIcon?: IconType;
  heading: string;
  headingHighlight?: string;
  subheading?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 sm:mb-5 ${className}`}>
      {eyebrow && eyebrowIcon && (
        <div className="mb-2.5">
          <SectionEyebrow icon={eyebrowIcon}>{eyebrow}</SectionEyebrow>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-heading truncate text-lg font-extrabold leading-tight tracking-tight text-[var(--color-market-text)] sm:text-3xl">
            {heading}
            {headingHighlight && (
              <>
                {" "}
                <span className="text-[#1557d6]">{headingHighlight}</span>
              </>
            )}
          </h2>

          {subheading && (
            <p className="mt-1 truncate text-xs text-[var(--color-market-text-muted)] sm:mt-1.5 sm:text-sm">
              {subheading}
            </p>
          )}
        </div>

        {right && (
          <div className="flex shrink-0 items-center gap-2">{right}</div>
        )}
      </div>
    </div>
  );
}
