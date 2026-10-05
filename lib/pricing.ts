import type { MarginMethod, Product, Tier } from "./types";

const MAX_GP = 95;

export function marginFor(tier: Tier, categoryId: string) {
  return tier.byCategory[categoryId] ?? tier.value;
}

/** Enertec prices are quoted in whole rand. */
export function priceFromCost(cost: number, method: MarginMethod, pct: number) {
  if (cost <= 0) return 0;
  const raw = method === "markup" ? cost * (1 + pct / 100) : cost / (1 - Math.min(pct, MAX_GP) / 100);
  return Math.round(raw);
}

export function gpOf(price: number, cost: number) {
  return price > 0 ? ((price - cost) / price) * 100 : 0;
}

export function markupOf(price: number, cost: number) {
  return cost > 0 ? ((price - cost) / cost) * 100 : 0;
}

export type RetailSettings = { markup: number; inclVat: boolean };

const upToR10 = (amount: number) => Math.ceil(amount / 10) * 10;

/**
 * What the buyer's own customer pays: the buyer's markup on trade, rounded up to the next R10 on
 * whichever price is displayed (incl. or excl. VAT). Profit and GP are on the ex-VAT price, since
 * VAT isn't the buyer's money.
 */
export function retailQuote(trade: number, { markup, inclVat }: RetailSettings, vatRate: number) {
  const ex = inclVat ? upToR10(trade * (1 + markup / 100) * (1 + vatRate)) / (1 + vatRate) : upToR10(trade * (1 + markup / 100));
  const incl = ex * (1 + vatRate);
  const profit = ex - trade;
  return { shown: inclVat ? incl : ex, ex, incl, cost: trade, profit, gp: gpOf(ex, trade) };
}

/**
 * The amount a screen should show: trade ex VAT normally, or the retail price in counter mode.
 * Null when the viewer has no tier or the price is still TBA.
 */
export function shownPrice(product: Product, tier: Tier | null, vatRate: number, counter: RetailSettings | null) {
  if (!tier) return null;
  const { price } = resolvePrice(product, tier);
  if (!(price > 0)) return null;
  return counter ? retailQuote(price, counter, vatRate).shown : price;
}

export type ResolvedPrice = {
  price: number;
  manual: boolean;
  rulePrice: number;
  gp: number;
  markup: number;
};

export function resolvePrice(product: Pick<Product, "cost" | "categoryId" | "overrides">, tier: Tier): ResolvedPrice {
  const rulePrice = priceFromCost(product.cost, tier.method, marginFor(tier, product.categoryId));
  const override = product.overrides[tier.id];
  const manual = typeof override === "number" && override > 0;
  const price = manual ? override : rulePrice;
  return { price, manual, rulePrice, gp: gpOf(price, product.cost), markup: markupOf(price, product.cost) };
}
