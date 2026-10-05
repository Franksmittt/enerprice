import { resetDemo } from "@/app/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ImportTool } from "@/components/admin/import-tool";
import { readDb } from "@/lib/db";

export default async function ImportPage() {
  const db = await readDb();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import pricelist</h1>
        <p className="max-w-3xl text-sm text-neutral-600">
          Paste straight from the existing Excel sheets. Existing item codes get their cost updated; new codes are added and
          flagged as new for customers. No more exporting 20 PDFs. Every customer’s price updates the moment you import.
        </p>
      </div>
      <ImportTool categories={db.categories} existingCodes={db.products.map((p) => p.code)} />
      <form action={resetDemo} className="border-t border-neutral-200 pt-6">
        <ConfirmButton
          message="Reset all products, prices, customers and warranty rules to the original October 2026 demo data? Every change made here will be lost."
          className="py-1.5 text-xs text-neutral-500 hover:text-alert"
        >
          Reset demo data to the original Oct 2026 list
        </ConfirmButton>
      </form>
    </div>
  );
}
