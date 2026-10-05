import { existsSync, statSync } from "fs";
import path from "path";
import sharp from "sharp";
import type { NextRequest } from "next/server";
import { filterProducts, sectionsForExport } from "@/lib/catalog";
import { pricelistNotes } from "@/lib/format";
import { renderPricelistPdf } from "@/lib/pdf/pricelist-pdf";
import { filterCache } from "@/lib/search-params";
import type { Product } from "@/lib/types";
import { UPLOAD_DIR } from "@/lib/uploads";
import { getViewer } from "@/lib/viewer";
import { resolveWarranty, warrantyLabel } from "@/lib/warranty";

function photoFile(p: Product) {
  if (!p.image) return null;
  const file = p.image.startsWith("/media/")
    ? path.join(UPLOAD_DIR, path.basename(p.image))
    : path.join(process.cwd(), "public", p.image);
  return existsSync(file) ? file : null;
}

// 9 mm on paper; 120 px keeps it sharp in print without bloating the file.
const thumbs = new Map<string, Promise<Buffer>>();
function pdfThumb(file: string) {
  const key = `${file}:${statSync(file).mtimeMs}`;
  let thumb = thumbs.get(key);
  if (!thumb) {
    thumb = sharp(file).resize(120, 120, { fit: "contain", background: "#ffffff" }).jpeg({ quality: 70 }).toBuffer();
    thumbs.set(key, thumb);
  }
  return thumb;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const { q, brand, chem, v, tier: requested } = filterCache.parse(Object.fromEntries(params));
  const cats = params.getAll("cat").filter(Boolean);
  const { db, tier, customer } = await getViewer(requested);
  if (!tier) return new Response("Your account has not been approved yet.", { status: 403 });

  const products = filterProducts(db.products, q, "", { brand, chem, v });
  const sections = sectionsForExport(db.categories, products, cats);
  if (sections.length === 0) return new Response("Nothing matches that selection.", { status: 404 });

  const names = db.categories.filter((c) => cats.includes(c.id)).map((c) => c.name);
  const refinements = [q && `“${q}”`, brand, chem, v].filter(Boolean).join(" · ");
  const selection =
    (names.length === 0 ? "Complete pricelist" : names.length <= 2 ? names.join(" + ") : `${names.length} categories`) +
    (refinements ? ` · ${refinements}` : "");

  const listed = sections.flatMap((sec) => sec.products);
  const warranties = new Map<string, string>();
  for (const p of listed) {
    const w = resolveWarranty(p, db.warrantyRules);
    if (w) warranties.set(p.id, w.months === null ? "None" : warrantyLabel(w.months, true));
  }
  const photos = new Map<string, Buffer>();
  if (params.get("img") === "1") {
    await Promise.all(
      listed.map(async (p) => {
        const file = photoFile(p);
        if (file) photos.set(p.id, await pdfThumb(file));
      }),
    );
  }

  const pdf = await renderPricelistPdf({
    warranties,
    photos,
    sections,
    tier,
    vatRate: db.settings.vatRate,
    month: db.settings.priceListMonth,
    preparedFor: customer?.company ?? `${tier.name} preview`,
    accountNo: customer?.accountNo,
    selection,
    notes: pricelistNotes(db.settings),
    generatedAt: new Date(),
  });

  const slug = (names.length === 1 ? names[0] : names.length ? "Selection" : "Complete").replace(/[^A-Za-z0-9]+/g, "-");
  const who = (customer?.accountNo || tier.id).replace(/[^A-Za-z0-9]/g, "");
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Enertec-Pricelist-${slug}-${who}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
