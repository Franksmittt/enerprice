import type { NextRequest } from "next/server";
import { filterProducts, sectionByCategory, specColumns } from "@/lib/catalog";
import { resolvePrice } from "@/lib/pricing";
import { filterCache } from "@/lib/search-params";
import { getViewer } from "@/lib/viewer";
import { resolveWarranty, warrantyLabel } from "@/lib/warranty";

const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

export async function GET(request: NextRequest) {
  const { q, cat, brand, chem, v, tier: requested } = filterCache.parse(Object.fromEntries(request.nextUrl.searchParams));
  const { db, tier, customer } = await getViewer(requested);
  if (!tier) return new Response("Your account has not been approved yet.", { status: 403 });

  const filtered = filterProducts(db.products, q, cat, { brand, chem, v });
  const specs = specColumns(filtered);
  const header = ["Category", "Group", "Item code", "Description", ...specs, "Warranty", "Status", "Price excl. VAT", "Price incl. VAT"];
  const lines = [header.map(cell).join(",")];
  for (const section of sectionByCategory(db.categories, filtered, cat)) {
    for (const p of section.products) {
      const price = resolvePrice(p, tier).price;
      const warranty = resolveWarranty(p, db.warrantyRules);
      lines.push(
        [
          section.name,
          p.group,
          p.code,
          p.description,
          ...specs.map((label) => p.specs?.[label] ?? ""),
          warranty ? warrantyLabel(warranty.months) : "",
          p.discontinued ? "Discontinued" : "",
          price > 0 ? price.toFixed(2) : "TBA",
          price > 0 ? (price * (1 + db.settings.vatRate)).toFixed(2) : "TBA",
        ]
          .map(cell)
          .join(","),
      );
    }
  }

  const who = (customer?.accountNo || tier.id).replace(/[^A-Za-z0-9]/g, "");
  return new Response(`\uFEFF${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="Enertec-Pricelist-${who}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
