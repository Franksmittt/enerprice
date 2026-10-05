"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { addProduct } from "@/app/actions";
import type { Category } from "@/lib/types";

const input = "rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-ink";

export function AddProduct({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(addProduct, undefined);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-2.5 text-sm font-semibold text-white hover:bg-black"
      >
        <Plus className="size-4" /> Add product
      </button>
    );
  }

  return (
    <form action={action} className="w-full rounded-lg border border-neutral-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_2fr_1fr_1fr_120px]">
        <input name="code" placeholder="Item code" required className={`${input} font-mono uppercase`} />
        <input name="description" placeholder="Description" required className={input} />
        <select name="categoryId" required className={input} defaultValue="">
          <option value="" disabled>
            Category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input name="group" placeholder="Group (e.g. Terminals)" className={input} />
        <input name="cost" placeholder="Cost R" inputMode="decimal" required className={input} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button disabled={pending} className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          {pending ? "Saving…" : "Save product"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500 hover:text-ink">
          Close
        </button>
        {state?.error && <span className="text-sm text-alert">{state.error}</span>}
        {state?.ok && <span className="text-sm text-green-700">{state.ok}</span>}
      </div>
    </form>
  );
}
