import {
  createLoader,
  createSearchParamsCache,
  createSerializer,
  parseAsString,
  parseAsStringLiteral,
  type inferParserType,
} from "nuqs/server";

export const SORT_KEYS = ["code", "size", "specs", "warranty", "price"] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export type SortDir = "asc" | "desc";

export const filterParsers = {
  /** Column the price table is sorted by; unset keeps the pricelist order grouped by range. */
  sort: parseAsStringLiteral(SORT_KEYS),
  dir: parseAsStringLiteral(["asc", "desc"] as const).withDefault("asc"),
  q: parseAsString.withDefault(""),
  cat: parseAsString.withDefault(""),
  brand: parseAsString.withDefault(""),
  chem: parseAsString.withDefault(""),
  v: parseAsString.withDefault(""),
  /** Item code of the product open in the detail drawer. */
  p: parseAsString.withDefault(""),
  /** SABMA size on the range comparison page. */
  size: parseAsString.withDefault(""),
  /** Admin-only: preview the portal as a specific tier. */
  tier: parseAsString.withDefault(""),
};

export const filterCache = createSearchParamsCache(filterParsers);
export const loadFilters = createLoader(filterParsers);
export const serializeFilters = createSerializer(filterParsers);

type Filters = { [K in keyof FilterValues]?: FilterValues[K] | null };
type FilterValues = inferParserType<typeof filterParsers>;

/** Product detail over the current view. Some item codes contain a slash, so the code spans path segments. */
export function productHref(code: string, filters: Filters = {}) {
  return `/portal/p/${code.split("/").map(encodeURIComponent).join("/")}${serializeFilters({ ...filters, p: null })}`;
}
