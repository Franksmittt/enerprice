import { updatePricelistSettings } from "@/app/actions";
import { TierEditor } from "@/components/admin/tier-editor";
import { categoryCounts } from "@/lib/catalog";
import { readDb } from "@/lib/db";

export default async function TiersPage() {
  const db = await readDb();
  const categories = categoryCounts(db.categories, db.products);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tiers & margins</h1>
        <p className="max-w-3xl text-sm text-neutral-600">
          Each wholesale customer is allocated one tier. A tier sets selling prices from Enertec’s cost using either a markup
          or a GP percentage, with optional different percentages per category. Manual prices on the costing grid always win.
        </p>
      </div>
      <div className="grid gap-5">
        {db.tiers.map((t) => (
          <TierEditor key={`${t.id}:${t.method}:${t.value}:${JSON.stringify(t.byCategory)}`} tier={t} categories={categories} />
        ))}
      </div>

      <form
        key={`${db.settings.priceListMonth}:${db.settings.pricelistNotes}`}
        action={updatePricelistSettings}
        className="rounded-lg border border-neutral-200 bg-white p-5"
      >
        <h2 className="font-bold">Pricelist wording</h2>
        <p className="text-sm text-neutral-600">Shown on the customer portal and printed on every PDF export.</p>
        <label className="mt-4 block text-sm font-medium">
          Pricelist month
          <input
            name="priceListMonth"
            defaultValue={db.settings.priceListMonth}
            className="mt-1 block w-60 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Notes and terms <span className="font-normal text-neutral-500">(one per line)</span>
          <textarea
            name="pricelistNotes"
            rows={4}
            defaultValue={db.settings.pricelistNotes ?? ""}
            className="mt-1 block w-full max-w-3xl rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <button className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black">Save wording</button>
      </form>
    </div>
  );
}
