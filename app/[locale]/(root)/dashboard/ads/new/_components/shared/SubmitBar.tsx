"use client";

import { Loader2, Check } from "lucide-react";

interface SubmitBarProps {
  loading: boolean;
  error: string;
  onBack: () => void;
  submitLabel?: string;
}

export function SubmitBar({
  loading,
  error,
  onBack,
  submitLabel = "Publish Listing",
}: SubmitBarProps) {
  return (
    <div className="pt-2">
      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
      <div className="flex flex-col gap-2 min-[375px]:flex-row min-[375px]:items-center min-[375px]:justify-between min-[375px]:gap-0">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
