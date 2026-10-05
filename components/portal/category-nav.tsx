import Link from "next/link";
import { PILLARS } from "@/lib/catalog";
import type { Category } from "@/lib/types";
import { ScrollRow } from "./scroll-row";

type Counted = Category & { count: number };

/** Compact category switcher shown once a buyer is inside a category or search. */
export function CategoryNav({ categories, active, href }: { categories: Counted[]; active: string; href: (cat: string | null) => string }) {
  return (
    <ScrollRow
      label="Categories"
      className="relative -mx-4 flex gap-1.5 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,black_88%,transparent)] [scrollbar-width:none] sm:mx-0 sm:flex-col sm:gap-2 sm:overflow-visible sm:px-0 sm:[mask-image:none]"
    >
      {PILLARS.map((pillar) => {
        const items = categories.filter((c) => c.pillar === pillar.id && c.count > 0);
        if (items.length === 0) return null;
        return (
          <div key={pillar.id} className="contents sm:flex sm:items-center sm:gap-3">
            <span className="hidden w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-neutral-500 sm:block">
              {pillar.name}
            </span>
            <div className="contents sm:flex sm:flex-wrap sm:gap-1.5">
              {items.map((c) => {
                const on = c.id === active;
                return (
                  <Link
                    key={c.id}
                    href={href(on ? null : c.id)}
                    aria-current={on ? "page" : undefined}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition sm:py-1 ${
                      on ? "border-ink bg-ink text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-ink"
                    }`}
                  >
                    {c.name}
                    <span className={`ml-1.5 text-xs ${on ? "text-white/70" : "text-neutral-500"}`}>{c.count}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </ScrollRow>
  );
}

/** Landing view: three pillars of category cards instead of the whole range at once. */
export function CategoryOverview({
  categories,
  brands,
  href,
}: {
  categories: Counted[];
  brands: Record<string, string[]>;
  href: (cat: string) => string;
}) {
  return (
    <div className="space-y-8">
      {PILLARS.map((pillar) => {
        const items = categories.filter((c) => c.pillar === pillar.id);
        if (items.length === 0) return null;
        return (
          <section key={pillar.id}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">{pillar.name}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((c) => (
                <Link
                  key={c.id}
                  href={href(c.id)}
                  className="group rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-ink hover:shadow-sm"
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-bold leading-tight group-hover:text-brand">{c.name}</span>
                    <span className="text-xs tabular-nums text-neutral-500">{c.count}</span>
                  </span>
                  <span className="mt-1 block text-sm text-neutral-500">{c.blurb}</span>
                  {brands[c.id]?.length > 0 && (
                    <span className="mt-3 block truncate text-xs text-neutral-500">{brands[c.id].join(" · ")}</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
