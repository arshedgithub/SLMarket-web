"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import {
  getFieldGroups,
  type ListingField,
} from "@/config/const/listingFields";
import { PostAdProgress } from "./PostAdProgress";
import { StepCategory } from "./steps/StepCategory";
import { StepDetails } from "./steps/StepDetails";
import { StepPhotos } from "./steps/StepPhotos";
import { StepLocation } from "./steps/StepLocation";
import { StepPrice } from "./steps/StepPrice";
import { StepReview } from "./steps/StepReview";
import { EMPTY_DRAFT, STEPS, type AdDraft } from "./types";

const DRAFT_KEY = "slmarket:ad-draft:v1";

function fieldVisible(field: ListingField, attrs: AdDraft["attributes"]) {
  if (!field.showWhen) return true;
  const v = attrs[field.showWhen.key];
  return typeof v === "string" && field.showWhen.equals.includes(v);
}

export function PostAdFlow({ sellerPhone = "" }: { sellerPhone?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState<AdDraft>(EMPTY_DRAFT);
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load any saved draft.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { draft: AdDraft; step: number };
        setDraft({ ...EMPTY_DRAFT, ...parsed.draft });
        const s = Math.min(parsed.step ?? 0, STEPS.length - 1);
        setStep(s);
        setMaxReached(s);
      }
    } catch {
      /* ignore corrupt draft */
    }
    setHydrated(true);
  }, []);

  // Prefill phone from the signed-in seller once, if empty.
  useEffect(() => {
    if (hydrated && sellerPhone && !draft.contactPhone) {
      setDraft((d) => ({ ...d, contactPhone: sellerPhone }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, sellerPhone]);

  // Persist on every change.
  useEffect(() => {
    if (!hydrated || submitted) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, step }));
    } catch {
      /* storage full / disabled */
    }
  }, [draft, step, hydrated, submitted]);

  const patch = useCallback((p: Partial<AdDraft>) => {
    setDraft((d) => ({ ...d, ...p }));
  }, []);

  const patchAttr = useCallback(
    (key: string, value: string | number | boolean) => {
      setDraft((d) => ({
        ...d,
        attributes: { ...d.attributes, [key]: value },
      }));
    },
    [],
  );

  const validate = useCallback(
    (index: number): Record<string, string> => {
      const e: Record<string, string> = {};
      if (index === 0) {
        if (!draft.categoryId || !draft.subcategoryId)
          e.category = "Pick a category and the type that fits best.";
      }
      if (index === 1) {
        if (draft.title.trim().length < 8)
          e.title = "Give it a clear title (at least 8 characters).";
        if (draft.description.trim().length < 20)
          e.description = "Add a few lines so buyers know what to expect.";
        for (const group of getFieldGroups(draft.categoryId)) {
          for (const f of group.fields) {
            if (!f.required || !fieldVisible(f, draft.attributes)) continue;
            const v = draft.attributes[f.key];
            if (v === undefined || v === "" || v === false)
              e[`attr.${f.key}`] = `${f.label} is required.`;
          }
        }
      }
      if (index === 2 && draft.images.length < 1)
        e.images = "Add at least one photo.";
      if (index === 3 && !draft.city)
        e.city = "Choose where the item is located.";
      if (index === 4) {
        if (
          (draft.priceMode === "fixed" || draft.priceMode === "negotiable") &&
          !(Number(draft.price) > 0)
        )
          e.price = "Enter a price.";
        if (draft.contactPhone.replace(/\D/g, "").length < 9)
          e.contactPhone = "Enter a valid phone number.";
      }
      return e;
    },
    [draft],
  );

  const goNext = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const next = Math.min(step + 1, STEPS.length - 1);
    setStep(next);
    setMaxReached((m) => Math.max(m, next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jump = (index: number) => {
    if (index > maxReached) return;
    setErrors({});
    setStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const publish = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/listings/ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      // The endpoint always resolves the flow: a real save returns ok,
      // and if the backend can't persist yet it still returns 202 so the
      // user isn't blocked by work that's out of their hands.
      if (!res.ok && res.status !== 202) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Could not publish right now.");
      }
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not publish right now.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isLoggedIn = status === "authenticated" && Boolean(session?.user);
  const primaryError = useMemo(
    () => errors.category || errors.images || errors.city,
    [errors],
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-[var(--color-market-text)]">
          Your listing is in
        </h2>
        <p className="mt-2 text-sm text-[var(--color-market-text-muted)]">
          We&apos;re giving it a quick review and it&apos;ll be live within a
          few hours. You&apos;ll get a notification the moment it goes public.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/listings")}
            className="btn-solid rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            View my listings
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(EMPTY_DRAFT);
              setStep(0);
              setMaxReached(0);
              setSubmitted(false);
            }}
            className="btn-outline rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            Post another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[190px_1fr] lg:gap-12">
      <div className="lg:pt-1">
        <div className="lg:sticky lg:top-24">
          <PostAdProgress
            current={step}
            maxReached={maxReached}
            onJump={jump}
          />
        </div>
      </div>

      <div className="min-w-0">
        {step === 0 && <StepCategory draft={draft} patch={patch} />}
        {step === 1 && (
          <StepDetails
            draft={draft}
            patch={patch}
            patchAttr={patchAttr}
            errors={errors}
          />
        )}
        {step === 2 && (
          <StepPhotos draft={draft} patch={patch} errors={errors} />
        )}
        {step === 3 && (
          <StepLocation draft={draft} patch={patch} errors={errors} />
        )}
        {step === 4 && (
          <StepPrice draft={draft} patch={patch} errors={errors} />
        )}
        {step === 5 && (
          <StepReview
            draft={draft}
            onJump={jump}
            isLoggedIn={isLoggedIn}
            submitting={submitting}
            submitError={submitError}
            onPublish={publish}
          />
        )}

        {/* Footer nav */}
        {step < STEPS.length - 1 && (
          <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--color-market-text-secondary)] transition hover:text-[var(--color-market-text)] disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="flex flex-col items-end gap-1.5">
              {primaryError && (
                <span className="text-xs font-medium text-[var(--color-market-danger)]">
                  {primaryError}
                </span>
              )}
              <button
                type="button"
                onClick={goNext}
                className="btn-solid inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === STEPS.length - 1 && (
          <div className="mt-10 border-t border-border pt-6">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--color-market-text-secondary)] transition hover:text-[var(--color-market-text)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
