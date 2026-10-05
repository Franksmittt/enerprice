export type MarginMethod = "markup" | "gp";

export type Pillar = "batteries" | "charging" | "accessories";

export type Category = {
  id: string;
  name: string;
  blurb: string;
  pillar: Pillar;
};

export type Tier = {
  id: string;
  name: string;
  description: string;
  method: MarginMethod;
  /** Default percentage applied to every category unless overridden. */
  value: number;
  byCategory: Record<string, number>;
};

export type Product = {
  id: string;
  code: string;
  description: string;
  /** Home category; its tier margin is the one applied. */
  categoryId: string;
  /** Extra categories the product is also listed under (e.g. an Optima in Automotive and Marine). */
  alsoIn?: string[];
  /** Other codes the same product appears under on other pricelists; searchable. */
  aliases?: string[];
  group: string;
  brand?: string;
  /** Ordered spec label → value, shown as columns in the pricelist. */
  specs?: Record<string, string>;
  /** Enertec landed cost, ex VAT. */
  cost: number;
  /** Manual price per tier id, wins over the margin rule. */
  overrides: Record<string, number>;
  source: string;
  isNew: boolean;
  /** Still priced and sold while stock lasts, but not being replenished. */
  discontinued?: boolean;
  /** Photo URL (/products/… from the Enertec site, or /media/… if uploaded in the portal). */
  image?: string;
  /** Wins over the warranty rules for this one product. */
  warranty?: WarrantyOverride;
  updatedAt: string;
};

/**
 * Enertec's published warranty table, one row per rule. Empty criteria match anything; the rule
 * with the most criteria wins, and a newer valid-from date supersedes an older rule.
 */
export type WarrantyRule = {
  id: string;
  brand: string;
  /** Battery type: Flooded, EFB, AGM, Gel, Lithium. */
  chem: string;
  categoryId: string;
  /** Comma-separated words, any of which must appear in the code, group or description. */
  match: string;
  /** null means the product carries no warranty. */
  months: number | null;
  /** Shown to customers. */
  conditions: string;
  /** Staff only, e.g. where a figure still needs confirming. */
  note: string;
  /** YYYY-MM-DD */
  validFrom: string;
};

export type WarrantyOverride = { months: number | null; conditions: string };

/** Selling copy for a brand + battery type, used where buyers compare ranges. */
export type RangeInfo = {
  id: string;
  brand: string;
  chem: string;
  headline: string;
  /** One selling point per line. */
  points: string;
};

export type CustomerStatus = "pending" | "active";

export type Customer = {
  id: string;
  accountNo: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  passwordHash: string;
  tierId: string | null;
  status: CustomerStatus;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

export type Database = {
  settings: {
    priceListMonth: string;
    vatRate: number;
    seedVersion?: number;
    /** Printed on every pricelist page and PDF (one note per line). */
    pricelistNotes?: string;
    /** General warranty terms shown with every warranty (one per line). */
    warrantyTerms?: string;
  };
  categories: Category[];
  tiers: Tier[];
  products: Product[];
  warrantyRules: WarrantyRule[];
  ranges: RangeInfo[];
  customers: Customer[];
  admins: AdminUser[];
};
