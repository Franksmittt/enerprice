import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { deleteWarrantyRule, saveRanges, saveWarrantyRule, saveWarrantyTerms } from "@/app/actions";
import { readDb } from "@/lib/db";
import { serializeFilters } from "@/lib/search-params";
import type { WarrantyRule } from "@/lib/types";
import { WARRANTY_CATEGORIES, resolveWarranty, ruleMatches, today, warrantyLabel } from "@/lib/warranty";

const TYPES = ["Flooded", "EFB", "AGM", "Gel", "Lithium"];
const field = "w-full rounded border border-neutral-300 bg-white px-2 py-1 text-sm outline-none focus:border-ink";

export default async function WarrantiesPage() {
  const db = await readDb();
  const brands = [...new Set(db.products.map((p) => p.brand).filter(Boolean) as string[])].sort();
  const now = today();

  const covered = db.products.filter((p) => WARRANTY_CATEGORIES.has(p.categoryId));
  const gaps = covered.filter((p) => !resolveWarranty(p, db.warrantyRules));
  const overridden = db.products.filter((p) => p.warranty);
  const productHref = (code: string) => `/portal${serializeFilters({ q: code, p: code })}`;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Warranties & ranges</h1>
        <p className="max-w-3xl text-sm text-neutral-600">
          One source of truth for warranties, built from Enertec&apos;s published warranty table. Each product takes the most specific
          rule that matches it; a rule with a later <em>valid from</em> date replaces an older one on that date, so a change can be
          loaded ahead of time. Any single product can be overridden from its detail panel in the portal.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Stat label="Rules" value={db.warrantyRules.length} />
          <Stat label="Products with a warranty" value={`${covered.length - gaps.length} of ${covered.length}`} />
          <Stat label="Product overrides" value={overridden.length} />
        </div>
      </div>

      <section>
        <h2 className="text-lg font-bold">Rules</h2>
        <p className="text-sm text-neutral-500">
          Leave a criterion blank to match anything. Months: a number, or <code>none</code> for no warranty. If two rules are equally
          specific, the lower one wins.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full min-w-[72rem] text-sm">
            <thead className="bg-neutral-50 text-left text-[11px] uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="w-36 px-2 py-2 font-semibold">Brand</th>
                <th className="w-24 px-2 py-2 font-semibold">Type</th>
                <th className="w-36 px-2 py-2 font-semibold">Category</th>
                <th className="w-40 px-2 py-2 font-semibold">Name contains</th>
                <th className="w-20 px-2 py-2 font-semibold">Months</th>
                <th className="px-2 py-2 font-semibold">Conditions (customers see this)</th>
                <th className="w-32 px-2 py-2 font-semibold">Valid from</th>
                <th className="w-16 px-2 py-2 text-right font-semibold">Products</th>
                <th className="w-32 px-2 py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {db.warrantyRules.map((r) => (
                <RuleRow
                  key={`${r.id}:${r.months}:${r.validFrom}:${r.conditions}:${r.match}:${r.brand}:${r.chem}:${r.categoryId}:${r.note}`}
                  rule={r}
                  brands={brands}
                  categories={db.categories}
                  count={db.products.filter((p) => ruleMatches(p, r)).length}
                  status={r.validFrom > now ? "scheduled" : "live"}
                />
              ))}
              <RuleRow key={`new-${db.warrantyRules.length}`} rule={null} brands={brands} categories={db.categories} count={0} status="live" />
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-bold">No warranty found ({gaps.length})</h2>
          <p className="text-sm text-neutral-500">Batteries, chargers and testers no rule covers. Customers see “warranty on request”.</p>
          <ul className="mt-3 max-h-80 divide-y divide-neutral-100 overflow-y-auto rounded-lg border border-neutral-200 bg-white text-sm">
            {gaps.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-1.5">
                <span className="min-w-0 truncate">
                  <span className="font-mono text-xs font-semibold">{p.code}</span>
                  <span className="ml-2 text-neutral-600">{p.description}</span>
                </span>
                <Link href={productHref(p.code)} className="shrink-0 text-xs font-semibold text-brand hover:underline">
                  Set
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold">Product overrides ({overridden.length})</h2>
          <p className="text-sm text-neutral-500">Open any product in the portal to set a warranty for it alone.</p>
          <ul className="mt-3 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white text-sm">
            {overridden.length === 0 && <li className="px-3 py-3 text-neutral-500">None yet.</li>}
            {overridden.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-1.5">
                <span className="min-w-0 truncate">
                  <span className="font-mono text-xs font-semibold">{p.code}</span>
                  <span className="ml-2 font-semibold">{warrantyLabel(p.warranty!.months)}</span>
                  {p.warranty!.conditions && <span className="ml-2 text-neutral-500">{p.warranty!.conditions}</span>}
                </span>
                <Link href={productHref(p.code)} className="shrink-0 text-xs font-semibold text-brand hover:underline">
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <form action={saveWarrantyTerms} key={db.settings.warrantyTerms} className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="font-bold">General warranty terms</h2>
        <p className="text-sm text-neutral-600">Shown under every warranty in the product panel. One term per line.</p>
        <textarea name="warrantyTerms" rows={6} defaultValue={db.settings.warrantyTerms ?? ""} aria-label="General warranty terms" className={`${field} mt-3 max-w-4xl`} />
        <button className="mt-3 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black">Save terms</button>
      </form>

      <form action={saveRanges} key={JSON.stringify(db.ranges)} className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="font-bold">Range comparison wording</h2>
        <p className="text-sm text-neutral-600">
          Why one range costs more than another, in the words buyers can repeat to their customers. Shown on product panels and the
          Compare ranges page.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {db.ranges.map((r) => (
            <fieldset key={r.id} className="rounded-md border border-neutral-200 p-3">
              <legend className="px-1 text-sm font-bold">
                {r.brand} {r.chem !== "Flooded" && r.chem}
              </legend>
              <label className="block text-xs font-medium text-neutral-500">
                Headline
                <input name={`headline_${r.id}`} defaultValue={r.headline} className={`${field} mt-0.5`} />
              </label>
              <label className="mt-2 block text-xs font-medium text-neutral-500">
                Selling points (one per line)
                <textarea name={`points_${r.id}`} rows={3} defaultValue={r.points} className={`${field} mt-0.5`} />
              </label>
            </fieldset>
          ))}
        </div>
        <button className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black">Save wording</button>
      </form>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-4 py-2">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-lg font-black tabular-nums">{value}</p>
    </div>
  );
}

function RuleRow({
  rule: r,
  brands,
  categories,
  count,
  status,
}: {
  rule: WarrantyRule | null;
  brands: string[];
  categories: { id: string; name: string }[];
  count: number;
  status: "live" | "scheduled";
}) {
  const formId = r ? `rule-${r.id}` : "rule-new";
  return (
    <tr className={`border-t border-neutral-100 align-top ${r ? "" : "bg-neutral-50"}`}>
      <td className="px-2 py-1.5">
        <select name="brand" form={formId} defaultValue={r?.brand ?? ""} aria-label="Brand" className={field}>
          <option value="">Any brand</option>
          {brands.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1.5">
        <select name="chem" form={formId} defaultValue={r?.chem ?? ""} aria-label="Type" className={field}>
          <option value="">Any</option>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1.5">
        <select name="categoryId" form={formId} defaultValue={r?.categoryId ?? ""} aria-label="Category" className={field}>
          <option value="">Any category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1.5">
        <input name="match" form={formId} defaultValue={r?.match ?? ""} placeholder="e.g. GC2, Blade" aria-label="Code or name contains" className={field} />
      </td>
      <td className="px-2 py-1.5">
        <input
          name="months"
          form={formId}
          defaultValue={r ? (r.months ?? "none") : ""}
          placeholder={r ? "" : "24"}
          aria-label="Warranty months, or none"
          required
          className={`${field} tabular-nums`}
        />
      </td>
      <td className="px-2 py-1.5">
        <input name="conditions" form={formId} defaultValue={r?.conditions ?? ""} aria-label="Conditions shown to customers" className={field} />
        <input
          name="note"
          form={formId}
          defaultValue={r?.note ?? ""}
          placeholder="Staff note (not shown to customers)"
          aria-label="Staff note"
          className={`${field} mt-1 text-xs ${r?.note ? "border-amber-300 bg-amber-50" : "text-neutral-500"}`}
        />
        {r?.note && (
          <span className="mt-0.5 flex items-center gap-1 text-[11px] text-amber-800">
            <AlertTriangle className="size-3" /> Check this rule
          </span>
        )}
      </td>
      <td className="px-2 py-1.5">
        <input
          name="validFrom"
          type="date"
          form={formId}
          defaultValue={r?.validFrom ?? today()}
          aria-label="Valid from"
          required
          className={field}
        />
        {status === "scheduled" && <span className="mt-0.5 block text-[11px] font-semibold text-brand">Scheduled</span>}
      </td>
      <td className="px-2 py-1.5 text-right tabular-nums text-neutral-600">{r ? count : ""}</td>
      <td className="px-2 py-1.5">
        <form id={formId} action={saveWarrantyRule} className="flex justify-end gap-1">
          {r && <input type="hidden" name="id" value={r.id} />}
          <button className="rounded bg-ink px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-black sm:py-1">{r ? "Save" : "Add rule"}</button>
          {r && (
            <button formAction={deleteWarrantyRule} className="rounded px-2 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-alert sm:py-1">
              Delete
            </button>
          )}
        </form>
      </td>
    </tr>
  );
}
