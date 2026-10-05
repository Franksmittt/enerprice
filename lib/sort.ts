import { sizeOf } from "./catalog";
import { resolvePrice } from "./pricing";
import type { SortDir, SortKey } from "./search-params";
import type { Product, Tier, WarrantyRule } from "./types";
import { resolveWarranty } from "./warranty";

export const SORT_LABELS: Record<SortKey, string> = {
  code: "Item code",
  size: "Size",
  specs: "Key specs",
  warranty: "Warranty",
  price: "Price",
};

const num = (value: string | undefined) => {
  const n = parseFloat(value ?? "");
  return Number.isFinite(n) ? n : undefined;
};

/** The headline number in the key specs: cranking amps for starter batteries, else capacity, else charger amps. */
function power(p: Product) {
  const s = p.specs ?? {};
  const kwh = num(s.kWh);
  return (
    num(s["CCA EN"]) ?? num(s.CCA) ?? num(s["CCA SAE"]) ?? num(s.Ah) ?? num(s["Ah 10hr"]) ?? num(s["Ah 5hr"]) ??
    (kwh === undefined ? undefined : kwh * 1000) ?? num(s.Amps)
  );
}

type Ctx = { tier: Tier | null; rules: WarrantyRule[] };

function sortValue(p: Product, key: SortKey, { tier, rules }: Ctx): string | number | undefined {
  switch (key) {
    case "code":
      return p.code;
    case "size":
      return sizeOf(p) ?? undefined;
    case "specs":
      return power(p);
    case "warranty": {
      const w = resolveWarranty(p, rules);
      return w ? (w.months ?? 0) : undefined;
    }
    case "price": {
      const price = tier ? resolvePrice(p, tier).price : 0;
      return price > 0 ? price : undefined;
    }
  }
}

/** Stable sort; products without a value (Price TBA, no specs) always go last. */
export function sortProducts(products: Product[], key: SortKey, dir: SortDir, ctx: Ctx) {
  const sign = dir === "asc" ? 1 : -1;
  return products
    .map((p) => ({ p, v: sortValue(p, key, ctx) }))
    .sort((a, b) => {
      if (a.v === undefined || b.v === undefined) return a.v === b.v ? 0 : a.v === undefined ? 1 : -1;
      const diff =
        typeof a.v === "number" && typeof b.v === "number"
          ? a.v - b.v
          : String(a.v).localeCompare(String(b.v), undefined, { numeric: true });
      return diff * sign;
    })
    .map(({ p }) => p);
}
