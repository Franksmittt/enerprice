"use client";

import { useActionState } from "react";
import { addCustomer } from "@/app/actions";

const input = "rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-ink";

export function AddCustomer({ tiers }: { tiers: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(addCustomer, undefined);
  return (
    <form action={action} className="rounded-lg border border-neutral-200 bg-white p-5">
      <h2 className="font-semibold">Add a customer directly</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <input name="company" placeholder="Company" required className={input} />
        <input name="contact" placeholder="Contact person" className={input} />
        <input name="phone" placeholder="Phone" className={input} />
        <input name="email" type="email" placeholder="Login email" required className={input} />
        <input name="password" placeholder="Temporary password" required minLength={6} className={input} />
        <select name="tierId" required defaultValue="" aria-label="Pricing tier" className={input}>
          <option value="" disabled>
            Pricing tier
          </option>
          {tiers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button disabled={pending} className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          {pending ? "Saving…" : "Create login"}
        </button>
        {state?.error && <span className="text-sm text-alert">{state.error}</span>}
        {state?.ok && <span className="text-sm text-green-700">{state.ok}</span>}
      </div>
    </form>
  );
}
