import { AddProduct } from "@/components/admin/add-product";
import { CostingGrid } from "@/components/admin/costing-grid";
import { CategorySelect, SearchBox } from "@/components/filters";
import { categoryCounts, filterProducts, sectionByCategory } from "@/lib/catalog";
import { readDb } from "@/lib/db";
import { formatPct } from "@/lib/format";
import { resolvePrice } from "@/lib/pricing";
import { filterCache } from "@/lib/search-params";

export default async function ProductsPage({ searchParams }: PageProps<"/admin">) {
  const { q, cat } = await filterCache.parse(searchParams);
  const db = await readDb();

  const sections = sectionByCategory(db.categories, filterProducts(db.products, q, cat), cat);
  const counts = categoryCounts(db.categories, db.products);
  const loaded = counts.filter((c) => c.count > 0).length;
  const totalCost = db.products.reduce((sum, p) => sum + p.cost, 0);

  const tierStats = db.tiers.map((t) => {
    const prices = db.products.map((p) => resolvePrice(p, t));
    const revenue = prices.reduce((s, r) => s + r.price, 0);
    return {
      tier: t,
      gp: revenue > 0 ? ((revenue - totalCost) / revenue) * 100 : 0,
      manual: prices.filter((r) => r.manual).length,
      customers: db.customers.filter((c) => c.tierId === t.id).length,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products & costing</h1>
          <p className="text-sm text-neutral-600">
            Change a cost and every tier recalculates. Click any tier price to set a manual price for that product.
          </p>
        </div>
        <p className="text-sm text-neutral-500">
          {db.products.length} products · {loaded} of {db.categories.length} categories loaded
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {tierStats.map(({ tier, gp, manual, customers }) => (
          <div key={tier.id} className="min-w-0 rounded-lg border border-neutral-200 bg-white p-3 sm:p-4">
            <p className="text-xs font-semibold sm:text-sm">{tier.name}</p>
            <p className="mt-1 text-xl font-black tabular-nums sm:text-2xl">{formatPct(gp)}</p>
            <p className="text-[11px] text-neutral-500 sm:text-xs">
              blended GP<span className="hidden sm:inline"> · {customers} customer{customers === 1 ? "" : "s"}</span>
              {manual > 0 && <span className="hidden sm:inline">{` · ${manual} manual price${manual === 1 ? "" : "s"}`}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-64 flex-1">
          <SearchBox />
        </div>
        <CategorySelect categories={counts} />
        <AddProduct categories={db.categories} />
      </div>

      <CostingGrid sections={sections} tiers={db.tiers} />
      <p className="text-xs text-neutral-500">All amounts exclude VAT. GP below 5% is flagged in red.</p>
    </div>
  );
}
