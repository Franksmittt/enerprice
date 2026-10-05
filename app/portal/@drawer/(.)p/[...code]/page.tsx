import { notFound } from "next/navigation";
import { ProductDrawer } from "@/components/portal/product-drawer";
import { getCounterMode } from "@/lib/counter";
import { loadFilters, productHref, serializeFilters } from "@/lib/search-params";
import { getViewer } from "@/lib/viewer";

/**
 * Product detail opened from inside the portal. Only this slot renders, so the list behind it stays
 * as it is and Back closes the drawer without reloading the list.
 */
export default async function ProductDrawerSlot({ params, searchParams }: PageProps<"/portal/p/[...code]">) {
  const { code } = await params;
  const filters = await loadFilters(searchParams);
  const { db, tier, isAdmin } = await getViewer(filters.tier);
  const product = db.products.find((x) => x.code === code.map(decodeURIComponent).join("/"));
  if (!product) notFound();

  const counter = tier ? await getCounterMode() : null;
  const keep = isAdmin && tier ? { tier: tier.id } : {};
  const current = {
    ...keep,
    sort: filters.sort,
    dir: filters.sort ? filters.dir : null,
    q: filters.q || null,
    cat: filters.cat || null,
    brand: filters.brand || null,
    chem: filters.chem || null,
    v: filters.v || null,
  };

  return (
    <ProductDrawer
      product={product}
      db={db}
      tier={tier}
      counter={counter}
      isAdmin={isAdmin}
      closeHref={`/portal${serializeFilters(current)}`}
      closeWithBack
      hrefFor={(c) => productHref(c, current)}
      compareHref={(size) => `/portal/compare${serializeFilters({ ...keep, size })}`}
    />
  );
}
