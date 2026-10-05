import { ChevronDown, FileDown, FileSpreadsheet } from "lucide-react";
import { PILLARS } from "@/lib/catalog";
import type { Category } from "@/lib/types";

type Counted = Category & { count: number };

/**
 * PDF export: the current view, a hand-picked set of categories, or the whole range. Plain GET
 * links and a GET form, so it works without client JavaScript.
 */
export function ExportMenu({
  categories,
  currentCat,
  viewHref,
  viewCount,
  csvHref,
  tierId,
  total,
}: {
  categories: Counted[];
  currentCat: string;
  viewHref: string | null;
  viewCount: number;
  csvHref: string;
  tierId: string | null;
  total: number;
}) {
  return (
    <div className="contents sm:flex sm:gap-2">
      <a
        href={csvHref}
        className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-neutral-50"
      >
        <FileSpreadsheet className="size-4 shrink-0 max-[359px]:hidden" /> Excel
      </a>
      <details className="group sm:relative">
        <summary className="flex cursor-pointer list-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark [&::-webkit-details-marker]:hidden">
          <FileDown className="size-4 shrink-0 max-[359px]:hidden" /> Download PDF
          <ChevronDown className="size-4 transition group-open:rotate-180" />
        </summary>
        <div className="absolute inset-x-0 z-30 mt-2 rounded-lg border border-neutral-200 bg-white p-4 text-sm shadow-xl sm:left-auto sm:right-0 sm:w-[22rem]">
          <p className="text-xs text-neutral-500">A4 portrait, ready to print or share. Your prices only.</p>

          {viewHref && (
            <a
              href={viewHref}
              target="_blank"
              rel="noopener"
              className="mt-3 flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 font-medium hover:border-ink"
            >
              What I&apos;m looking at
              <span className="text-xs text-neutral-500">
                {viewCount} product{viewCount === 1 ? "" : "s"}
              </span>
            </a>
          )}

          <form action="/portal/pricelist.pdf" method="get" target="_blank" className="mt-3">
            {tierId && <input type="hidden" name="tier" value={tierId} />}
            <fieldset className="rounded-md border border-neutral-200 p-3">
              <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Choose categories</legend>
              <div className="space-y-2.5">
                {PILLARS.map((pillar) => {
                  const items = categories.filter((c) => c.pillar === pillar.id && c.count > 0);
                  if (items.length === 0) return null;
                  return (
                    <div key={pillar.id}>
                      <p className="text-[11px] font-semibold text-neutral-500">{pillar.name}</p>
                      {items.map((c) => (
                        <label key={c.id} className="flex cursor-pointer items-center gap-2 py-1.5 sm:py-0.5">
                          <input type="checkbox" name="cat" value={c.id} defaultChecked={c.id === currentCat} className="size-4 accent-brand" />
                          <span className="flex-1">{c.name}</span>
                          <span className="text-xs tabular-nums text-neutral-500">{c.count}</span>
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
            </fieldset>
            <label className="mt-3 flex cursor-pointer flex-wrap items-center gap-x-2 py-1 sm:py-0">
              <input type="checkbox" name="img" value="1" className="size-4 accent-brand" />
              <span>Include product photos</span>
              <span className="text-xs text-neutral-500">more pages, more ink</span>
            </label>
            <button className="mt-3 w-full rounded-md bg-ink px-3 py-2 font-semibold text-white hover:bg-black">
              Download selected categories
            </button>
          </form>

          <a
            href={`/portal/pricelist.pdf${tierId ? `?tier=${tierId}` : ""}`}
            target="_blank"
            rel="noopener"
            className="mt-1 block py-2 text-center text-sm font-semibold text-brand hover:underline"
          >
            Complete pricelist · all {total} products
          </a>
        </div>
      </details>
    </div>
  );
}
