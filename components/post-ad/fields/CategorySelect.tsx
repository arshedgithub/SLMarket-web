"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { categoryIcon } from "@/config/const/categoryIcons";

export type SelectOption = {
  id: string;
  name: string;
  iconName?: string;
};

// A searchable dropdown field styled like a form input rather than a pill —
// used for the category / subcategory pickers in Step 1. Opens a small
// search + list panel instead of a native <select>'s flat option list,
// per the "searchable category selector rather than a huge dropdown" brief.
export function CategorySelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  options: SelectOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideClick([ref], () => setOpen(false));

  const selected = options.find((o) => o.id === value);
  const SelectedIcon = selected?.iconName
    ? categoryIcon(selected.iconName)
    : null;

  const filtered = query
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full items-center gap-2.5 rounded-xl border bg-surface px-3.5 py-2.5 text-left text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${
          open ? "border-primary ring-2 ring-primary/20" : "border-border"
        }`}
      >
        {SelectedIcon && (
          <SelectedIcon className="h-4 w-4 shrink-0 text-primary" />
        )}
        <span
          className={`flex-1 truncate ${selected ? "font-medium text-[var(--color-market-text)]" : "text-[var(--color-market-text-muted)]"}`}
        >
          {selected ? selected.name : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--color-market-text-muted)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border px-3.5 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-[var(--color-market-text-muted)]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-market-text-muted)]"
            />
          </div>
          <div className="scrollbar-hide max-h-64 overflow-y-auto p-1.5">
            {filtered.length === 0 && (
              <p className="px-3 py-3 text-sm text-[var(--color-market-text-muted)]">
                No matches
              </p>
            )}
            {filtered.map((opt) => {
              const Icon = opt.iconName ? categoryIcon(opt.iconName) : null;
              const active = opt.id === value;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm text-[var(--color-market-text)] hover:bg-background"
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0 text-primary" />}
                  <span className="flex-1 truncate">{opt.name}</span>
                  {active && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
