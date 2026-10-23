/** Persian digit helpers — keeps human-facing counts consistent with the UI. */
const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function faNum(value: number | string): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export function faCount(value: number): string {
  return value.toLocaleString("fa-IR");
}
