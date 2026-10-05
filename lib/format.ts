const rand = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 });
const randCents = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatRand(amount: number, cents = false) {
  return (cents ? randCents : rand).format(amount);
}

export function pricelistNotes(settings: { pricelistNotes?: string }) {
  return (settings.pricelistNotes ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
