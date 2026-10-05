import { Fragment } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { keySpecs, matchedAlias, sizeOf } from "@/lib/catalog";
import type { CounterMode } from "@/lib/counter";
import { formatRand } from "@/lib/format";
import { resolvePrice, retailQuote } from "@/lib/pricing";
import type { SortDir, SortKey } from "@/lib/search-params";
import { SORT_LABELS } from "@/lib/sort";
import type { Product, Tier, WarrantyRule } from "@/lib/types";
import { resolveWarranty } from "@/lib/warranty";
import { ProductThumb } from "./product-thumb";
import { WarrantyBadge } from "./warranty-badge";

type Props = {
  products: Product[];
  tier: Tier | null;
  vatRate: number;
  q: string;
  rules: WarrantyRule[];
  counter: CounterMode;
  /** Opens the product drawer over the current view. */
  hrefFor: (code: string) => string;
  /** Products arrive already sorted; while sorted, ranges are merged into one list. */
  sort: { key: SortKey; dir: SortDir } | null;
  sortHref: (key: SortKey) => string;
};

function byGroup(products: Product[]) {
  const groups = new Map<string, Product[]>();
  for (const p of products) groups.set(p.group, [...(groups.get(p.group) ?? []), p]);
  return [...groups];
}

export function PriceTable(props: Props) {
  if (props.sort) return <GroupTable group={null} {...props} />;
  return (
    <div className="space-y-6">
      {byGroup(props.products).map(([group, items]) => (
        <GroupTable key={group} group={group} {...props} products={items} />
      ))}
    </div>
  );
}

function SortHeader({
  label,
  column,
  sort,
  sortHref,
  className = "",
  alignRight = false,
}: {
  label: string;
  column: SortKey;
  sort: Props["sort"];
  sortHref: Props["sortHref"];
  className?: string;
  alignRight?: boolean;
}) {
  const dir = sort?.key === column ? sort.dir : null;
  const Icon = dir === "asc" ? ArrowUp : dir === "desc" ? ArrowDown : ArrowUpDown;
  const next = dir === "asc" ? "high to low" : dir === "desc" ? "pricelist order" : "low to high";
  return (
    <th className={`py-2 font-semibold ${alignRight ? "text-right" : ""} ${className}`} aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none"}>
      <Link
        href={sortHref(column)}
        scroll={false}
        title={`Sort by ${SORT_LABELS[column].toLowerCase()}: ${next}`}
        className={`group/sort inline-flex items-center gap-1 rounded uppercase hover:text-ink ${dir ? "text-brand" : ""} ${alignRight ? "flex-row-reverse" : ""}`}
      >
        {label}
        <Icon className={`size-3.5 shrink-0 ${dir ? "" : "text-neutral-300 group-hover/sort:text-neutral-500"}`} />
      </Link>
    </th>
  );
}

/** Column headers don't exist on phones, so the same sort options sit in a row of chips. */
export function SortChips({ sort, sortHref, columns }: Pick<Props, "sort" | "sortHref"> & { columns: SortKey[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs md:hidden">
      <span className="font-semibold uppercase tracking-wider text-neutral-500">Sort</span>
      {columns.map((column) => {
        const dir = sort?.key === column ? sort.dir : null;
        const Icon = dir === "asc" ? ArrowUp : dir === "desc" ? ArrowDown : ArrowUpDown;
        return (
          <Link
            key={column}
            href={sortHref(column)}
            scroll={false}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-semibold ${
              dir ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white text-neutral-700"
            }`}
          >
            {SORT_LABELS[column]}
            <Icon className="size-3" />
          </Link>
        );
      })}
    </div>
  );
}

function GroupTable({ group, products, tier, vatRate, q, rules, counter, hrefFor, sort, sortHref }: Props & { group: string | null }) {
  const showSize = products.some(sizeOf);
  const showDescription = products.some((p) => !p.specs || !sizeOf(p));
  const showSpecs = products.some((p) => p.specs);
  const warranties = new Map(products.map((p) => [p.id, resolveWarranty(p, rules)]));
  const showWarranty = [...warranties.values()].some(Boolean);
  const priceLabel = !tier ? "" : counter ? `Retail ${counter.inclVat ? "incl." : "excl."} VAT` : "Your price ex VAT";

  const header = { sort, sortHref };

  return (
    <section>
      {group && (
        <h4 className="mb-1 flex items-baseline gap-2 text-sm font-bold text-ink">
          {group}
          <span className="text-xs font-normal text-neutral-500">{products.length}</span>
        </h4>
      )}

      <table className="hidden w-full text-sm md:table">
        <thead className="text-left text-[11px] uppercase tracking-wider text-neutral-500">
          <tr className="border-b border-neutral-200">
            <th className="w-16 py-2 pr-3">
              <span className="sr-only">Photo</span>
            </th>
            <SortHeader label="Item code" column="code" className="w-44 pr-4" {...header} />
            {showSize && <SortHeader label="Size" column="size" className="w-24 pr-4" {...header} />}
            {showDescription && <th className="py-2 pr-4 font-semibold">Product</th>}
            {showSpecs && <SortHeader label="Key specs" column="specs" className="pr-4" {...header} />}
            {showWarranty && <SortHeader label="Warranty" column="warranty" className="w-32 pr-4" {...header} />}
            {tier ? (
              <SortHeader label={priceLabel} column="price" className="w-36" alignRight {...header} />
            ) : (
              <th className="w-36 py-2">
                <span className="sr-only">Price</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={`group/row border-b border-neutral-100 align-top hover:bg-neutral-50 ${p.discontinued ? "text-neutral-500" : ""}`}>
              <td className="py-2 pr-3">
                <Link href={hrefFor(p.code)} scroll={false} prefetch={false} data-drawer={p.code} aria-label={`Details for ${p.code}`}>
                  <ProductThumb product={p} />
                </Link>
              </td>
              <td className="py-2.5 pr-4">
                <Code product={p} q={q} href={hrefFor(p.code)} showRange={!group} />
              </td>
              {showSize && <td className="py-2.5 pr-4 text-base font-bold tabular-nums">{sizeOf(p) ?? ""}</td>}
              {showDescription && <td className="py-2.5 pr-4">{p.specs && sizeOf(p) ? "" : p.description}</td>}
              {showSpecs && (
                <td className="py-2.5 pr-4">
                  <Specs product={p} />
                </td>
              )}
              {showWarranty && (
                <td className="py-2.5 pr-4">
                  <WarrantyBadge warranty={warranties.get(p.id) ?? null} />
                </td>
              )}
              <td className="py-2.5 text-right">
                <Price product={p} tier={tier} vatRate={vatRate} counter={counter} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-neutral-100 border-y border-neutral-200 md:hidden">
        {products.map((p) => (
          <li key={p.id} className={`relative flex gap-3 py-3 has-[>a:active]:bg-neutral-50 ${p.discontinued ? "text-neutral-500" : ""}`}>
            <ProductThumb product={p} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <Code product={p} q={q} href={hrefFor(p.code)} showRange={!group} />
                <Price product={p} tier={tier} vatRate={vatRate} counter={counter} />
              </div>
              <p className="mt-1 text-sm">
                {sizeOf(p) && <span className="mr-1.5 font-bold">{sizeOf(p)}</span>}
                {(!p.specs || !sizeOf(p)) && p.description}
              </p>
              {p.specs && <Specs product={p} />}
              {warranties.get(p.id) && (
                <div className="mt-1">
                  <WarrantyBadge warranty={warranties.get(p.id) ?? null} />
                </div>
              )}
            </div>
            <Link href={hrefFor(p.code)} scroll={false} prefetch={false} data-drawer={p.code} aria-label={`Details for ${p.code}`} className="absolute inset-0" />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Code({ product: p, q, href, showRange }: { product: Product; q: string; href: string; showRange: boolean }) {
  const alias = matchedAlias(p, q);
  return (
    <div>
      <Link
        href={href}
        scroll={false}
        prefetch={false}
        data-drawer={p.code}
        className="whitespace-nowrap font-mono text-xs font-semibold tabular-nums underline-offset-2 hover:text-brand hover:underline"
      >
        {p.code}
      </Link>
      {showRange && <span className="block text-xs font-semibold text-neutral-600">{p.group}</span>}
      {(p.isNew || p.discontinued) && (
        <span className="mt-1 flex flex-wrap gap-1">
          {p.isNew && <Badge className="bg-alert text-white">New</Badge>}
          {p.discontinued && <Badge className="bg-neutral-100 text-neutral-600">While stocks last</Badge>}
        </span>
      )}
      {alias && <span className="mt-0.5 block text-[11px] text-neutral-500">Matched old code {alias}</span>}
    </div>
  );
}

export function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${className}`}>{children}</span>;
}

function Specs({ product: p }: { product: Product }) {
  const { primary, fitment } = keySpecs(p);
  return (
    <div className="text-sm">
      {primary && <span className="tabular-nums"><SpecParts text={primary} /></span>}
      {fitment && <span className="block text-xs tabular-nums text-neutral-500"><SpecParts text={fitment} /></span>}
    </div>
  );
}

/** Wraps only between parts, so "330 CCA EN" or "Layout RHP (0)" never splits across lines. */
function SpecParts({ text }: { text: string }) {
  const parts = text.split(" · ");
  return parts.map((part, i) =>
    i < parts.length - 1 ? (
      <Fragment key={i}>
        <span className="whitespace-nowrap">{part} ·</span>{" "}
      </Fragment>
    ) : (
      <span key={i} className="whitespace-nowrap">{part}</span>
    ),
  );
}

/** The buyer's private view in counter mode: what they paid, what they make, and the GP on the ex-VAT sale. */
export function MarginLine({ quote }: { quote: ReturnType<typeof retailQuote> }) {
  return (
    <span className="mt-1 inline-flex flex-col items-end rounded border border-dashed border-neutral-300 bg-neutral-50 px-1.5 py-0.5 text-[11px] leading-snug text-neutral-600">
      <span>
        Cost <span className="font-semibold text-ink">{formatRand(quote.cost)}</span>
      </span>
      <span>
        Profit <span className="font-semibold text-ink">{formatRand(quote.profit)}</span> · GP{" "}
        <span className="font-semibold text-ink">{quote.gp.toFixed(1)}%</span>
      </span>
    </span>
  );
}

export function Price({
  product,
  tier,
  vatRate,
  counter,
}: {
  product: Product;
  tier: Tier | null;
  vatRate: number;
  counter: CounterMode;
}) {
  if (!tier) return <span className="whitespace-nowrap text-xs text-neutral-500">On approval</span>;
  const { price } = resolvePrice(product, tier);
  if (!(price > 0)) {
    return <Badge className="whitespace-nowrap border border-neutral-300 bg-white text-neutral-600">Price TBA</Badge>;
  }
  if (counter) {
    const quote = retailQuote(price, counter, vatRate);
    return (
      <div className="whitespace-nowrap text-right tabular-nums">
        <span className="block text-base font-black text-ink">{formatRand(quote.shown)}</span>
        <span className="block text-xs text-neutral-500">
          {counter.inclVat ? `${formatRand(quote.ex, true)} excl.` : `${formatRand(quote.incl, true)} incl.`}
        </span>
        {counter.margin && <MarginLine quote={quote} />}
      </div>
    );
  }
  return (
    <div className="whitespace-nowrap text-right tabular-nums">
      <span className="block font-bold text-ink">{formatRand(price)}</span>
      <span className="block text-xs text-neutral-500">{formatRand(price * (1 + vatRate), true)} incl.</span>
    </div>
  );
}
