"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export const inputClass =
  "w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60";

export const labelClass =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  name?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({
  label,
  required,
  hint,
  name,
  error,
  children,
}: FieldProps) {
  const content =
    error && React.isValidElement<{ className?: string }>(children)
      ? React.cloneElement(children, {
          className: [
            children.props.className ?? "",
            "border-red-500 focus:ring-red-500",
          ]
            .filter(Boolean)
            .join(" "),
        })
      : children;

  return (
    <div id={name ? `field-${name}` : undefined}>
      <label className={labelClass}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {content}
      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input className={`${inputClass} ${className}`} {...rest} />;
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className = "", ...rest } = props;
  return (
    <textarea className={`${inputClass} resize-none ${className}`} {...rest} />
  );
}

export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  const { className = "", ...rest } = props;
  return (
    <div className="relative">
      <select
        className={`${inputClass} appearance-none pr-9 ${className}`}
        {...rest}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
}

const TOGGLE_TRACK_COLOR = {
  blue: "bg-blue-600",
  green: "bg-green-600",
} as const;

const TOGGLE_ICON_COLOR = {
  blue: "text-blue-600",
  green: "text-green-600",
} as const;

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  onIcon: OnIcon,
  offIcon: OffIcon,
  color = "blue",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
  // Optional icons rendered inside the sliding thumb itself (matching the
  // light/dark mode switch in the mobile nav) instead of a plain circle.
  onIcon?: React.ComponentType<{ className?: string }>;
  offIcon?: React.ComponentType<{ className?: string }>;
  // Lets a toggle whose "on" state has its own brand association (e.g.
  // WhatsApp) use that color instead of the default blue.
  color?: keyof typeof TOGGLE_TRACK_COLOR;
}) {
  const hasIcons = OnIcon && OffIcon;

  return (
    <div className="flex items-start justify-between gap-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        {hint && (
          <span className="block text-xs text-gray-400 mt-0.5">{hint}</span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
          hasIcons ? "h-7 w-14" : "h-6 w-11"
        } ${checked ? TOGGLE_TRACK_COLOR[color] : "bg-gray-300 dark:bg-gray-700"}`}
      >
        <span
          className={`inline-flex items-center justify-center transform rounded-full bg-white shadow transition-transform ${
            hasIcons
              ? `h-6 w-6 ${checked ? "translate-x-7" : "translate-x-0.5"}`
              : `h-5 w-5 ${checked ? "translate-x-5" : "translate-x-0.5"}`
          }`}
        >
          {hasIcons &&
            (checked ? (
              <OnIcon className={`h-3.5 w-3.5 ${TOGGLE_ICON_COLOR[color]}`} />
            ) : (
              <OffIcon className="h-3.5 w-3.5 text-gray-500" />
            ))}
        </span>
      </button>
    </div>
  );
}
