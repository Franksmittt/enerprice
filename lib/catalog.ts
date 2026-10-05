import type { Category, Pillar, Product } from "./types";

export const PILLARS: { id: Pillar; name: string }[] = [
  { id: "batteries", name: "Batteries" },
  { id: "charging", name: "Chargers & testing" },
  { id: "accessories", name: "Accessories" },
];

export function isBattery(p: Product) {
  const s = p.specs ?? {};
  return Boolean(s.SABMA || s.Ah || s["Ah 10hr"] || s.kWh);
}

/** Read from the product name, since the source pricelists don't carry chemistry as a field. */
export function chemistry(p: Product): string | null {
  if (!isBattery(p)) return null;
  const text = `${p.group} ${p.description}`;
  if (/LiFePO4|lithium/i.test(text) || p.specs?.kWh) return "Lithium";
  if (/\bAGM\b/.test(text)) return "AGM";
  if (/\bEFB\b/.test(text)) return "EFB";
  if (/\bgel\b|iGel/i.test(text)) return "Gel";
  return "Flooded";
}

/** Lithium packs are sold by nominal system voltage (12.8V is a 12V battery). */
const NOMINAL: Record<string, string> = { "12.8": "12", "25.6": "24", "38.4": "36", "51.2": "48" };

export function voltage(p: Product): string | null {
  const raw =
    p.specs?.V ??
    p.description.match(/(\d+(?:\.\d+)?(?:\/\d+)?)\s?V(?:olt)?\b/)?.[1] ??
    (p.specs?.SABMA ? "12" : null);
  if (!raw) return null;
  return `${NOMINAL[raw] ?? raw}V`;
}

export type FacetFilters = { brand: string; chem: string; v: string };

export function matchesFacets(p: Product, f: FacetFilters) {
  return (!f.brand || p.brand === f.brand) && (!f.chem || chemistry(p) === f.chem) && (!f.v || voltage(p) === f.v);
}

export type Facet = { key: keyof FacetFilters; label: string; options: { value: string; count: number }[] };

/** Counts each option against the other active filters, and drops facets with nothing to choose between. */
export function facets(products: Product[], active: FacetFilters): Facet[] {
  const defs: { key: keyof FacetFilters; label: string; get: (p: Product) => string | null | undefined }[] = [
    { key: "brand", label: "Brand", get: (p) => p.brand },
    { key: "chem", label: "Type", get: chemistry },
    { key: "v", label: "Voltage", get: voltage },
  ];
  return defs
    .map(({ key, label, get }) => {
      const others = { ...active, [key]: "" };
      const counts = new Map<string, number>();
      for (const p of products) {
        const value = get(p);
        if (value && matchesFacets(p, others)) counts.set(value, (counts.get(value) ?? 0) + 1);
      }
      const options = [...counts].map(([value, count]) => ({ value, count }));
      if (key === "v") options.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
      else options.sort((a, b) => b.count - a.count);
      return { key, label, options };
    })
    .filter((f) => f.options.length > 1 || (f.options.length === 1 && active[f.key]));
}

/** Brands buyers quote at the counter. SABMA sizes are shared across brands, so "Willard 652" means a 652. */
const COMPETITORS = ["willard", "exide", "deta", "varta", "bosch", "raylite", "sabat", "dixon", "first national", "yuasa", "solite", "duracell"];

export function competitorIn(q: string) {
  const lower = q.toLowerCase();
  const name = COMPETITORS.find((c) => new RegExp(`\\b${c}\\b`).test(lower));
  return name ? name.replace(/\b\w/g, (ch) => ch.toUpperCase()) : null;
}

function searchTerms(q: string) {
  let lower = q.toLowerCase();
  for (const c of COMPETITORS) lower = lower.replace(new RegExp(`\\b${c}\\b`, "g"), " ");
  return lower.split(/\s+/).filter(Boolean);
}

export function matchesQuery(p: Product, q: string) {
  if (!q) return true;
  const specs = p.specs ? Object.values(p.specs).join(" ") : "";
  const aliases = p.aliases?.join(" ") ?? "";
  const hay = `${p.code} ${aliases} ${p.description} ${p.group} ${p.brand ?? ""} ${specs}`.toLowerCase();
  const terms = searchTerms(q);
  return terms.length > 0 && terms.every((term) => hay.includes(term));
}

/** "652 HC", "652HC", "652 EFB" and "652 AGM" are all a 652 case; the suffix is the range's technology. */
export function baseSize(p: Product) {
  const sabma = p.specs?.SABMA;
  return sabma ? sabma.replace(/\s*(HC|EFB|AGM|SMF|MF)\b/gi, "").trim() : null;
}

/** Same SABMA case size in other ranges: what a buyer can upgrade or downgrade to. */
export function sameSize(p: Product, products: Product[]) {
  const size = baseSize(p);
  if (!size) return [];
  return products.filter((o) => baseSize(o) === size && voltage(o) === voltage(p));
}

/** "Enertec Silver AGM", "Ebatt": brand plus battery type, unless the brand only makes one type. */
export function rangeName(p: Product) {
  const chem = chemistry(p);
  const brand = p.brand ?? "Enertec";
  return chem && chem !== "Flooded" ? `${brand} ${chem}` : brand;
}

export function rangeFor<T extends { brand: string; chem: string }>(p: Product, ranges: T[]) {
  return ranges.find((r) => r.brand === p.brand && r.chem === chemistry(p)) ?? null;
}

/** Start-stop suitability, from the battery technology. */
export function startStop(p: Product) {
  const chem = chemistry(p);
  if (chem === "AGM") return "Advanced start-stop";
  if (chem === "EFB") return "Basic start-stop";
  return null;
}

export function inCategory(p: Product, cat: string) {
  return p.categoryId === cat || (p.alsoIn?.includes(cat) ?? false);
}

export function filterProducts(products: Product[], q: string, cat: string, f?: FacetFilters) {
  return products.filter((p) => (!cat || inCategory(p, cat)) && matchesQuery(p, q) && (!f || matchesFacets(p, f)));
}

/** The alias a search hit on, so the row can say why an unfamiliar code matched. */
export function matchedAlias(p: Product, q: string) {
  if (!q || !p.aliases) return null;
  const terms = q.toLowerCase().split(/\s+/);
  const code = p.code.toLowerCase();
  return p.aliases.find((a) => terms.some((t) => a.toLowerCase().includes(t) && !code.includes(t))) ?? null;
}

/** Keeps the supplier's pricelist order: groups by first appearance, products as loaded. */
function inListOrder(products: Product[]) {
  const groupIndex = new Map<string, number>();
  for (const p of products) if (!groupIndex.has(p.group)) groupIndex.set(p.group, groupIndex.size);
  return [...products].sort((a, b) => groupIndex.get(a.group)! - groupIndex.get(b.group)!);
}

/**
 * With a category selected, cross-listed products appear in it; across the full range each
 * product is shown once, under its home category.
 */
export function sectionByCategory(categories: Category[], products: Product[], cat = "") {
  return categories
    .filter((c) => !cat || c.id === cat)
    .map((c) => ({
      id: c.id,
      name: c.name,
      products: inListOrder(products.filter((p) => (cat ? inCategory(p, c.id) : p.categoryId === c.id))),
    }))
    .filter((s) => s.products.length > 0);
}

const SPEC_ORDER = [
  "Model",
  "SABMA",
  "Alt PN",
  "V",
  "Ah",
  "kWh",
  "Ah 10hr",
  "Ah 5hr",
  "CCA EN",
  "CCA SAE",
  "CCA",
  "Amps",
  "Charge A",
  "Min @25A",
  "Min @75A",
  "Min @100A",
  "L×W×H mm",
  "TH mm",
  "Layout",
  "Terminal",
  "Hold-down",
  "Foot piece",
  "Mass kg",
  "Per ctn",
  "Hydro eye",
  "Watts",
  "Controller",
  "Cable",
  "Replaces",
];

/** Spec labels used by any product in the list; known battery specs first in a fixed order. */
export function specColumns(products: Product[]) {
  const labels = new Set<string>();
  for (const p of products) for (const key of Object.keys(p.specs ?? {})) labels.add(key);
  const rank = (label: string) => {
    const i = SPEC_ORDER.indexOf(label);
    return i === -1 ? SPEC_ORDER.length : i;
  };
  return [...labels].sort((a, b) => rank(a) - rank(b));
}

/** The identifier buyers ask for: SABMA size for starter batteries, otherwise the model. */
export function sizeOf(p: Product) {
  const model = p.specs?.Model;
  // Some lists print another item code in the model column; that belongs with the full specs.
  return p.specs?.SABMA ?? (model && !/^\d{2}[A-Z]{3}-/.test(model) ? model : null);
}

const SHOWN_IN_SUMMARY = new Set([
  "SABMA", "Model", "V", "Ah", "Ah 10hr", "Ah 5hr", "kWh", "CCA EN", "CCA SAE", "CCA", "Amps", "Watts", "L×W×H mm", "Layout",
]);

/**
 * The decision specs on one line (e.g. "12V · 60Ah · 520 CCA EN") and fitment on a second
 * ("242×175×190 mm · Layout 0"); everything else is left for the expanded view.
 */
export function keySpecs(p: Product) {
  const s = p.specs ?? {};
  const ah = s.Ah ?? s["Ah 10hr"] ?? s["Ah 5hr"];
  const cca = s["CCA EN"] ? `${s["CCA EN"]} CCA EN` : s.CCA ? `${s.CCA} CCA` : s["CCA SAE"] ? `${s["CCA SAE"]} CCA SAE` : null;
  const v = voltage(p);
  const primary = [
    p.specs ? v : null,
    ah ? `${ah}Ah` : null,
    s.kWh ? `${s.kWh} kWh` : null,
    cca,
    s.Amps ? `${s.Amps}A` : null,
    s.Watts ?? null,
  ].filter(Boolean) as string[];
  const fitment = [s["L×W×H mm"] ? `${s["L×W×H mm"]} mm` : null, s.Layout ? `Layout ${s.Layout}` : null].filter(Boolean) as string[];
  const more = Object.entries(s).filter(([k, value]) => !SHOWN_IN_SUMMARY.has(k) || (k === "Model" && value !== sizeOf(p)));
  return { primary: primary.join(" · "), fitment: fitment.join(" · "), more };
}

export function specSummary(p: Product) {
  return p.specs ? Object.entries(p.specs).map(([k, v]) => `${k} ${v}`).join(" · ") : "";
}

export function categoryCounts(categories: Category[], products: Product[]) {
  return categories.map((c) => ({ ...c, count: products.filter((p) => inCategory(p, c.id)).length }));
}

/**
 * Sections for an export covering several categories. Each product is printed once: under its
 * home category if that was chosen, otherwise under the first chosen category that lists it.
 */
export function sectionsForExport(categories: Category[], products: Product[], cats: string[]) {
  const chosen = categories.filter((c) => cats.length === 0 || cats.includes(c.id));
  if (chosen.length === 1) return sectionByCategory(categories, products, chosen[0].id);
  const chosenIds = new Set(chosen.map((c) => c.id));
  const placement = (p: Product) =>
    chosenIds.has(p.categoryId) ? p.categoryId : chosen.find((c) => p.alsoIn?.includes(c.id))?.id;
  return chosen
    .map((c) => ({ id: c.id, name: c.name, products: inListOrder(products.filter((p) => placement(p) === c.id)) }))
    .filter((s) => s.products.length > 0);
}
