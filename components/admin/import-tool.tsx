"use client";

import { useState, useTransition } from "react";
import { importProducts } from "@/app/actions";
import { formatRand } from "@/lib/format";
import { parsePastedRows } from "@/lib/paste-parse";
import type { Category } from "@/lib/types";

const SAMPLE = `GOLF CART BATTERIES
GC8-DEMO\tDeep Cycle Golf Cart Battery 8V 170Ah (sample)\t1850
GC12-DEMO\tDeep Cycle Golf Cart Battery 12V 150Ah (sample)\t2240
GC6-DEMO\tDeep Cycle Golf Cart Battery 6V 225Ah - flooded, for 36V / 48V
fleets (wrapped line, sample)\tR 1 640`;

const input = "rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-ink";

export function ImportTool({ categories, existingCodes }: { categories: Category[]; existingCodes: string[] }) {
  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [source, setSource] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const rows = parsePastedRows(text);
  const valid = rows.filter((r) => r.cost > 0);
  const existing = new Set(existingCodes);

  function runImport() {
    startTransition(async () => {
      const r = await importProducts(categoryId, source, valid);
      setResult(`${r.added} added, ${r.updated} updated. Every tier price has been recalculated.`);
      setText("");
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={`${input} mt-1 w-full`}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Source / list name</span>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Golf Cart Pricelist Oct 2026"
              className={`${input} mt-1 w-full`}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Paste rows: Item code · Description · Cost
          </span>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setResult(null);
            }}
            rows={14}
            placeholder="Copy the rows in Excel and paste here…"
            className={`${input} mt-1 w-full font-mono text-xs`}
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={pending || valid.length === 0}
            onClick={runImport}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {pending ? "Importing…" : `Import ${valid.length} product${valid.length === 1 ? "" : "s"}`}
          </button>
          <button type="button" onClick={() => setText(SAMPLE)} className="text-sm text-neutral-500 hover:text-ink">
            Load sample
          </button>
          {result && <span className="text-sm text-green-700">{result}</span>}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold">
          Preview <span className="font-normal text-neutral-500">· {rows.length} rows detected</span>
        </div>
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-neutral-500">
            Section headings become groups, and descriptions that spill onto the next line are joined back up.
          </p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.code}-${i}`} className="border-t border-neutral-100 first:border-0">
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-xs font-semibold">{r.code}</td>
                  <td className="px-4 py-2">
                    {r.description}
                    {r.group && <span className="block text-xs text-neutral-500">{r.group}</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums">
                    {r.cost > 0 ? formatRand(r.cost, true) : <span className="text-alert">No cost</span>}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        existing.has(r.code.toUpperCase()) ? "bg-neutral-100 text-neutral-600" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {existing.has(r.code.toUpperCase()) ? "Update" : "New"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
