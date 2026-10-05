"use client";

import { Search, X } from "lucide-react";
import { useQueryState, useQueryStates } from "nuqs";
import { filterParsers } from "@/lib/search-params";

export function SearchBox({ placeholder = "Search code or description…" }: { placeholder?: string }) {
  const [q, setQ] = useQueryState("q", filterParsers.q.withOptions({ shallow: false, throttleMs: 250 }));
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value || null)}
        placeholder={placeholder}
        aria-label="Search the pricelist"
        enterKeyHint="search"
        className="w-full text-ellipsis rounded-md border border-neutral-300 py-2.5 pl-9 pr-10 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ(null)}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-neutral-400 hover:text-ink"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export function CategorySelect({ categories }: { categories: { id: string; name: string; count: number }[] }) {
  const [cat, setCat] = useQueryState("cat", filterParsers.cat.withOptions({ shallow: false }));
  return (
    <select
      value={cat}
      onChange={(e) => setCat(e.target.value || null)}
      aria-label="Category"
      className="rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink"
    >
      <option value="">All categories</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name} ({c.count})
        </option>
      ))}
    </select>
  );
}

export function TierPreviewSelect({ tiers }: { tiers: { id: string; name: string }[] }) {
  const [{ tier }, set] = useQueryStates({ tier: filterParsers.tier }, { shallow: false });
  return (
    <select
      value={tier || tiers[0]?.id}
      onChange={(e) => set({ tier: e.target.value })}
      aria-label="Preview pricing tier"
      className="rounded-md border border-white/30 bg-ink px-2 py-1 text-sm text-white outline-none"
    >
      {tiers.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
