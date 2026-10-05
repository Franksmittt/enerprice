import type { RangeInfo, WarrantyRule } from "./types";

/** Source: Enertec's published limited product warranty, https://enertec.co.za/product-warranty/ */
const PUBLISHED = "2025-01-01";

type Row = Partial<Omit<WarrantyRule, "id" | "months">> & { months: number | null };

const ROWS: Row[] = [
  // Automotive & truck
  { brand: "Ebatt", months: 12 },
  { brand: "Enertec Blue", months: 24 },
  {
    brand: "Enertec Silver",
    chem: "Flooded",
    categoryId: "automotive",
    months: 24,
    note: "Published warranty table.",
  },
  {
    brand: "Enertec Silver",
    chem: "Flooded",
    categoryId: "automotive",
    months: 30,
    validFrom: "2026-10-01",
    note: "Enertec's 30-month Silver announcement and product pages say 30 months; the published table still says 24. Confirm the effective date.",
  },
  { brand: "Enertec Silver", chem: "Flooded", categoryId: "commercial", months: 30 },
  { brand: "Enertec Silver", chem: "EFB", categoryId: "automotive", months: 30 },
  { brand: "Enertec Silver", chem: "EFB", categoryId: "commercial", months: 24 },
  { brand: "Enertec Silver", chem: "AGM", categoryId: "automotive", months: 36 },
  { brand: "Enertec Silver", chem: "AGM", categoryId: "commercial", months: 24 },
  { brand: "Energizer", months: 24 },
  { brand: "Energizer", chem: "AGM", categoryId: "automotive", months: 36 },
  { brand: "Bull", months: 24, note: "Published table lists Bull flooded and EFB; AGM assumed the same." },
  { brand: "Optima", months: 24 },
  // Motorcycle
  { brand: "Enertec", categoryId: "motorcycle", months: 12 },
  { chem: "Gel", categoryId: "motorcycle", months: 12 },
  { brand: "Poweroad", months: 24 },
  // Marine, golf & motive, standby
  { categoryId: "marine", chem: "Flooded", months: 24 },
  { brand: "Enertec", categoryId: "golf-motive", chem: "Flooded", months: 12 },
  {
    brand: "Discover",
    months: 12,
    conditions: "12 months in wheelchairs and floor scrubbers, 24 months in marine and leisure use. No warranty in golf carts.",
  },
  { brand: "Forbatt", chem: "AGM", months: 12 },
  { brand: "Forbatt", chem: "Gel", months: 36 },
  // Lithium & solar
  { brand: "Enertec", chem: "Lithium", months: 36, conditions: "Single battery application." },
  { brand: "Enertec", match: "Blade", months: 36 },
  { brand: "Enertec", match: "Power+", months: 36, conditions: "For industrial use, only the 24V 105Ah Power+ is covered." },
  { brand: "Enertec", match: "GC2", months: 60, conditions: "A minimum of 3 batteries must be used." },
  { brand: "Enertec", match: "Block Series", months: 60 },
  { brand: "Dyness", months: 120 },
  { match: "Megatank", months: 120, conditions: "Battery at 80% capacity after 5 years, 70% after 10 years." },
  { brand: "Enertec Solar", months: 24 },
  { match: "MONITOR", months: 6 },
  // Chargers & testers
  { brand: "CTEK", categoryId: "chargers", match: "Consumer, Workshop, On-board", months: 24, conditions: "12/24V chargers of 10A and higher, leisure chargers and the D250SE." },
  { brand: "CTEK", categoryId: "chargers", match: "XS0.8, MXS3.8, MXS5.0, MXS7.0, CT5, LITHIUM XS, CS ONE, CS FREE", months: 60, conditions: "Automotive chargers from 0.8A to 7A." },
  { brand: "CTEK", categoryId: "chargers", match: "M15, M25", months: 60, conditions: "Marine chargers (15A and 25A)." },
  { brand: "Delta-Q", months: 24 },
  { brand: "Enertec", categoryId: "chargers", months: 24 },
  { categoryId: "testers", match: "DHC", months: 12 },
];

/** Added after the first release; explicit ids so a migration can add just these. */
const LATER_ROWS: (Row & { id: string })[] = [
  { id: "w-blue-u1", brand: "Enertec Blue", match: "-U1-", months: 12, conditions: "Lawnmower battery." },
];

export const SEED_WARRANTY_RULES: WarrantyRule[] = [...ROWS.map((r, i) => ({ ...r, id: `w${i + 1}` })), ...LATER_ROWS].map((r) => ({
  id: r.id,
  brand: r.brand ?? "",
  chem: r.chem ?? "",
  categoryId: r.categoryId ?? "",
  match: r.match ?? "",
  months: r.months,
  conditions: r.conditions ?? "",
  note: r.note ?? "",
  validFrom: r.validFrom ?? PUBLISHED,
}));

export const DEFAULT_WARRANTY_TERMS = [
  "Covers manufacturing and material defects from the date the end user bought the product.",
  "Not honoured if the battery was in dealer stock for more than 6 months. Sell oldest stock first.",
  "Original proof of purchase is required; the product is tested before a claim is accepted.",
  "A replacement carries only the remaining warranty from the original purchase date.",
  "Excludes incorrect applications, modified or tampered products, and transport costs.",
].join("\n");

export const SEED_RANGES: RangeInfo[] = [
  {
    id: "ebatt",
    brand: "Ebatt",
    chem: "Flooded",
    headline: "Dependable starting power at an entry-level price.",
    points: "Sealed, maintenance-free\nFor everyday cars without start-stop\n12-month warranty",
  },
  {
    id: "blue",
    brand: "Enertec Blue",
    chem: "Flooded",
    headline: "Reliable everyday starting power for standard vehicles.",
    points: "Sealed, maintenance-free lead-calcium\nCars and trucks with normal electrical loads\n24-month warranty",
  },
  {
    id: "silver",
    brand: "Enertec Silver",
    chem: "Flooded",
    headline: "Silver-calcium power for modern cars and hot climates.",
    points: "Silver-calcium grids for stronger cranking and longer life\nHandles higher electrical loads and heat\nLonger warranty than Blue",
  },
  {
    id: "silver-efb",
    brand: "Enertec Silver",
    chem: "EFB",
    headline: "Built for cars with basic start-stop.",
    points: "Enhanced flooded battery survives frequent restarts\nFits start-stop cars without regenerative braking\n30-month warranty on cars",
  },
  {
    id: "silver-agm",
    brand: "Enertec Silver",
    chem: "AGM",
    headline: "Maximum endurance for advanced start-stop and high electrical demand.",
    points: "Absorbent glass mat: spill-proof and vibration resistant\nRequired by cars with advanced start-stop and regenerative braking\n36-month warranty on cars",
  },
  {
    id: "energizer",
    brand: "Energizer",
    chem: "Flooded",
    headline: "A trusted international brand for everyday vehicles.",
    points: "Sealed, maintenance-free\n24-month warranty",
  },
  {
    id: "energizer-agm",
    brand: "Energizer",
    chem: "AGM",
    headline: "AGM performance for start-stop vehicles.",
    points: "Spill-proof absorbent glass mat\nStart-stop ready\n36-month warranty on cars",
  },
  {
    id: "optima",
    brand: "Optima",
    chem: "AGM",
    headline: "Spiral-cell AGM for performance, 4x4 and heavy accessory loads.",
    points: "SpiralCell design: extreme vibration resistance\nFast recharge, deep-cycle capable\n24-month warranty",
  },
];
