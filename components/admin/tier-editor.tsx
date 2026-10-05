"use client";

import { useActionState, useState } from "react";
import { saveTier } from "@/app/actions";
import { formatPct, formatRand } from "@/lib/format";
import { gpOf, markupOf, priceFromCost } from "@/lib/pricing";
import type { Category, MarginMethod, Tier } from "@/lib/types";

const EXAMPLE_COST = 50;
const input = "rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-ink";

export function TierEditor({ tier, categories }: { tier: Tier; categories: (Category & { count: number })[] }) {
  const [state, action, pending] = useActionState(saveTier, undefined);
  const [method, setMethod] = useState<MarginMethod>(tier.method);
  const [value, setValue] = useState(String(tier.value));
  const pct = Number(value) || 0;
  const example = priceFromCost(EXAMPLE_COST, method, pct);

  return (
    <form action={action} className="rounded-lg border border-neutral-200 bg-white p-5">
      <input type="hidden" name="tierId" value={tier.id} />
      <input type="hidden" name="method" value={method} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Tier name</span>
          <input name="name" defaultValue={tier.name} className={`${input} mt-1 w-full font-semibold`} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Who it’s for</span>
          <input name="description" defaultValue={tier.description} className={`${input} mt-1 w-full`} />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Price on</span>
          <div className="mt-1 flex rounded-md border border-neutral-300 p-0.5">
            {(["markup", "gp"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`rounded px-3 py-1.5 text-sm font-medium ${method === m ? "bg-ink text-white" : "text-neutral-600"}`}
              >
                {m === "markup" ? "Markup on cost" : "Gross profit (GP)"}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Default %</span>
          <input
            name="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
            className={`${input} mt-1 block w-28 tabular-nums`}
          />
        </label>
        <p className="rounded-md bg-neutral-100 px-3 py-2 text-sm tabular-nums">
          Cost {formatRand(EXAMPLE_COST)} → <strong>{formatRand(example)}</strong>
          <span className="text-neutral-600">
            {" "}
            (GP {formatPct(gpOf(example, EXAMPLE_COST))} · MU {formatPct(markupOf(example, EXAMPLE_COST))})
          </span>
        </p>
      </div>

      <details className="mt-5">
        <summary className="cursor-pointer text-sm font-medium text-neutral-700">
          Different % per category ({Object.keys(tier.byCategory).length} set)
        </summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((c) => (
            <label key={c.id} className="block">
              <span className="text-xs text-neutral-600">
                {c.name} <span className="text-neutral-500">({c.count})</span>
              </span>
              <input
                name={`cat_${c.id}`}
                defaultValue={tier.byCategory[c.id] ?? ""}
                placeholder={`${pct}`}
                inputMode="decimal"
                className={`${input} mt-0.5 w-full tabular-nums`}
              />
            </label>
          ))}
        </div>
      </details>

      <div className="mt-5 flex items-center gap-3">
        <button disabled={pending} className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          {pending ? "Saving…" : "Save tier"}
        </button>
        {state?.error && <span className="text-sm text-alert">{state.error}</span>}
        {state?.ok && <span className="text-sm text-green-700">{state.ok}</span>}
      </div>
    </form>
  );
}
