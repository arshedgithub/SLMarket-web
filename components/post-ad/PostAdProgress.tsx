"use client";

import { Check } from "lucide-react";
import { STEPS } from "./types";

export function PostAdProgress({
  current,
  maxReached,
  onJump,
}: {
  current: number;
  maxReached: number;
  onJump: (index: number) => void;
}) {
  return (
    <>
      {/* Desktop: vertical rail */}
      <ol className="hidden lg:block">
        {STEPS.map((step, i) => {
          const done = i < maxReached;
          const active = i === current;
          const reachable = i <= maxReached;
          return (
            <li key={step.id} className="relative flex gap-3.5 pb-7 last:pb-0">
              {i < STEPS.length - 1 && (
                <span
                  className={`absolute left-[13px] top-7 h-full w-px ${
                    done ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onJump(i)}
                className={`relative z-10 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                  active
                    ? "border-primary bg-primary text-white"
                    : done
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-[var(--color-market-text-muted)]"
                } ${reachable ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </button>
              <div className="pt-1">
                <p
                  className={`text-sm font-semibold ${
                    active
                      ? "text-[var(--color-market-text)]"
                      : "text-[var(--color-market-text-muted)]"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact bar */}
      <div className="lg:hidden">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--color-market-text)]">
            {STEPS[current].label}
          </p>
          <p className="text-xs font-medium text-[var(--color-market-text-muted)]">
            Step {current + 1} of {STEPS.length}
          </p>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= current ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
