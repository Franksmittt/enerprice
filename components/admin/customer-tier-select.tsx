"use client";

import { useTransition } from "react";
import { setCustomerTier } from "@/app/actions";

export function CustomerTierSelect({
  customerId,
  tierId,
  tiers,
}: {
  customerId: string;
  tierId: string | null;
  tiers: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      value={tierId ?? ""}
      disabled={pending}
      aria-label="Pricing tier"
      onChange={(e) => startTransition(() => setCustomerTier(customerId, e.target.value))}
      className={`rounded-md border px-2 py-1.5 text-sm outline-none ${
        tierId ? "border-neutral-300 bg-white" : "border-alert bg-alert/10 font-semibold text-alert-dark"
      }`}
    >
      <option value="">{tierId ? "Suspend access" : "Allocate tier to approve…"}</option>
      {tiers.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
