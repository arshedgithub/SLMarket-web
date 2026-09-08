"use client";

import React from "react";
import { Check, Minus, Plus } from "lucide-react";

/* ============================================================
   Field shell
   ============================================================ */

export function FieldShell({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label className="text-sm font-semibold text-[var(--color-market-text)]">
          {label}
          {required && (
            <span className="ml-0.5 text-[var(--color-market-danger)]">*</span>
          )}
        </label>
        {hint && !error && (
          <span className="text-xs text-[var(--color-market-text-muted)]">
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-[var(--color-market-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   Segmented control  (2-5 options, button row)
   ============================================================ */

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-background p-1.5">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(active ? "" : opt)}
            className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              active
                ? "bg-surface text-primary shadow-sm ring-1 ring-primary/25"
                : "text-[var(--color-market-text-secondary)] hover:text-[var(--color-market-text)]"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   Chip group  (single or multi select pills)
   ============================================================ */

export function ChipGroup({
  options,
  value,
  onChange,
  multi = false,
}: {
  options: string[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  const toggle = (opt: string) => {
    if (multi) {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt];
      onChange(next);
    } else {
      onChange(selected[0] === opt ? "" : opt);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface text-[var(--color-market-text-secondary)] hover:border-primary/40 hover:text-[var(--color-market-text)]"
            }`}
          >
            {active && <Check className="h-3.5 w-3.5" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   Stepper  (integer +/-)
   ============================================================ */

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number | "";
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const n = value === "" ? min : value;
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface p-1.5">
      <button
        type="button"
        onClick={() => set(n - 1)}
        disabled={n <= min}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-background text-[var(--color-market-text)] transition hover:bg-primary/10 hover:text-primary disabled:opacity-40"
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-10 text-center text-base font-bold text-[var(--color-market-text)]">
        {value === "" ? "0" : value}
      </span>
      <button
        type="button"
        onClick={() => set(n + 1)}
        disabled={n >= max}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-background text-[var(--color-market-text)] transition hover:bg-primary/10 hover:text-primary disabled:opacity-40"
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ============================================================
   Text / number inputs
   ============================================================ */

const baseInput =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-[var(--color-market-text)] outline-none transition placeholder:text-[var(--color-market-text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/20";

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input className={`${baseInput} ${className}`} {...rest} />;
}

export function NumberField({
  value,
  onChange,
  unit,
  placeholder,
  min,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseInput} ${unit ? "pr-14" : ""} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
      />
      {unit && (
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--color-market-text-muted)]">
          {unit}
        </span>
      )}
    </div>
  );
}

export function TextAreaField(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      className={`${baseInput} min-h-[120px] resize-y leading-relaxed ${className}`}
      {...rest}
    />
  );
}

/* ============================================================
   Toggle row
   ============================================================ */

export function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all ${
        checked
          ? "border-primary/40 bg-primary/[0.06]"
          : "border-border bg-surface hover:border-primary/30"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--color-market-text)]">
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-xs text-[var(--color-market-text-muted)]">
            {hint}
          </span>
        )}
      </span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-[var(--color-market-border-strong)]"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
