import Link from "next/link";
import { AddCustomer } from "@/components/admin/add-customer";
import { CustomerTierSelect } from "@/components/admin/customer-tier-select";
import { readDb } from "@/lib/db";
import { serializeFilters } from "@/lib/search-params";

export default async function CustomersPage() {
  const db = await readDb();
  const tiers = db.tiers.map((t) => ({ id: t.id, name: t.name }));
  const customers = [...db.customers].sort(
    (a, b) => Number(a.status === "active") - Number(b.status === "active") || a.company.localeCompare(b.company),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-neutral-600">
          New sign-ups wait here until you allocate a tier. Changing a tier changes what that customer sees immediately.
        </p>
      </div>

      <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white md:hidden">
        {customers.map((c) => (
          <li key={c.id} className="space-y-3 p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{c.company}</p>
                <p className="font-mono text-xs text-neutral-500">{c.accountNo || "No account number yet"}</p>
              </div>
              <StatusBadge active={c.status === "active"} />
            </div>
            <p className="min-w-0">
              {c.contact}
              <span className="block truncate text-xs text-neutral-500">{c.email}</span>
              {c.phone && <span className="block text-xs text-neutral-500">{c.phone}</span>}
            </p>
            <div className="flex items-center justify-between gap-3">
              <CustomerTierSelect customerId={c.id} tierId={c.tierId} tiers={tiers} />
              {c.tierId && (
                <Link href={`/portal${serializeFilters({ tier: c.tierId })}`} className="shrink-0 py-2 text-xs font-semibold text-brand hover:underline">
                  Preview prices
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-neutral-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-ink text-left text-xs uppercase tracking-wider text-white">
            <tr>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pricing tier</th>
              <th className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-mono text-xs">{c.accountNo || "—"}</td>
                <td className="px-4 py-3 font-semibold">{c.company}</td>
                <td className="px-4 py-3">
                  {c.contact}
                  <span className="block text-xs text-neutral-500">
                    {c.email}
                    {c.phone && ` · ${c.phone}`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge active={c.status === "active"} />
                </td>
                <td className="px-4 py-3">
                  <CustomerTierSelect customerId={c.id} tierId={c.tierId} tiers={tiers} />
                </td>
                <td className="px-4 py-3 text-right">
                  {c.tierId && (
                    <Link href={`/portal${serializeFilters({ tier: c.tierId })}`} className="text-xs font-semibold text-brand hover:underline">
                      Preview their prices
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddCustomer tiers={tiers} />
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${
        active ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {active ? "Active" : "Awaiting approval"}
    </span>
  );
}
