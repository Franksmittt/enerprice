import Link from "next/link";
import { ArrowLeft, Check, Minus } from "lucide-react";
import { CounterBanner } from "@/components/portal/counter-mode";
import { Badge, MarginLine } from "@/components/portal/price-table";
import { ProductThumb } from "@/components/portal/product-thumb";
import { WarrantyBadge } from "@/components/portal/warranty-badge";
import { baseSize, chemistry, rangeFor, rangeName, startStop, voltage } from "@/lib/catalog";
import { getCounterMode } from "@/lib/counter";
import { formatRand } from "@/lib/format";
import { resolvePrice, retailQuote, shownPrice } from "@/lib/pricing";
import { filterCache, productHref, serializeFilters } from "@/lib/search-params";
import type { Product } from "@/lib/types";
import { resolveWarranty, warrantyLabel } from "@/lib/warranty";
import { getViewer } from "@/lib/viewer";

const cca = (p: Product) => p.specs?.["CCA EN"] ?? p.specs?.CCA ?? p.specs?.["CCA SAE"] ?? null;

export default async function ComparePage({ searchParams }: PageProps<"/portal/compare">) {
  const { size, tier: requestedTier } = await filterCache.parse(searchParams);
  const { db, tier, isAdmin } = await getViewer(requestedTier);
  const counter = tier ? await getCounterMode() : null;
  const keep = isAdmin && tier ? { tier: tier.id } : {};
  const vat = db.settings.vatRate;

  const bySize = new Map<string, Product[]>();
  for (const p of db.products) {
    const s = baseSize(p);
    if (s && !p.discontinued && voltage(p) === "12V") bySize.set(s, [...(bySize.get(s) ?? []), p]);
  }
  const popular = [...bySize]
    .filter(([, list]) => new Set(list.map(rangeName)).size >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 18)
    .map(([s]) => s)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const price = (p: Product) => shownPrice(p, tier, vat, counter);
  const options = [...(bySize.get(size) ?? [])].sort((a, b) => (price(a) ?? Infinity) - (price(b) ?? Infinity));
  const rows = options.map((p) => {
    const warranty = resolveWarranty(p, db.warrantyRules);
    const amount = price(p);
    const perMonth = amount !== null && warranty?.months ? amount / warranty.months : null;
    return { p, warranty, amount, perMonth, range: rangeFor(p, db.ranges) };
  });
  const bestValue = rows.filter((r) => r.perMonth !== null).sort((a, b) => a.perMonth! - b.perMonth!)[0]?.p.id;
  const longest = Math.max(0, ...rows.map((r) => r.warranty?.months ?? 0));
  const detailHref = (code: string) => productHref(code, { ...keep, q: size });

  return (
    <main className="flex-1">
      {counter && <CounterBanner counter={counter} />}
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <Link href={`/portal${serializeFilters(keep)}`} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-ink">
            <ArrowLeft className="size-4" /> Pricelist
          </Link>
          <h1 className="mt-2 text-2xl font-black tracking-tight">Compare ranges{size && ` · ${size}`}</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600">
            The same battery size in every range, side by side: what the extra rand buys in warranty, technology and cranking power.
            {tier && !counter && " Turn on counter mode to show your customer retail prices instead of yours."}
          </p>
          <form className="mt-4 flex flex-wrap items-center gap-2" action="/portal/compare">
            {keep.tier && <input type="hidden" name="tier" value={keep.tier} />}
            <input
              name="size"
              defaultValue={size}
              placeholder="SABMA size, e.g. 652"
              className="w-48 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-ink"
            />
            <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black">Compare</button>
          </form>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {popular.map((s) => (
              <Link
                key={s}
                href={`/portal/compare${serializeFilters({ ...keep, size: s })}`}
                className={`rounded-full border px-3 py-1 text-sm font-semibold tabular-nums ${
                  s === size ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white hover:border-ink"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {!size ? (
          <p className="rounded-lg border border-neutral-200 p-10 text-center text-neutral-500">Pick a size above to compare ranges.</p>
        ) : rows.length === 0 ? (
          <p className="rounded-lg border border-neutral-200 p-10 text-center text-neutral-500">No batteries in size {size}.</p>
        ) : (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
            {rows.map(({ p, warranty, amount, perMonth, range }) => (
              <article key={p.id} className="flex flex-col rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex min-h-6 flex-wrap gap-1">
                  {p.id === bestValue && rows.length > 1 && <Badge className="bg-brand text-white">Best value per warranty month</Badge>}
                  {warranty?.months === longest && longest > 0 && rows.length > 1 && (
                    <Badge className="bg-ink text-white">Longest warranty</Badge>
                  )}
                </div>
                <div className="mt-2 flex justify-center">
                  <ProductThumb product={p} size="md" />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-brand">{rangeName(p)}</p>
                <p className="font-mono text-xs text-neutral-500">{p.code}</p>
                {range && <p className="mt-2 text-sm font-semibold leading-snug">{range.headline}</p>}

                <div className="mt-4 border-t border-neutral-100 pt-3">
                  {amount !== null ? (
                    <>
                      <p className="text-2xl font-black tabular-nums">{formatRand(amount)}</p>
                      <p className="text-xs text-neutral-500">
                        {counter ? (counter.inclVat ? "retail incl. VAT" : "retail excl. VAT") : "your price ex VAT"}
                      </p>
                      {counter?.margin && tier && <MarginLine quote={retailQuote(resolvePrice(p, tier).price, counter, vat)} />}
                    </>
                  ) : (
                    <p className="text-sm text-neutral-500">{tier ? "Price TBA" : "Prices on approval"}</p>
                  )}
                </div>

                <dl className="mt-3 space-y-2 text-sm">
                  <Row label="Warranty">
                    <WarrantyBadge warranty={warranty} />
                  </Row>
                  <Row label="Per warranty month">
                    {perMonth !== null ? <span className="font-semibold tabular-nums">{formatRand(perMonth)}</span> : "–"}
                  </Row>
                  <Row label="Technology">{chemistry(p) ?? "–"}</Row>
                  <Row label="Start-stop">
                    {startStop(p) ? (
                      <span className="flex items-center gap-1">
                        <Check className="size-4 text-brand" /> {startStop(p)}
                      </span>
                    ) : (
                      <Minus className="size-4 text-neutral-300" />
                    )}
                  </Row>
                  <Row label="CCA">{cca(p) ?? "–"}</Row>
                  <Row label="Capacity">{p.specs?.Ah ? `${p.specs.Ah}Ah` : "–"}</Row>
                  <Row label="Layout">{p.specs?.Layout ?? "–"}</Row>
                </dl>

                {range && (
                  <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-xs text-neutral-600">
                    {range.points.split("\n").filter(Boolean).map((point) => (
                      <li key={point} className="flex gap-1.5">
                        <Check className="mt-px size-3.5 shrink-0 text-brand" />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href={detailHref(p.code)}
                  prefetch={false}
                  data-drawer={p.code}
                  className="mt-auto pt-4 text-sm font-semibold text-ink underline-offset-2 hover:text-brand hover:underline"
                >
                  Full details
                </Link>
              </article>
            ))}
          </div>
        )}
        {rows.length > 1 && (
          <p className="mt-6 text-xs text-neutral-500">
            Per warranty month is the price divided by the warranty period. The longest cover in size {size} is {warrantyLabel(longest)}.
          </p>
        )}
      </section>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
