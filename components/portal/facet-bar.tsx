import Link from "next/link";
import type { Facet, FacetFilters } from "@/lib/catalog";

export function FacetBar({
  facets,
  active,
  href,
}: {
  facets: Facet[];
  active: FacetFilters;
  href: (change: Partial<Record<keyof FacetFilters, string | null>>) => string;
}) {
  if (facets.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 border-b border-neutral-200 pb-4">
      {facets.map((f) => (
        <div key={f.key} className="flex items-start gap-3">
          <span className="w-16 shrink-0 pt-2 text-xs sm:pt-1 font-semibold uppercase tracking-wider text-neutral-500">{f.label}</span>
          <div className="flex flex-wrap gap-1.5">
            {f.options.map((o) => {
              const on = active[f.key] === o.value;
              return (
                <Link
                  key={o.value}
                  href={href({ [f.key]: on ? null : o.value })}
                  scroll={false}
                  aria-current={on ? "true" : undefined}
                  className={`rounded-md border px-2.5 py-1.5 text-xs transition sm:px-2 sm:py-0.5 ${
                    on ? "border-brand bg-brand text-white" : "border-neutral-200 text-neutral-700 hover:border-ink"
                  }`}
                >
                  {o.value}
                  <span className={`ml-1 ${on ? "text-white/75" : "text-neutral-500"}`}>{o.count}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
