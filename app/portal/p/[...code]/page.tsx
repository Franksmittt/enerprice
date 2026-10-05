import { redirect } from "next/navigation";
import { loadFilters, serializeFilters } from "@/lib/search-params";

/** A product link opened directly (shared, bookmarked, refreshed) shows the pricelist with that product open. */
export default async function ProductPage({ params, searchParams }: PageProps<"/portal/p/[...code]">) {
  const { code } = await params;
  const filters = await loadFilters(searchParams);
  const productCode = code.map(decodeURIComponent).join("/");
  redirect(`/portal${serializeFilters({ ...filters, q: filters.q || (filters.cat ? null : productCode), p: productCode })}`);
}
