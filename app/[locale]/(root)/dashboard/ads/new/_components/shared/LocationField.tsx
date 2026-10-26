"use client";

import { ChevronDown } from "lucide-react";
import { COUNTRIES } from "@/lib/utils/countries";

interface LocationFieldProps {
  country: string;
  city: string;
  onCountryChange: (code: string) => void;
  onCityChange: (city: string) => void;
  required?: boolean;
  label?: string;
  hint?: string;
  cityPlaceholder?: string;
}

export function LocationField({
  country,
  city,
  onCountryChange,
  onCityChange,
  required = false,
  label = "Location",
  hint,
  cityPlaceholder = "City / Region",
}: LocationFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && (
          <span className="ml-1.5 text-xs font-normal text-gray-400">
            {hint}
          </span>
        )}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <select
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full appearance-none border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 pr-8 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <input
          type="text"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder={cityPlaceholder}
          required={required && !country}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
