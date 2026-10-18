/*
 * Storefront price rules.
 *
 * Price drop: shown only when the current price is lower than the LOWEST
 * price the product had in the previous 30 days (not a made-up list price),
 * and by a meaningful margin. Otherwise no percentage is shown at all.
 *
 * Instalments: shown only when the business offers that provider, and always
 * with the provider and the number of months, so the figure can be checked.
 */

export const MIN_DROP_RATIO = 0.05;

export function priceDropPercent(
  price: number,
  lowestPrice30d: number | undefined,
): number | null {
  if (!lowestPrice30d || lowestPrice30d <= 0) return null;
  const ratio = (lowestPrice30d - price) / lowestPrice30d;
  return ratio >= MIN_DROP_RATIO ? Math.round(ratio * 100) : null;
}

// Provider terms are configuration to confirm with each provider before
// launch, not market data. `months` is the default plan; card EPP plans
// differ per bank and product, so a product states its own months.
export const INSTALMENT_PROVIDERS = {
  koko: { name: "KOKO", defaultMonths: 3 },
  mintpay: { name: "Mintpay", defaultMonths: 3 },
  epp: { name: "Card EPP", defaultMonths: 12 },
} as const;

export type InstalmentProviderId = keyof typeof INSTALMENT_PROVIDERS;

export type InstalmentOffer = {
  provider: InstalmentProviderId;
  months?: number;
};

export type InstalmentQuote = {
  perMonth: number;
  months: number;
  providerName: string;
};

export function instalmentQuote(
  price: number,
  offer: InstalmentOffer | undefined,
  offeredProviders: InstalmentProviderId[],
): InstalmentQuote | null {
  if (!offer || !offeredProviders.includes(offer.provider)) return null;
  const provider = INSTALMENT_PROVIDERS[offer.provider];
  const months = offer.months ?? provider.defaultMonths;
  if (months < 2 || price <= 0) return null;
  return {
    perMonth: Math.round(price / months),
    months,
    providerName: provider.name,
  };
}
