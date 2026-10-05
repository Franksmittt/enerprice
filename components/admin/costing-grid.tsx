"use client";

import { useRef, useState, useTransition } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { deleteProduct, setOverride, updateCost } from "@/app/actions";
import { specSummary } from "@/lib/catalog";
import { formatPct, formatRand } from "@/lib/format";
import { resolvePrice } from "@/lib/pricing";
import type { Product, Tier } from "@/lib/types";

type Section = { id: string; name: string; products: Product[] };

const LOW_GP = 5;

export function CostingGrid({ sections, tiers }: { sections: Section[]; tiers: Tier[] }) {
  if (sections.length === 0) {
    return <p className="rounded-lg border border-neutral-200 bg-white p-10 text-center text-neutral-500">No products match.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full min-w-[960px] text-sm">
        <thead className="sticky top-0 bg-ink text-left text-xs uppercase tracking-wider text-white">
          <tr>
            <th className="px-3 py-3 font-semibold">Item code</th>
            <th className="px-3 py-3 font-semibold">Description</th>
            <th className="w-32 px-3 py-3 font-semibold">Enertec cost</th>
            {tiers.map((t) => (
              <th key={t.id} className="w-40 px-3 py-3 font-semibold">
                {t.name}
                <span className="block text-[10px] font-normal normal-case tracking-normal text-neutral-300">
                  {t.method === "markup" ? "Markup" : "GP"} {t.value}% default
                </span>
              </th>
            ))}
            <th className="w-10">
              <span className="sr-only">Delete</span>
            </th>
          </tr>
        </thead>
        {sections.map((section) => (
          <tbody key={section.id}>
            <tr>
              <td colSpan={4 + tiers.length} className="bg-neutral-100 px-3 py-2 text-xs font-bold uppercase tracking-wider">
                {section.name}
                <span className="ml-2 font-normal text-neutral-600">
                  {section.products.length} item{section.products.length === 1 ? "" : "s"}
                </span>
              </td>
            </tr>
            {section.products.map((p) => (
              <Row key={`${p.id}:${p.updatedAt}`} product={p} tiers={tiers} />
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

function Row({ product, tiers }: { product: Product; tiers: Tier[] }) {
  const [cost, setCost] = useState(String(product.cost));
  const [pending, startTransition] = useTransition();
  const numericCost = Number(cost.replace(/[R\s,]/g, ""));
  const live = { ...product, cost: Number.isFinite(numericCost) ? numericCost : product.cost };

  const savedCost = useRef(product.cost);

  function commitCost() {
    if (!Number.isFinite(numericCost) || numericCost < 0 || numericCost === savedCost.current) return;
    savedCost.current = numericCost;
    startTransition(() => updateCost(product.id, numericCost));
  }

  return (
    <tr className={`border-t border-neutral-100 align-top hover:bg-neutral-50 ${pending ? "opacity-60" : ""}`}>
      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs font-semibold">
        {product.code}
        {product.isNew && <span className="ml-1.5 rounded bg-alert px-1 py-0.5 text-[9px] font-bold text-white">NEW</span>}
        {product.discontinued && (
          <span className="block font-sans text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Discontinued</span>
        )}
      </td>
      <td className="min-w-72 px-3 py-2.5">
        <span className="line-clamp-2">{product.description}</span>
        <span className="line-clamp-2 text-xs text-neutral-500">
          {product.specs ? specSummary(product) : product.group}
        </span>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center rounded border border-neutral-300 focus-within:border-ink">
          <span className="pl-2 text-neutral-400">R</span>
          <input
            value={cost}
            inputMode="decimal"
            onChange={(e) => setCost(e.target.value)}
            onBlur={commitCost}
            onKeyDown={(e) => e.key === "Enter" && commitCost()}
            aria-label={`Cost for ${product.code}`}
            className="w-full bg-transparent px-1.5 py-1.5 tabular-nums outline-none"
          />
        </div>
      </td>
      {tiers.map((t) => (
        <PriceCell key={t.id} product={live} tier={t} />
      ))}
      <td className="px-2 py-2.5">
        <button
          type="button"
          aria-label={`Delete ${product.code}`}
          onClick={() => confirm(`Delete ${product.code}?`) && startTransition(() => deleteProduct(product.id))}
          className="rounded p-1.5 text-neutral-300 hover:bg-alert/10 hover:text-alert"
        >
          <Trash2 className="size-4" />
        </button>
      </td>
    </tr>
  );
}

function PriceCell({ product, tier }: { product: Product; tier: Tier }) {
  const r = resolvePrice(product, tier);
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();
  const lowMargin = r.price > 0 && r.gp < LOW_GP;

  const closed = useRef(false);

  function open() {
    closed.current = false;
    setEditing(true);
  }

  function save(value: string) {
    if (closed.current) return;
    closed.current = true;
    setEditing(false);
    const n = Number(value.replace(/[R\s,]/g, ""));
    if (!value.trim() || n === r.rulePrice) startTransition(() => setOverride(product.id, tier.id, null));
    else if (Number.isFinite(n) && n > 0 && n !== r.price) startTransition(() => setOverride(product.id, tier.id, n));
  }

  return (
    <td className="px-3 py-2">
      {editing ? (
        <input
          autoFocus
          defaultValue={r.price}
          inputMode="decimal"
          onBlur={(e) => save(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save(e.currentTarget.value);
            if (e.key === "Escape") {
              closed.current = true;
              setEditing(false);
            }
          }}
          aria-label={`Manual ${tier.name} price for ${product.code}`}
          className="w-full rounded border border-ink px-2 py-1.5 tabular-nums outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={open}
          title="Click to set a manual price"
          className="w-full rounded px-2 py-1 text-left hover:bg-neutral-100"
        >
          <span className="flex items-center gap-1.5 font-semibold tabular-nums">
            {r.price > 0 ? formatRand(r.price) : "TBA"}
            {r.manual && <span className="rounded bg-amber-100 px-1 text-[9px] font-bold uppercase text-amber-800">Manual</span>}
          </span>
          <span className={`block whitespace-nowrap text-[11px] tabular-nums ${lowMargin ? "font-semibold text-alert" : "text-neutral-500"}`}>
            {r.price > 0 ? `GP ${formatPct(r.gp)} · MU ${formatPct(r.markup)}` : "Enter a cost"}
          </span>
        </button>
      )}
      {r.manual && !editing && (
        <button
          type="button"
          onClick={() => startTransition(() => setOverride(product.id, tier.id, null))}
          className="mt-0.5 flex items-center gap-1 px-2 text-[11px] text-neutral-500 hover:text-ink"
        >
          <RotateCcw className="size-3" /> Rule: {formatRand(r.rulePrice)}
        </button>
      )}
    </td>
  );
}
