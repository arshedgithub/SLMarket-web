// Sri Lankan numbers in international digits ("0711000001" ->
// "94711000001"), the form tel: and wa.me links need. Anything that does
// not look like a phone number is dropped.
export function intlPhone(raw: string | null | undefined): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (/^0\d{9}$/.test(digits)) return `94${digits.slice(1)}`;
  if (/^94\d{9}$/.test(digits)) return digits;
  if (/^\d{9}$/.test(digits)) return `94${digits}`;
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}
