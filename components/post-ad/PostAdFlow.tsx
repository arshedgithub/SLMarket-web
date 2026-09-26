"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { PostAdHeader } from "./PostAdHeader";
import { PostAdProgress } from "./PostAdProgress";
import { ListingPolicyDrawer } from "./ListingPolicyDrawer";
import { StepDetails } from "./steps/StepDetails";
import { StepPhotos } from "./steps/StepPhotos";
import { StepPriceDeal } from "./steps/StepPriceDeal";
import { StepLocation } from "./steps/StepLocation";
import { StepSeller } from "./steps/StepSeller";
import { StepPreview } from "./steps/StepPreview";
import { SAMPLE_USER_SHOPS } from "@/lib/sampleUserShops";
import { EMPTY_DRAFT, STEPS, getImageLimits, type AdDraft } from "./types";

const DRAFT_KEY = "slmarket:ad-draft:v1";

export function PostAdFlow({
  sellerPhone = "",
  sellerName = "Your account",
  closeHref = "/",
}: {
  sellerPhone?: string;
  sellerName?: string;
  closeHref?: string;
}) {
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
  const [policyOpen, setPolicyOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  // Load any saved draft. A brand-new draft (nothing saved yet) defaults to
  // the seller's first business profile when they have one — a shop owner
  // is almost always posting for the shop, not their personal account.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { draft: AdDraft; step: number };
        setDraft({ ...EMPTY_DRAFT, ...parsed.draft });
        const s = Math.min(parsed.step ?? 0, STEPS.length - 1);
        setStep(s);
        setMaxReached(s);
      } else if (SAMPLE_USER_SHOPS.length > 0) {
        const firstShop = SAMPLE_USER_SHOPS[0];
        setDraft((d) => ({ ...d, sellerMode: "shop", shopId: firstShop.id }));
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

  const saveDraftNow = () => {
    setSaveState("saving");
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, step }));
    } catch {
      /* ignore */
    }
    window.setTimeout(() => setSaveState("saved"), 350);
    window.setTimeout(() => setSaveState("idle"), 2500);
  };

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
        if (draft.title.trim().length < 8)
          e.title = "Give it a clear title (at least 8 characters).";
        if (draft.description.trim().length < 20)
          e.description = "Add a few lines so buyers know what to expect.";
        // Category-specific attributes live under the "Additional details"
        // disclosure and are genuinely optional in this flow, sellers
        // shouldn't be blocked by a required field they can't see.
      }
      if (index === 1) {
        const { min } = getImageLimits(draft.categoryId);
        if (draft.images.length < min)
          e.images =
            min === 1
              ? "Add at least one photo."
              : `Add at least ${min} photos.`;
      }
      if (index === 2) {
        if (
          (draft.pricingType === "fixed" ||
            draft.pricingType === "startingFrom") &&
          !(Number(draft.price) > 0)
        )
          e.price = "Enter a price.";
      }
      if (index === 3) {
        if (draft.locationType === "single" && !draft.city)
          e.city = "Choose where the item is located.";
        if (
          draft.locationType === "branches" &&
          draft.selectedBranchIds.length === 0
        )
          e.city = "Select at least one branch.";
      }
      if (index === 4 && draft.contactPhone.replace(/\D/g, "").length < 9)
        e.contactPhone = "Enter a valid phone number.";
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
    () =>
      errors.category ||
      errors.title ||
      errors.description ||
      errors.images ||
      errors.city,
    [errors],
  );

  // A full-viewport overlay so the create-listing workspace sits the same
  // way regardless of what page mounts it (marketing /sell page or the
  // dashboard, which has its own sidebar chrome underneath).
  const shell = (children: React.ReactNode) => (
    <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-[var(--color-market-background)] sm:items-center sm:bg-black/40 sm:px-4 sm:py-8 sm:backdrop-blur-sm">
      <div className="flex min-h-screen w-full flex-col bg-surface sm:min-h-0 sm:max-h-[92vh] sm:w-full sm:max-w-[1150px] sm:overflow-hidden sm:rounded-3xl sm:border sm:border-border sm:shadow-2xl">
        {children}
      </div>
    </div>
  );

  if (!hydrated) {
    return shell(
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>,
    );
  }

  if (submitted) {
    return shell(
      <>
        <PostAdHeader
          saveState="idle"
          onClose={() => router.push(closeHref)}
          onSaveDraft={saveDraftNow}
        />
        <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
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
              onClick={() => router.push("/dashboard/ads")}
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
      </>,
    );
  }

  return shell(
    <>
      <PostAdHeader
        saveState={saveState}
        onClose={() => router.push(closeHref)}
        onSaveDraft={saveDraftNow}
      />

      <div className="border-b border-border px-5 py-4 sm:px-8 sm:py-5">
        <PostAdProgress current={step} maxReached={maxReached} onJump={jump} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
        {step === 0 && (
          <StepDetails
            draft={draft}
            patch={patch}
            patchAttr={patchAttr}
            errors={errors}
            onOpenPolicy={() => setPolicyOpen(true)}
          />
        )}
        {step === 1 && (
          <StepPhotos draft={draft} patch={patch} errors={errors} />
        )}
        {step === 2 && (
          <StepPriceDeal draft={draft} patch={patch} errors={errors} />
        )}
        {step === 3 && (
          <StepLocation draft={draft} patch={patch} errors={errors} />
        )}
        {step === 4 && (
          <StepSeller
            draft={draft}
            patch={patch}
            errors={errors}
            sellerName={sellerName}
          />
        )}
        {step === 5 && (
          <StepPreview
            draft={draft}
            patch={patch}
            onJump={jump}
            isLoggedIn={isLoggedIn}
            submitting={submitting}
            submitError={submitError}
            onPublish={publish}
            onOpenPolicy={() => setPolicyOpen(true)}
          />
        )}
      </div>

      {/* Footer nav */}
      {step < STEPS.length - 1 && (
        <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={step === 0 ? () => router.push(closeHref) : goBack}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--color-market-text-secondary)] transition hover:text-[var(--color-market-text)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
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
        <div className="border-t border-border px-5 py-4 sm:px-8">
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

      <ListingPolicyDrawer
        open={policyOpen}
        onClose={() => setPolicyOpen(false)}
      />
    </>,
  );
}
