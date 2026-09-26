"use client";

import { STEPS } from "./types";

// Horizontal numbered-circle stepper across the top of the workspace.
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
    <div>
      {/* Desktop / tablet: full stepper with connecting lines + labels */}
      <ol className="hidden items-start sm:flex">
        {STEPS.map((step, i) => {
          const done = i < maxReached;
          const active = i === current;
          const reachable = i <= maxReached;
          return (
            <li
              key={step.id}
              className="flex flex-1 items-center last:flex-none"
            >
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => onJump(i)}
                  aria-current={active ? "step" : undefined}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                    active || done
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-[var(--color-market-text-muted)]"
                  } ${reachable ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                  {i + 1}
                </button>
                <span
                  className={`whitespace-nowrap text-[11px] font-semibold ${
                    active
                      ? "text-primary"
                      : done
                        ? "text-[var(--color-market-text)]"
                        : "text-[var(--color-market-text-muted)]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={`mx-1.5 mb-5 h-0.5 min-w-[16px] flex-1 rounded-full ${
                    i < maxReached ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact "step X of N" + progress bar */}
      <div className="sm:hidden">
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
    </div>
  );
}
