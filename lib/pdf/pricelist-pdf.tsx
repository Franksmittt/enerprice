import "server-only";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import path from "path";
import { Document, Image as PdfImage, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { keySpecs, sizeOf } from "@/lib/catalog";
import { formatRand } from "@/lib/format";
import { resolvePrice } from "@/lib/pricing";
import type { Product, Tier } from "@/lib/types";

export type PdfSection = { id: string; name: string; products: Product[] };

export type PdfInput = {
  sections: PdfSection[];
  tier: Tier;
  vatRate: number;
  month: string;
  /** Who the list was generated for; printed on every page and as the watermark. */
  preparedFor: string;
  accountNo?: string;
  selection: string;
  notes: string[];
  generatedAt: Date;
  /** Short warranty label per product id, e.g. "30 mo". */
  warranties: Map<string, string>;
  /** JPEG bytes per product id; empty when photos weren't asked for. */
  photos: Map<string, Buffer>;
};

// Enertec Batteries palette (enertec.co.za).
const BLUE = "#1C6697";
const BLUE_LIGHT = "#4683AD";
const RED = "#CF1F3A";
const GREY = "#414042";
const INK = "#262626";
const MUTED = "#6B6B6B";
const RULE = "#E2E2E2";

const LOGO = { data: readFileSync(path.join(process.cwd(), "public/brand/enertec-logo-dark.png")), format: "png" as const };

function Stripe({ height }: { height: string }) {
  return (
    <View style={{ flexDirection: "row", height, marginHorizontal: "-15mm" }}>
      {[BLUE_LIGHT, RED, GREY].map((color) => (
        <View key={color} style={{ flex: 1, backgroundColor: color }} />
      ))}
    </View>
  );
}

// A4 is 210 × 297 mm; 15 mm side margins leave 180 mm for the table.
const W = { photo: "12mm", code: "32mm", size: "15mm", specs: "43mm", warranty: "17mm", ex: "20mm", inc: "22mm" };

const s = StyleSheet.create({
  page: { paddingTop: "22mm", paddingBottom: "18mm", paddingHorizontal: "15mm", fontFamily: "Helvetica", fontSize: 7.5, color: INK },
  header: { position: "absolute", top: "9mm", left: "15mm", right: "15mm", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 0.75, borderBottomColor: INK, paddingBottom: 3 },
  brand: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  headerRight: { fontSize: 7, color: MUTED, textAlign: "right" },
  footer: { position: "absolute", bottom: "8mm", left: "15mm", right: "15mm", flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.5, borderTopColor: RULE, paddingTop: 3, fontSize: 6.5, color: MUTED },
  watermark: { position: "absolute", top: "140mm", left: "-10mm", width: "230mm", textAlign: "center", fontSize: 26, fontFamily: "Helvetica-Bold", color: INK, opacity: 0.05, transform: "rotate(-35deg)" },
  sectionTitle: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 2, borderBottomColor: BLUE, paddingBottom: 3, marginBottom: 8 },
  sectionName: { fontFamily: "Helvetica-Bold", fontSize: 14 },
  groupTitle: { fontFamily: "Helvetica-Bold", fontSize: 8.5, marginBottom: 2 },
  thead: { flexDirection: "row", borderBottomWidth: 0.75, borderBottomColor: INK, paddingVertical: 2.5, fontSize: 6, color: MUTED, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.3 },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: RULE, paddingVertical: 3 },
  cell: { paddingRight: 5 },
  code: { fontFamily: "Courier-Bold", fontSize: 7 },
  tag: { fontSize: 5.5, fontFamily: "Helvetica-Bold", marginTop: 1.5, letterSpacing: 0.3 },
  right: { textAlign: "right" },
  muted: { color: MUTED },
});

/** One page run per category, so each knows its own running head and page count. */
function SectionPages({
  input,
  section,
  onPageCount,
  children,
}: {
  input: PdfInput;
  section: PdfSection;
  onPageCount?: (pages: number) => void;
  children: React.ReactNode;
}) {
  const date = input.generatedAt.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
  return (
    <Page size="A4" orientation="portrait" style={s.page} wrap>
      <View style={s.header} fixed>
        <View style={s.brand}>
          <PdfImage src={LOGO} style={{ height: "6mm", width: "30mm" }} />
          <Text style={{ fontSize: 7, color: MUTED, paddingBottom: 0.5 }}>Trade pricelist · {input.month}</Text>
        </View>
        <Text
          style={s.headerRight}
          render={({ subPageTotalPages }) => {
            onPageCount?.(subPageTotalPages);
            return section.name;
          }}
        />
      </View>
      <Text style={s.watermark} fixed>
        {input.preparedFor} · {date}
      </Text>
      {children}
      <View style={s.footer} fixed>
        <Text>
          Prepared for {input.preparedFor}
          {input.accountNo ? ` (${input.accountNo})` : ""} · {input.tier.name} · {date} · Prices excl. VAT unless marked incl. · E&OE
        </Text>
        <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
      </View>
    </Page>
  );
}

function Cover({ input, starts }: { input: PdfInput; starts: Map<string, number> }) {
  const date = input.generatedAt.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
  const total = input.sections.reduce((n, sec) => n + sec.products.length, 0);
  return (
    <Page size="A4" orientation="portrait" style={{ ...s.page, paddingTop: "0mm" }}>
      <Stripe height="4mm" />
      <PdfImage src={LOGO} style={{ marginTop: "26mm", height: "13mm", width: "65mm" }} />
      <Text style={{ marginTop: "16mm", fontSize: 9, color: BLUE, fontFamily: "Helvetica-Bold", letterSpacing: 1.5 }}>
        {input.month.toUpperCase()} TRADE PRICELIST
      </Text>
      <Text style={{ marginTop: 6, fontSize: 26, fontFamily: "Helvetica-Bold" }}>{input.selection}</Text>
      <Text style={{ marginTop: 4, fontSize: 10, color: MUTED }}>{total} products · prices in rand, excl. VAT</Text>

      <View style={{ marginTop: "14mm", flexDirection: "row", gap: "10mm" }}>
        {[
          ["Prepared for", input.preparedFor + (input.accountNo ? ` · ${input.accountNo}` : "")],
          ["Pricing", input.tier.name],
          ["Generated", date],
        ].map(([label, value]) => (
          <View key={label}>
            <Text style={{ fontSize: 7, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</Text>
            <Text style={{ marginTop: 2, fontSize: 10, fontFamily: "Helvetica-Bold" }}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: "14mm" }}>
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, borderBottomWidth: 0.75, borderBottomColor: INK, paddingBottom: 3 }}>Contents</Text>
        {input.sections.map((sec) => (
          <View key={sec.id} style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: RULE, paddingVertical: 4, fontSize: 9 }}>
            <Text style={{ flex: 1 }}>{sec.name}</Text>
            <Text style={{ width: "30mm", color: MUTED, textAlign: "right" }}>{sec.products.length} products</Text>
            <Text style={{ width: "18mm", textAlign: "right", fontFamily: "Helvetica-Bold" }}>{starts.get(sec.id) ?? ""}</Text>
          </View>
        ))}
      </View>

      <View style={{ position: "absolute", bottom: "14mm", left: "15mm", right: "15mm", borderTopWidth: 0.5, borderTopColor: RULE, paddingTop: 5 }}>
        <Text style={{ fontSize: 7, color: MUTED, marginBottom: 2 }}>
          Confidential trade pricing for {input.preparedFor}. Not for redistribution.
        </Text>
        {input.notes.map((n) => (
          <Text key={n} style={{ fontSize: 7, color: MUTED, marginBottom: 1 }}>
            {n}
          </Text>
        ))}
      </View>
    </Page>
  );
}

function byGroup(products: Product[]) {
  const groups = new Map<string, Product[]>();
  for (const p of products) groups.set(p.group, [...(groups.get(p.group) ?? []), p]);
  return [...groups];
}

function GroupTable({ group, products, input }: { group: string; products: Product[]; input: PdfInput }) {
  const { tier, vatRate, warranties, photos } = input;
  const showSize = products.some(sizeOf);
  const showDescription = products.some((p) => !p.specs || !sizeOf(p));
  const showSpecs = products.some((p) => p.specs);
  const showWarranty = products.some((p) => warranties.has(p.id));
  const showPhoto = photos.size > 0;
  const flexCol = { flex: 1 };
  const specsCol = showDescription ? { width: W.specs } : flexCol;

  return (
    <>
      {/* Keeps a group's heading with its first rows: if less than this much room is left, the
          spacer and the group after it move to the next page. */}
      <View style={{ height: 8 }} minPresenceAhead={60} />
      <View>
        <View fixed>
          <Text style={s.groupTitle}>{group}</Text>
          <View style={s.thead}>
            {showPhoto && <Text style={{ width: W.photo }} />}
            <Text style={{ ...s.cell, width: W.code }}>Item code</Text>
            {showSize && <Text style={{ ...s.cell, width: W.size }}>Size</Text>}
            {showDescription && <Text style={{ ...s.cell, ...flexCol }}>Product</Text>}
            {showSpecs && <Text style={{ ...s.cell, ...specsCol }}>Key specs</Text>}
            {showWarranty && <Text style={{ ...s.cell, width: W.warranty }}>Warranty</Text>}
            <Text style={{ width: W.ex, ...s.right }}>Excl. VAT</Text>
            <Text style={{ width: W.inc, ...s.right }}>Incl. VAT</Text>
          </View>
        </View>
      {products.map((p) => {
        const price = resolvePrice(p, tier).price;
        const { primary, fitment } = keySpecs(p);
        const tone = p.discontinued ? s.muted : {};
        return (
          <View key={p.id} style={{ ...s.row, ...tone }} wrap={false}>
            {showPhoto && (
              <View style={{ width: W.photo, paddingRight: 4 }}>
                {photos.get(p.id) ? <PdfImage src={{ data: photos.get(p.id)!, format: "jpg" }} style={{ width: "9mm", height: "9mm", objectFit: "contain" }} /> : null}
              </View>
            )}
            <View style={{ ...s.cell, width: W.code }}>
              <Text style={s.code}>{p.code}</Text>
              {p.isNew && <Text style={{ ...s.tag, color: RED }}>NEW</Text>}
              {p.discontinued && <Text style={{ ...s.tag, color: MUTED }}>WHILE STOCKS LAST</Text>}
            </View>
            {showSize && <Text style={{ ...s.cell, width: W.size, fontFamily: "Helvetica-Bold" }}>{sizeOf(p) ?? ""}</Text>}
            {showDescription && <Text style={{ ...s.cell, ...flexCol }}>{p.specs && sizeOf(p) ? "" : p.description}</Text>}
            {showSpecs && (
              <View style={{ ...s.cell, ...specsCol }}>
                {primary ? <Text>{primary}</Text> : null}
                {fitment ? <Text style={{ color: MUTED, fontSize: 6.5, marginTop: 1 }}>{fitment}</Text> : null}
              </View>
            )}
            {showWarranty && <Text style={{ ...s.cell, width: W.warranty }}>{warranties.get(p.id) ?? ""}</Text>}
            {price > 0 ? (
              <>
                <Text style={{ width: W.ex, ...s.right, fontFamily: "Helvetica-Bold" }}>{formatRand(price)}</Text>
                <Text style={{ width: W.inc, ...s.right, color: MUTED }}>{formatRand(price * (1 + vatRate), true)}</Text>
              </>
            ) : (
              <Text style={{ width: `${20 + 22}mm`, ...s.right, color: MUTED }}>Price TBA</Text>
            )}
          </View>
        );
      })}
      </View>
    </>
  );
}

function PricelistDocument({
  input,
  sectionStarts,
  onPageCount,
}: {
  input: PdfInput;
  sectionStarts: Map<string, number>;
  onPageCount?: (id: string, pages: number) => void;
}) {
  return (
    <Document title={`Enertec pricelist · ${input.selection}`} author="Enertec" subject={`${input.month} trade pricelist`}>
      <Cover input={input} starts={sectionStarts} />
      {input.sections.map((sec) => (
        <SectionPages key={sec.id} input={input} section={sec} onPageCount={(n) => onPageCount?.(sec.id, n)}>
          <View style={s.sectionTitle}>
            <Text style={s.sectionName}>{sec.name}</Text>
            <Text style={{ fontSize: 8, color: MUTED }}>{sec.products.length} products</Text>
          </View>
          {byGroup(sec.products).map(([group, items]) => (
            <GroupTable key={group} group={group} products={items} input={input} />
          ))}
        </SectionPages>
      ))}
    </Document>
  );
}

/** Everything that decides how many pages a category runs to; prices and names don't change row heights. */
function layoutKey(input: PdfInput) {
  const rows = input.sections.map((sec) => [
    sec.id,
    sec.products.map((p) => [p.code, p.group, p.description, p.specs, p.isNew, p.discontinued, input.warranties.get(p.id), input.photos.has(p.id)]),
  ]);
  return createHash("sha1").update(JSON.stringify([rows, input.photos.size > 0])).digest("base64url");
}

const pageCountCache = new Map<string, Map<string, number>>();

async function countPages(input: PdfInput) {
  const key = layoutKey(input);
  const cached = pageCountCache.get(key);
  if (cached) return cached;
  const pageCounts = new Map<string, number>();
  await renderToBuffer(
    <PricelistDocument input={input} sectionStarts={new Map()} onPageCount={(id, n) => pageCounts.set(id, n)} />,
  );
  if (pageCountCache.size >= 100) pageCountCache.delete(pageCountCache.keys().next().value!);
  pageCountCache.set(key, pageCounts);
  return pageCounts;
}

/**
 * The contents lists each category's start page (the cover is page 1). With several categories
 * that needs a counting pass first; its result is cached per layout so repeat downloads render once.
 */
export async function renderPricelistPdf(input: PdfInput) {
  const pageCounts = input.sections.length > 1 ? await countPages(input) : new Map<string, number>();
  const starts = new Map<string, number>();
  let next = 2;
  for (const sec of input.sections) {
    starts.set(sec.id, next);
    next += pageCounts.get(sec.id) ?? 1;
  }
  return renderToBuffer(<PricelistDocument input={input} sectionStarts={starts} />);
}
