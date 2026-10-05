import Link from "next/link";
import { ArrowRight, ArrowUpRight, Info } from "lucide-react";
import { setProductImage, setProductWarranty } from "@/app/actions";
import { baseSize, chemistry, keySpecs, rangeFor, rangeName, sameSize, sizeOf, startStop } from "@/lib/catalog";
import type { CounterMode } from "@/lib/counter";
import { formatRand, pricelistNotes } from "@/lib/format";
import { shownPrice } from "@/lib/pricing";
import type { Database, Product, Tier } from "@/lib/types";
import { formatDay, resolveWarranty, warrantyLabel } from "@/lib/warranty";
import { DrawerShell } from "./drawer-shell";
import { Badge, Price } from "./price-table";
import { ProductThumb } from "./product-thumb";
import { TerminalDiagram } from "./terminal-diagram";
import { WarrantyBadge } from "./warranty-badge";

type Props = {
  product: Product;
  db: Database;
  tier: Tier | null;
  counter: CounterMode;
  isAdmin: boolean;
  closeHref: string;
  /** Opened over the list by client navigation, so closing is a step back rather than a new page. */
  closeWithBack?: boolean;
  hrefFor: (code: string) => string;
  compareHref: (size: string) => string;
};

const cca = (p: Product) => p.specs?.["CCA EN"] ?? p.specs?.CCA ?? p.specs?.["CCA SAE"] ?? null;
const side = (p: Product) => (p.specs?.Layout ? (/LHP/i.test(p.specs.Layout) ? "L" : /RHP/i.test(p.specs.Layout) ? "R" : null) : null);

export function ProductDrawer({ product: p, db, tier, counter, isAdmin, closeHref, closeWithBack = false, hrefFor, compareHref }: Props) {
  const warranty = resolveWarranty(p, db.warrantyRules);
  const range = rangeFor(p, db.ranges);
  const { primary } = keySpecs(p);
  const specs = Object.entries(p.specs ?? {});
  const size = sizeOf(p);
  const base = baseSize(p);
  const alternatives = sameSize(p, db.products);
  const terms = pricelistNotes({ pricelistNotes: db.settings.warrantyTerms });

  return (
    <DrawerShell key={p.code} closeHref={closeHref} back={closeWithBack} title={p.code}>
      <div className="grid gap-5 p-5 sm:grid-cols-[18rem_1fr]">
        <ProductThumb product={p} size="lg" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">{rangeName(p)}</p>
          <h2 className="mt-1 text-xl font-black leading-tight">{p.description}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {size && <span className="rounded-md bg-ink px-2 py-0.5 text-sm font-black text-white">{size}</span>}
            {p.isNew && <Badge className="bg-alert text-white">New</Badge>}
            {p.discontinued && <Badge className="bg-neutral-100 text-neutral-600">While stocks last</Badge>}
            {startStop(p) && <Badge className="border border-ink text-ink">{startStop(p)}</Badge>}
          </div>
          {primary && <p className="mt-3 text-sm tabular-nums text-neutral-700">{primary}</p>}
          <div className="mt-4 flex items-end justify-between gap-4 rounded-lg bg-neutral-50 p-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                {!tier ? "Price" : counter ? "Retail price" : "Your price"}
              </p>
              <div className="mt-1 text-left [&_div]:text-left">
                <Price product={p} tier={tier} vatRate={db.settings.vatRate} counter={counter} />
              </div>
            </div>
            <WarrantyBadge warranty={warranty} />
          </div>
        </div>
      </div>

      {range && (
        <Section title={`Why ${rangeName(p)}`}>
          <p className="font-semibold">{range.headline}</p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-700">
            {range.points.split("\n").filter(Boolean).map((point) => (
              <li key={point} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                {point}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {alternatives.length > 1 && base && (
        <Section
          title={`${base} in every range`}
          action={
            <Link href={compareHref(base)} className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
              Compare side by side <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          <SameSizeTable current={p} options={alternatives} db={db} tier={tier} counter={counter} hrefFor={hrefFor} />
        </Section>
      )}

      <Section title="Warranty">
        {warranty ? (
          <div className="space-y-2 text-sm">
            <p className="text-lg font-black">{warrantyLabel(warranty.months)}</p>
            {warranty.conditions && <p className="text-neutral-700">{warranty.conditions}</p>}
            {warranty.upcoming && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-amber-900">
                Changes to {warrantyLabel(warranty.upcoming.months)} for sales from {formatDay(warranty.upcoming.validFrom)}.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Warranty on request. Ask your Enertec branch.</p>
        )}
        {terms.length > 0 && warranty?.months !== null && (
          <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
            {terms.map((t) => (
              <li key={t} className="flex gap-2">
                <Info className="mt-0.5 size-3 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {p.specs?.Layout && p.specs.Layout !== "-" && (
        <Section title="Fitment">
          <TerminalDiagram layout={p.specs.Layout} terminal={p.specs.Terminal} holdDown={p.specs["Hold-down"]} />
        </Section>
      )}

      {(specs.length > 0 || (p.aliases?.length ?? 0) > 0) && (
        <Section title="Specifications">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
            {specs.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-neutral-500">{label}</dt>
                <dd className="tabular-nums">{value}</dd>
              </div>
            ))}
            {chemistry(p) && (
              <div className="contents">
                <dt className="text-neutral-500">Type</dt>
                <dd>{chemistry(p)}</dd>
              </div>
            )}
            {(p.aliases?.length ?? 0) > 0 && (
              <div className="contents">
                <dt className="text-neutral-500">Also listed as</dt>
                <dd className="font-mono">{p.aliases!.join(", ")}</dd>
              </div>
            )}
          </dl>
        </Section>
      )}

      {isAdmin && <AdminTools product={p} defaultWarranty={p.warranty ? null : warranty} />}
    </DrawerShell>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-t border-neutral-200 px-5 py-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function SameSizeTable({
  current,
  options,
  db,
  tier,
  counter,
  hrefFor,
}: {
  current: Product;
  options: Product[];
  db: Database;
  tier: Tier | null;
  counter: CounterMode;
  hrefFor: (code: string) => string;
}) {
  const vat = db.settings.vatRate;
  const price = (p: Product) => shownPrice(p, tier, vat, counter);
  const rows = [...options].sort((a, b) => (price(a) ?? Infinity) - (price(b) ?? Infinity));
  const base = price(current);
  const baseWarranty = resolveWarranty(current, db.warrantyRules)?.months ?? null;

  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-[10px] uppercase tracking-wider text-neutral-500">
          <tr className="border-b border-neutral-200">
            <th className="py-1.5 pl-1 pr-3 font-semibold">Range</th>
            <th className="py-1.5 pr-3 font-semibold">CCA</th>
            <th className="py-1.5 pr-3 font-semibold">Warranty</th>
            <th className="py-1.5 pr-1 text-right font-semibold">{tier ? (counter ? "Retail" : "Price") : ""}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const w = resolveWarranty(o, db.warrantyRules);
            const amount = price(o);
            const isCurrent = o.id === current.id;
            const diff = base !== null && amount !== null && !isCurrent ? amount - base : null;
            const extraMonths = w?.months != null && baseWarranty != null ? w.months - baseWarranty : null;
            const otherSide = side(o) && side(current) && side(o) !== side(current);
            return (
              <tr key={o.id} className={`border-b border-neutral-100 align-top ${isCurrent ? "bg-neutral-50" : ""}`}>
                <td className="py-2 pl-1 pr-3">
                  <Link href={hrefFor(o.code)} scroll={false} replace prefetch={false} data-drawer={o.code} className="flex items-center gap-2 hover:text-brand">
                    <ProductThumb product={o} />
                    <span>
                      <span className="block font-semibold">{rangeName(o)}</span>
                      <span className="block font-mono text-[11px] text-neutral-500">{o.code}</span>
                      {isCurrent && <span className="text-[11px] font-semibold text-brand">This battery</span>}
                      {otherSide && <span className="block text-[11px] text-amber-700">Opposite terminal layout</span>}
                    </span>
                  </Link>
                </td>
                <td className="py-2 pr-3 tabular-nums">{cca(o) ?? "–"}</td>
                <td className="py-2 pr-3">
                  <WarrantyBadge warranty={w} short />
                  {amount !== null && w?.months ? (
                    <span className="mt-1 block text-[11px] tabular-nums text-neutral-500">
                      {formatRand(amount / w.months)} / month
                    </span>
                  ) : null}
                </td>
                <td className="py-2 pr-1 text-right tabular-nums">
                  {amount !== null ? <span className="font-bold">{formatRand(amount)}</span> : <span className="text-neutral-400">–</span>}
                  {diff !== null && diff > 0 && (
                    <span className="mt-0.5 flex items-center justify-end gap-0.5 text-[11px] font-semibold text-brand">
                      <ArrowUpRight className="size-3" />+{formatRand(diff)}
                      {extraMonths && extraMonths > 0 ? ` · +${extraMonths} mo` : ""}
                    </span>
                  )}
                  {diff !== null && diff < 0 && (
                    <span className="mt-0.5 block text-[11px] text-neutral-500">{formatRand(diff)}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AdminTools({ product: p, defaultWarranty }: { product: Product; defaultWarranty: ReturnType<typeof resolveWarranty> }) {
  const input = "rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-ink";
  return (
    <section className="border-t-4 border-ink bg-neutral-50 px-5 py-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-ink">Enertec staff</h3>

      <form action={setProductWarranty} className="mt-3 space-y-2">
        <input type="hidden" name="code" value={p.code} />
        <p className="text-sm font-semibold">
          Warranty for this product only
          <span className="ml-2 font-normal text-neutral-500">
            {p.warranty
              ? "Overriding the warranty rules."
              : defaultWarranty
                ? `From the rules: ${warrantyLabel(defaultWarranty.months)}.`
                : "No rule covers this product."}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            name="months"
            defaultValue={p.warranty ? (p.warranty.months ?? "none") : ""}
            placeholder="Months, or none"
            className={`${input} w-36`}
          />
          <input name="conditions" defaultValue={p.warranty?.conditions ?? ""} placeholder="Conditions (optional)" className={`${input} min-w-48 flex-1`} />
        </div>
        <div className="flex gap-2">
          <button className="rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-white hover:bg-black">Save warranty</button>
          {p.warranty && (
            <button name="clear" value="1" className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-white">
              Use the rules again
            </button>
          )}
        </div>
      </form>

      <form action={setProductImage} className="mt-5 space-y-2">
        <input type="hidden" name="code" value={p.code} />
        <p className="text-sm font-semibold">Photo</p>
        <div className="flex flex-wrap items-center gap-2">
          <input name="photo" type="file" accept="image/*" className="text-sm file:mr-2 file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white" />
          <button className="rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-white hover:bg-black">Upload</button>
          <button name="websitePhoto" value="1" className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-white">
            Use website photo
          </button>
        </div>
        <p className="text-xs text-neutral-500">Resized to 800 px on a white background. Shows everywhere straight away.</p>
      </form>
    </section>
  );
}
