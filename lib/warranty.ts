import { chemistry } from "./catalog";
import type { Product, WarrantyRule } from "./types";

export type Warranty = {
  months: number | null;
  conditions: string;
  source: "product" | "rule";
  rule?: WarrantyRule;
  /** A rule already loaded with a later valid-from date that will replace this one. */
  upcoming?: { months: number | null; validFrom: string };
};

export const today = () => new Date().toISOString().slice(0, 10);

const terms = (match: string) =>
  match
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

export function ruleMatches(p: Product, r: WarrantyRule) {
  if (r.brand && p.brand !== r.brand) return false;
  if (r.chem && chemistry(p) !== r.chem) return false;
  if (r.categoryId && p.categoryId !== r.categoryId) return false;
  if (r.match) {
    const hay = `${p.code} ${p.group} ${p.description}`.toLowerCase();
    if (!terms(r.match).some((t) => hay.includes(t))) return false;
  }
  return true;
}

const specificity = (r: WarrantyRule) => [r.brand, r.chem, r.categoryId, r.match].filter(Boolean).length;

/** Most specific first; then the newest valid-from; then the rule lower in the list. */
function rank(rules: WarrantyRule[]) {
  return rules
    .map((rule, index) => ({ rule, index }))
    .sort(
      (a, b) =>
        specificity(b.rule) - specificity(a.rule) ||
        b.rule.validFrom.localeCompare(a.rule.validFrom) ||
        b.index - a.index,
    )
    .map((x) => x.rule);
}

export function resolveWarranty(p: Product, rules: WarrantyRule[], on = today()): Warranty | null {
  if (p.warranty) return { ...p.warranty, source: "product" };
  const matching = rules.filter((r) => ruleMatches(p, r));
  const current = rank(matching.filter((r) => r.validFrom <= on))[0];
  const next = matching
    .filter((r) => r.validFrom > on && (!current || specificity(r) >= specificity(current)))
    .sort((a, b) => a.validFrom.localeCompare(b.validFrom))[0];
  if (!current) return null;
  return {
    months: current.months,
    conditions: current.conditions,
    source: "rule",
    rule: current,
    upcoming: next && next.months !== current.months ? { months: next.months, validFrom: next.validFrom } : undefined,
  };
}

export function warrantyLabel(months: number | null, short = false) {
  if (months === null) return "No warranty";
  if (months > 60 && months % 12 === 0) return `${months / 12} years`;
  return short ? `${months} mo` : `${months} months`;
}

export function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

/** Categories where a warranty is expected; accessories are left out on purpose. */
export const WARRANTY_CATEGORIES = new Set([
  "automotive", "commercial", "motorcycle", "marine", "deep-cycle", "golf-motive", "standby", "chargers", "testers",
]);
