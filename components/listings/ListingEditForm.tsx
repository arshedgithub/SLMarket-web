"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  GEM_TYPE,
  JEWELLERY_TYPE,
  METAL_TYPE,
  METAL_PURITY,
  TREATMENT_STATUS,
  CERTIFICATION_BODY,
  SERVICE_TYPE,
  PRICING_TYPE,
} from "@/types/enums";
import {
  Field,
  TextInput,
  TextArea,
  SelectInput,
  Toggle,
} from "@/app/[locale]/(root)/dashboard/ads/new/_components/shared/FormFields";
import { ImageUploader } from "@/app/[locale]/(root)/dashboard/ads/new/_components/shared/ImageUploader";
import { ReelUploader } from "@/app/[locale]/(root)/dashboard/ads/new/_components/shared/ReelUploader";
import { CertificationUploader } from "@/app/[locale]/(root)/dashboard/ads/new/_components/shared/CertificationUploader";
import { LocationField } from "@/app/[locale]/(root)/dashboard/ads/new/_components/shared/LocationField";
import { PriceFields } from "@/app/[locale]/(root)/dashboard/ads/new/_components/shared/PriceFields";
import { SubmitBar } from "@/app/[locale]/(root)/dashboard/ads/new/_components/shared/SubmitBar";
import { COUNTRIES } from "@/lib/utils/countries";
import { X, Phone, PhoneOff } from "lucide-react";
import {
  CATEGORY_IMAGE_MAX,
  CERTIFICATION_IMAGE_MAX,
  getEffectiveLimit,
} from "@/lib/constants/imageLimits";

const WORLDWIDE = "Worldwide";

export interface EditableListing {
  id: string;
  title: string;
  description: string;
  images: string[];
  reelUrl: string | null;
  category: "GEM" | "JEWELLERY" | "PRECIOUS_METAL" | "SERVICE";
  price: number;
  currency: string;
  isWholesale: boolean;
  contactPhone: string | null;
  hideContactPhone: boolean;
  gemType: string | null;
  gemOrigin: string | null;
  caratWeight: number | null;
  currentLocation: string | null;
  treatmentStatus: string | null;
  certificationBody: string | null;
  certificationNumber: string | null;
  certificationImages: string[];
  dimensionL: number | null;
  dimensionW: number | null;
  dimensionH: number | null;
  isLotSale: boolean;
  lotSize: number | null;
  jewelleryType: string | null;
  ringSize: string | null;
  metalType: string | null;
  metalPurity: string | null;
  weightGrams: number | null;
  weightSovereigns: number | null;
  serviceType: string | null;
  pricingType: string | null;
  serviceArea: string[];
  turnaroundTime: string | null;
}

function parseLocation(currentLocation: string | null) {
  if (!currentLocation) return { country: "LK", city: "" };
  const parts = currentLocation.split(",").map((p) => p.trim());
  if (parts.length < 2) return { country: "LK", city: currentLocation };
  const countryName = parts[parts.length - 1];
  const city = parts.slice(0, -1).join(", ");
  const match = COUNTRIES.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase(),
  );
  return { country: match?.code ?? "LK", city };
}

export function ListingEditForm({
  listing,
  backHref,
  canUploadReels = true,
  reelsRemaining = null,
  reelsMaxPerMonth = null,
  planMaxImages = null,
  planMaxCertificationImages = null,
}: {
  listing: EditableListing;
  backHref: string;
  canUploadReels?: boolean;
  reelsRemaining?: number | null;
  reelsMaxPerMonth?: number | null;
  planMaxImages?: number | null;
  planMaxCertificationImages?: number | null;
}) {
  const router = useRouter();
  const initialLocation = parseLocation(listing.currentLocation);
  const imageLimit = getEffectiveLimit(
    CATEGORY_IMAGE_MAX[listing.category],
    planMaxImages,
  );
  const certLimit = getEffectiveLimit(
    CERTIFICATION_IMAGE_MAX,
    planMaxCertificationImages,
  );

  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [images, setImages] = useState(listing.images);
  const [reelUrl, setReelUrl] = useState(listing.reelUrl ?? "");
  const [price, setPrice] = useState(String(listing.price));
  const [currency, setCurrency] = useState(listing.currency);
  const [isWholesale, setIsWholesale] = useState(listing.isWholesale);
  const [contactPhone, setContactPhone] = useState(listing.contactPhone ?? "");
  const [hideContactPhone, setHideContactPhone] = useState(
    listing.hideContactPhone,
  );
  const [locationCountry, setLocationCountry] = useState(
    initialLocation.country,
  );
  const [locationCity, setLocationCity] = useState(initialLocation.city);
  const [certificationImages, setCertificationImages] = useState(
    listing.certificationImages,
  );
  const [origin, setOrigin] = useState(listing.gemOrigin ?? "");

  // Gem
  const [gemType, setGemType] = useState(listing.gemType ?? "");
  const [caratWeight, setCaratWeight] = useState(
    listing.caratWeight !== null ? String(listing.caratWeight) : "",
  );
  const [isLotSale, setIsLotSale] = useState(listing.isLotSale);
  const [lotSize, setLotSize] = useState(
    listing.lotSize !== null ? String(listing.lotSize) : "",
  );
  const [dimL, setDimL] = useState(
    listing.dimensionL !== null ? String(listing.dimensionL) : "",
  );
  const [dimW, setDimW] = useState(
    listing.dimensionW !== null ? String(listing.dimensionW) : "",
  );
  const [dimH, setDimH] = useState(
    listing.dimensionH !== null ? String(listing.dimensionH) : "",
  );
  const [treatmentStatus, setTreatmentStatus] = useState(
    listing.treatmentStatus ?? "",
  );
  const [certificationBody, setCertificationBody] = useState(
    listing.certificationBody ?? "",
  );
  const [certificationNumber, setCertificationNumber] = useState(
    listing.certificationNumber ?? "",
  );

  // Jewellery
  const [jewelleryType, setJewelleryType] = useState(
    listing.jewelleryType ?? "",
  );
  const [ringSize, setRingSize] = useState(listing.ringSize ?? "");

  // Metal (shared by JEWELLERY + PRECIOUS_METAL)
  const [metalType, setMetalType] = useState(listing.metalType ?? "");
  const [metalPurity, setMetalPurity] = useState(listing.metalPurity ?? "");
  const [weightGrams, setWeightGrams] = useState(
    listing.weightGrams !== null ? String(listing.weightGrams) : "",
  );
  const [weightSovereigns, setWeightSovereigns] = useState(
    listing.weightSovereigns !== null ? String(listing.weightSovereigns) : "",
  );

  // Service
  const [serviceType, setServiceType] = useState(listing.serviceType ?? "");
  const [pricingType, setPricingType] = useState(
    listing.pricingType ?? PRICING_TYPE.FIXED,
  );
  const [turnaroundTime, setTurnaroundTime] = useState(
    listing.turnaroundTime ?? "",
  );
  const [worldwide, setWorldwide] = useState(
    listing.serviceArea.includes(WORLDWIDE),
  );
  const [serviceAreas, setServiceAreas] = useState<string[]>(
    listing.serviceArea.includes(WORLDWIDE) ? [] : listing.serviceArea,
  );
  const [areaInput, setAreaInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const SOVEREIGN_TO_GRAMS = 7.9881;
  const handleGramsChange = (val: string) => {
    setWeightGrams(val);
    if (val && !isNaN(Number(val))) {
      setWeightSovereigns((Number(val) / SOVEREIGN_TO_GRAMS).toFixed(4));
    } else {
      setWeightSovereigns("");
    }
  };
  const handleSovereignsChange = (val: string) => {
    setWeightSovereigns(val);
    if (val && !isNaN(Number(val))) {
      setWeightGrams((Number(val) * SOVEREIGN_TO_GRAMS).toFixed(4));
    } else {
      setWeightGrams("");
    }
  };

  const addArea = () => {
    const trimmed = areaInput.trim();
    if (trimmed && !serviceAreas.includes(trimmed)) {
      setServiceAreas((prev) => [...prev, trimmed]);
    }
    setAreaInput("");
  };
  const removeArea = (area: string) => {
    setServiceAreas((prev) => prev.filter((a) => a !== area));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    const countryName =
      COUNTRIES.find((c) => c.code === locationCountry)?.name ??
      locationCountry;
    const currentLocation = locationCity
      ? `${locationCity}, ${countryName}`
      : countryName;

    const payload: Record<string, unknown> = {
      title,
      description,
      images,
      reelUrl: reelUrl || null,
      price: price ? Number(price) : undefined,
      currency,
      isWholesale,
      contactPhone: contactPhone || undefined,
      hideContactPhone,
    };

    if (listing.category === "GEM") {
      Object.assign(payload, {
        gemType: gemType || undefined,
        caratWeight: caratWeight ? Number(caratWeight) : undefined,
        dimensionL: dimL ? Number(dimL) : undefined,
        dimensionW: dimW ? Number(dimW) : undefined,
        dimensionH: dimH ? Number(dimH) : undefined,
        isLotSale,
        lotSize: isLotSale && lotSize ? Number(lotSize) : undefined,
        gemOrigin: origin || undefined,
        currentLocation,
        treatmentStatus: treatmentStatus || undefined,
        certificationBody: certificationBody || undefined,
        certificationNumber: certificationNumber || undefined,
        certificationImages,
      });
    } else if (listing.category === "JEWELLERY") {
      Object.assign(payload, {
        jewelleryType: jewelleryType || undefined,
        metalType: metalType || undefined,
        metalPurity: metalPurity || undefined,
        gemType: gemType || undefined,
        weightGrams: weightGrams ? Number(weightGrams) : undefined,
        ringSize: ringSize || undefined,
        gemOrigin: origin || undefined,
        currentLocation,
        certificationImages,
      });
    } else if (listing.category === "PRECIOUS_METAL") {
      Object.assign(payload, {
        metalType: metalType || undefined,
        metalPurity: metalPurity || undefined,
        weightGrams: weightGrams ? Number(weightGrams) : undefined,
        weightSovereigns: weightSovereigns
          ? Number(weightSovereigns)
          : undefined,
        gemOrigin: origin || undefined,
        currentLocation,
        certificationNumber: certificationNumber || undefined,
        certificationImages,
      });
    } else if (listing.category === "SERVICE") {
      Object.assign(payload, {
        serviceType: serviceType || undefined,
        pricingType,
        turnaroundTime: turnaroundTime || undefined,
        currentLocation,
        serviceArea: worldwide ? [WORLDWIDE] : serviceAreas,
      });
    }

    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        const errors: Record<string, string> = data.fieldErrors ?? {};
        setFieldErrors(errors);
        const firstKey = Object.keys(errors)[0];
        if (firstKey) {
          document
            .getElementById(`field-${firstKey}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        throw new Error(data.message ?? "Failed to save listing");
      }
      router.push(backHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save listing");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Title" name="title" required error={fieldErrors.title}>
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </Field>

      <Field
        label="Description"
        name="description"
        required
        error={fieldErrors.description}
      >
        <TextArea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </Field>

      <ImageUploader
        images={images}
        onChange={setImages}
        max={imageLimit.max}
        isPlanLimited={imageLimit.isPlanLimited}
        label="Photos"
      />

      <ReelUploader
        value={reelUrl}
        onChange={setReelUrl}
        canUpload={canUploadReels}
        remaining={reelsRemaining}
        maxPerMonth={reelsMaxPerMonth}
      />

      {listing.category === "GEM" && (
        <>
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <Toggle
              checked={isLotSale}
              onChange={setIsLotSale}
              label="This is a parcel / lot (multiple stones)"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Gem Type"
                name="gemType"
                error={fieldErrors.gemType}
              >
                <SelectInput
                  value={gemType}
                  onChange={(e) => setGemType(e.target.value)}
                >
                  <option value="">Select gem type</option>
                  {Object.values(GEM_TYPE).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              {isLotSale ? (
                <Field
                  label="Number of Stones"
                  name="lotSize"
                  error={fieldErrors.lotSize}
                >
                  <TextInput
                    type="number"
                    min="2"
                    value={lotSize}
                    onChange={(e) => setLotSize(e.target.value)}
                  />
                </Field>
              ) : (
                <Field
                  label="Total Carat Weight (ct)"
                  name="caratWeight"
                  error={fieldErrors.caratWeight}
                >
                  <TextInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={caratWeight}
                    onChange={(e) => setCaratWeight(e.target.value)}
                  />
                </Field>
              )}
            </div>
            {isLotSale && (
              <Field
                label="Total Carat Weight (ct)"
                name="caratWeight"
                error={fieldErrors.caratWeight}
              >
                <TextInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={caratWeight}
                  onChange={(e) => setCaratWeight(e.target.value)}
                />
              </Field>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Length (mm)"
              name="dimensionL"
              error={fieldErrors.dimensionL}
            >
              <TextInput
                type="number"
                value={dimL}
                onChange={(e) => setDimL(e.target.value)}
              />
            </Field>
            <Field
              label="Width (mm)"
              name="dimensionW"
              error={fieldErrors.dimensionW}
            >
              <TextInput
                type="number"
                value={dimW}
                onChange={(e) => setDimW(e.target.value)}
              />
            </Field>
            <Field
              label="Height (mm)"
              name="dimensionH"
              error={fieldErrors.dimensionH}
            >
              <TextInput
                type="number"
                value={dimH}
                onChange={(e) => setDimH(e.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Origin of Gem"
            name="gemOrigin"
            error={fieldErrors.gemOrigin}
          >
            <TextInput
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </Field>

          <LocationField
            country={locationCountry}
            city={locationCity}
            onCountryChange={setLocationCountry}
            onCityChange={setLocationCity}
            label="Current Location"
          />

          <Field
            label="Treatment Status"
            name="treatmentStatus"
            error={fieldErrors.treatmentStatus}
          >
            <SelectInput
              value={treatmentStatus}
              onChange={(e) => setTreatmentStatus(e.target.value)}
            >
              <option value="">Select treatment status</option>
              {Object.values(TREATMENT_STATUS).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
          </Field>

          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Certification</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Lab / Certification Body"
                name="certificationBody"
                error={fieldErrors.certificationBody}
              >
                <SelectInput
                  value={certificationBody}
                  onChange={(e) => setCertificationBody(e.target.value)}
                >
                  <option value="">Select lab</option>
                  {Object.values(CERTIFICATION_BODY).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field
                label="Certificate Number"
                name="certificationNumber"
                error={fieldErrors.certificationNumber}
              >
                <TextInput
                  value={certificationNumber}
                  onChange={(e) => setCertificationNumber(e.target.value)}
                />
              </Field>
            </div>
            <CertificationUploader
              images={certificationImages}
              onChange={setCertificationImages}
              max={certLimit.max}
              isPlanLimited={certLimit.isPlanLimited}
            />
          </div>
        </>
      )}

      {listing.category === "JEWELLERY" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Jewellery Type"
              name="jewelleryType"
              error={fieldErrors.jewelleryType}
            >
              <SelectInput
                value={jewelleryType}
                onChange={(e) => setJewelleryType(e.target.value)}
              >
                <option value="">Select type</option>
                {Object.values(JEWELLERY_TYPE).map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </SelectInput>
            </Field>
            {jewelleryType === JEWELLERY_TYPE.RING && (
              <Field
                label="Ring Size"
                name="ringSize"
                error={fieldErrors.ringSize}
              >
                <TextInput
                  value={ringSize}
                  onChange={(e) => setRingSize(e.target.value)}
                />
              </Field>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Metal Type"
              name="metalType"
              error={fieldErrors.metalType}
            >
              <SelectInput
                value={metalType}
                onChange={(e) => setMetalType(e.target.value)}
              >
                <option value="">Select metal</option>
                {Object.values(METAL_TYPE).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field
              label="Metal Purity / Hallmark"
              name="metalPurity"
              error={fieldErrors.metalPurity}
            >
              <TextInput
                value={metalPurity}
                onChange={(e) => setMetalPurity(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Accent Gemstone"
              name="gemType"
              error={fieldErrors.gemType}
            >
              <SelectInput
                value={gemType}
                onChange={(e) => setGemType(e.target.value)}
              >
                <option value="">None / Not specified</option>
                {Object.values(GEM_TYPE).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field
              label="Total Weight (grams)"
              name="weightGrams"
              error={fieldErrors.weightGrams}
            >
              <TextInput
                type="number"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Origin" name="gemOrigin" error={fieldErrors.gemOrigin}>
            <TextInput
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </Field>
          <LocationField
            country={locationCountry}
            city={locationCity}
            onCountryChange={setLocationCountry}
            onCityChange={setLocationCity}
            label="Current Location"
          />
          <CertificationUploader
            images={certificationImages}
            onChange={setCertificationImages}
            max={certLimit.max}
            isPlanLimited={certLimit.isPlanLimited}
            label="Hallmark / certification documents (optional)"
          />
        </>
      )}

      {listing.category === "PRECIOUS_METAL" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Metal Type"
              name="metalType"
              error={fieldErrors.metalType}
            >
              <SelectInput
                value={metalType}
                onChange={(e) => setMetalType(e.target.value)}
              >
                <option value="">Select metal type</option>
                {Object.values(METAL_TYPE).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field
              label="Purity / Karat"
              name="metalPurity"
              error={fieldErrors.metalPurity}
            >
              <SelectInput
                value={metalPurity}
                onChange={(e) => setMetalPurity(e.target.value)}
              >
                <option value="">Select purity</option>
                {Object.values(METAL_PURITY).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Grams (g)"
                name="weightGrams"
                error={fieldErrors.weightGrams}
              >
                <TextInput
                  type="number"
                  value={weightGrams}
                  onChange={(e) => handleGramsChange(e.target.value)}
                />
              </Field>
              <Field
                label="Sovereigns"
                name="weightSovereigns"
                error={fieldErrors.weightSovereigns}
              >
                <TextInput
                  type="number"
                  value={weightSovereigns}
                  onChange={(e) => handleSovereignsChange(e.target.value)}
                />
              </Field>
            </div>
          </div>
          <Field label="Origin" name="gemOrigin" error={fieldErrors.gemOrigin}>
            <TextInput
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </Field>
          <LocationField
            country={locationCountry}
            city={locationCity}
            onCountryChange={setLocationCountry}
            onCityChange={setLocationCity}
            label="Current Location"
          />
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <Field
              label="Assay / Hallmark Certificate Number"
              name="certificationNumber"
              error={fieldErrors.certificationNumber}
            >
              <TextInput
                value={certificationNumber}
                onChange={(e) => setCertificationNumber(e.target.value)}
              />
            </Field>
            <CertificationUploader
              images={certificationImages}
              onChange={setCertificationImages}
              max={certLimit.max}
              isPlanLimited={certLimit.isPlanLimited}
              label="Hallmark / assay documents (optional)"
            />
          </div>
        </>
      )}

      {listing.category === "SERVICE" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Service Type"
              name="serviceType"
              error={fieldErrors.serviceType}
            >
              <SelectInput
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              >
                <option value="">Select service type</option>
                {Object.values(SERVICE_TYPE).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field
              label="Pricing Type"
              name="pricingType"
              error={fieldErrors.pricingType}
            >
              <SelectInput
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value)}
              >
                {Object.values(PRICING_TYPE).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
          <Field
            label="Typical Turnaround Time"
            name="turnaroundTime"
            error={fieldErrors.turnaroundTime}
          >
            <TextInput
              value={turnaroundTime}
              onChange={(e) => setTurnaroundTime(e.target.value)}
            />
          </Field>
          <LocationField
            country={locationCountry}
            city={locationCity}
            onCountryChange={setLocationCountry}
            onCityChange={setLocationCity}
            label="Workshop / Shop Location"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Service Area
            </label>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={worldwide}
                onChange={(e) => {
                  setWorldwide(e.target.checked);
                  if (e.target.checked) setServiceAreas([]);
                }}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Worldwide: I can serve clients globally
              </span>
            </label>
            {!worldwide && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArea();
                      }
                    }}
                    placeholder="Type a city or country, then press Enter"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addArea}
                    disabled={!areaInput.trim()}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {serviceAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {serviceAreas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => removeArea(area)}
                          className="ml-0.5 hover:text-green-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <PriceFields
        price={price}
        currency={currency}
        onPriceChange={setPrice}
        onCurrencyChange={setCurrency}
      />

      {listing.category !== "SERVICE" && (
        <Toggle
          checked={isWholesale}
          onChange={setIsWholesale}
          label="List as wholesale"
        />
      )}

      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-700">
          Contact Preference
        </p>
        <Field
          label="Contact Phone"
          name="contactPhone"
          hint="Leave blank to use your profile number"
          error={fieldErrors.contactPhone}
        >
          <TextInput
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </Field>
        <Toggle
          checked={!hideContactPhone}
          onChange={(checked) => setHideContactPhone(!checked)}
          label="Show phone number"
          hint="Turn off to receive enquiries through site messages only."
          onIcon={Phone}
          offIcon={PhoneOff}
        />
      </div>

      <SubmitBar
        loading={loading}
        error={error}
        onBack={() => router.push(backHref)}
        submitLabel="Save Changes"
      />
    </form>
  );
}
