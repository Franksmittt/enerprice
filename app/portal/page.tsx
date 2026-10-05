import Link from "next/link";
import { Clock, Columns3, Eye, Repeat } from "lucide-react";
import { SearchBox, TierPreviewSelect } from "@/components/filters";
import { CategoryNav, CategoryOverview } from "@/components/portal/category-nav";
import { CounterBanner, CounterToggle } from "@/components/portal/counter-mode";
import { ExportMenu } from "@/components/portal/export-menu";
import { FacetBar } from "@/components/portal/facet-bar";
import { PriceTable, SortChips } from "@/components/portal/price-table";
import { ProductDrawer } from "@/components/portal/product-drawer";
import { categoryCounts, competitorIn, facets, filterProducts, sectionByCategory } from "@/lib/catalog";
import { getCounterMode } from "@/lib/counter";
import { filterCache, productHref, serializeFilters, type SortKey } from "@/lib/search-params";
import { SORT_LABELS, sortProducts } from "@/lib/sort";
import { getViewer } from "@/lib/viewer";

export default async function PortalPage({ searchParams }: PageProps<"/portal">) {
  const { q, cat, brand, chem, v, p: openCode, sort: sortKey, dir, tier: requestedTier } = await filterCache.parse(searchParams);
  const { db, tier, customer, isAdmin } = await getViewer(requestedTier);
  const counter = tier ? await getCounterMode() : null;
  const active = { brand, chem, v };
  const sort = sortKey && (sortKey !== "price" || tier) ? { key: sortKey, dir } : null;

  const counts = categoryCounts(db.categories, db.products);
  const browsing = Boolean(cat || q);
  const inScope = filterProducts(db.products, q, cat);
  const shownProducts = filterProducts(inScope, "", "", active);
  const sections = sectionByCategory(db.categories, shownProducts, cat).map((s) =>
    sort ? { ...s, products: sortProducts(s.products, sort.key, sort.dir, { tier, rules: db.warrantyRules }) } : s,
  );
  const activeCategory = db.categories.find((c) => c.id === cat);
  const shown = sections.reduce((n, s) => n + s.products.length, 0);
  const competitor = competitorIn(q);
  const openProduct = openCode ? db.products.find((x) => x.code === openCode) : undefined;

  const keep = isAdmin && tier ? { tier: tier.id } : {};
  const sorted = { sort: sort?.key ?? null, dir: sort?.dir ?? null };
  const current = { ...keep, ...sorted, q: q || null, cat: cat || null, brand: brand || null, chem: chem || null, v: v || null };
  const catHref = (next: string | null) => `/portal${serializeFilters({ ...keep, ...sorted, q: q || null, cat: next })}`;
  // Each click on a column steps through low → high, high → low, then back to the pricelist order.
  const sortHref = (key: SortKey) => {
    const next = sort?.key !== key ? { sort: key, dir: null } : sort.dir === "asc" ? { sort: key, dir: "desc" as const } : { sort: null, dir: null };
    return `/portal${serializeFilters({ ...current, ...next })}`;
  };
  const sortColumns: SortKey[] = ["code", "size", "specs", "warranty", ...(tier ? (["price"] as const) : [])];
  const facetHref = (change: Partial<Record<"brand" | "chem" | "v", string | null>>) =>
    `/portal${serializeFilters({ ...current, ...change })}`;
  const hrefFor = (code: string) => productHref(code, current);
  const compareHref = (size: string) => `/portal/compare${serializeFilters({ ...keep, size })}`;
  const csvHref = `/portal/pricelist.csv${serializeFilters(current)}`;
  const pdfViewHref = browsing ? `/portal/pricelist.pdf${serializeFilters(current)}` : null;

  const brands = Object.fromEntries(
    db.categories.map((c) => {
      const tally = new Map<string, number>();
      for (const p of db.products) if (p.brand && (p.categoryId === c.id || p.alsoIn?.includes(c.id))) tally.set(p.brand, (tally.get(p.brand) ?? 0) + 1);
      return [c.id, [...tally].sort((a, b) => b[1] - a[1]).map(([b]) => b).slice(0, 5)];
    }),
  );

  return (
    <main className="flex-1">
      {isAdmin && tier && (
        <div className="bg-ink text-white">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 text-sm sm:px-6">
            <Eye className="size-4 shrink-0" />
            <span className="sm:hidden">Preview as</span>
            <span className="hidden sm:inline">Previewing the customer portal as</span>
            <TierPreviewSelect tiers={db.tiers.map((t) => ({ id: t.id, name: t.name }))} />
            <span className="hidden text-neutral-300 md:inline">Customers only ever see their own tier.</span>
          </div>
        </div>
      )}
      {counter && <CounterBanner counter={counter} />}
      {customer && !tier && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 py-3 text-sm text-amber-900">
            <Clock className="size-4 shrink-0" />
            Your trade account is awaiting approval. You can browse the full Enertec range now; your prices will appear here as
            soon as Enertec allocates your pricing.
          </div>
        </div>
      )}

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                {db.settings.priceListMonth} {counter ? "retail prices" : "trade pricelist"}
                {tier && !counter && ` · ${tier.name}`}
              </p>
              <h1 className="mt-0.5 text-2xl font-black tracking-tight">
                {customer && !counter ? customer.company : "Enertec product range"}
              </h1>
            </div>
            <div className="relative grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
              <Link
                href={`/portal/compare${serializeFilters(keep)}`}
                className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-neutral-50"
              >
                <Columns3 className="size-4 shrink-0 max-[359px]:hidden" /> Compare ranges
              </Link>
              {tier && !counter && <CounterToggle />}
              {tier && !counter && (
                <ExportMenu
                  categories={counts}
                  currentCat={cat}
                  viewHref={pdfViewHref}
                  viewCount={shown}
                  csvHref={csvHref}
                  tierId={isAdmin ? tier.id : null}
                  total={db.products.length}
                />
              )}
            </div>
          </div>
          <div className="mt-4 max-w-3xl">
            <SearchBox placeholder="Search a size, code or product… e.g. 652, Willard 646, MXS 5.0, terminal" />
          </div>
          {browsing && (
            <div className="mt-4">
              <CategoryNav categories={counts} active={cat} href={catHref} />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {!browsing ? (
          <CategoryOverview categories={counts} brands={brands} href={(id) => catHref(id)} />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-bold">
                {activeCategory ? activeCategory.name : "All categories"}
                {q && <span className="font-normal text-neutral-500"> matching “{q}”</span>}
              </h2>
              <p className="text-sm text-neutral-500">
                {shown} product{shown === 1 ? "" : "s"}
                <Link href={`/portal${serializeFilters(keep)}`} className="-my-1.5 ml-3 inline-block py-1.5 font-semibold text-ink underline-offset-2 hover:underline">
                  Clear all
                </Link>
              </p>
            </div>
            {competitor && shown > 0 && (
              <p className="mb-3 flex items-start gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm">
                <Repeat className="mt-0.5 size-4 shrink-0 text-brand" />
                <span>
                  <span className="font-semibold">Enertec equivalents for “{q}”.</span> SABMA sizes are the same across brands;
                  check the terminal layout and CCA before fitting.
                </span>
              </p>
            )}
            <FacetBar facets={facets(inScope, active)} active={active} href={facetHref} />
            {shown > 1 && (
              <div className="mt-3">
                <SortChips sort={sort} sortHref={sortHref} columns={sortColumns} />
              </div>
            )}
            {sort && (
              <p className="mt-3 hidden items-center gap-2 text-sm text-neutral-600 md:flex">
                <span>
                  Sorted by <span className="font-semibold text-ink">{SORT_LABELS[sort.key].toLowerCase()}</span>,{" "}
                  {sort.dir === "asc" ? "low to high" : "high to low"}, across all ranges.
                </span>
                <Link href={`/portal${serializeFilters({ ...current, sort: null, dir: null })}`} scroll={false} className="font-semibold text-brand underline-offset-2 hover:underline">
                  Back to pricelist order
                </Link>
              </p>
            )}

            {sections.length === 0 ? (
              <p className="mt-6 rounded-lg border border-neutral-200 p-10 text-center text-neutral-500">
                Nothing matches that. Try a SABMA size (e.g. 652), part of an item code, or fewer filters.
              </p>
            ) : (
              <div className="mt-6 space-y-10">
                {sections.map((s) => (
                  <div key={s.id}>
                    <h3
                      className={
                        !cat || sections.length > 1 ? "mb-3 border-b-2 border-ink pb-1 text-base font-black uppercase tracking-wide" : "sr-only"
                      }
                    >
                      {s.name}
                    </h3>
                    <PriceTable
                      products={s.products}
                      tier={tier}
                      vatRate={db.settings.vatRate}
                      q={q}
                      rules={db.warrantyRules}
                      counter={counter}
                      hrefFor={hrefFor}
                      sort={sort}
                      sortHref={sortHref}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {openProduct && (
        <ProductDrawer
          product={openProduct}
          db={db}
          tier={tier}
          counter={counter}
          isAdmin={isAdmin}
          closeHref={`/portal${serializeFilters(current)}`}
          hrefFor={(code) => `/portal${serializeFilters({ ...current, p: code })}`}
          compareHref={compareHref}
        />
      )}
    </main>
  );
}
