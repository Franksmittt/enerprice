// Matches product photos on enertec.co.za (and Battery Powerzone, which sells under the same item
// codes) to portal products, and saves them to public/products as 800px JPEGs on white.
// Usage: node scripts/fetch-images.mjs   → writes lib/product-images.json (item code → /products/<file>)
// Safe to re-run: products that already have a photo are skipped.
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SITE = "https://enertec.co.za";
const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public", "products");
const mapFile = path.join(root, "lib", "product-images.json");

async function get(url, as) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return as === "buffer" ? Buffer.from(await res.arrayBuffer()) : await res.text();
      if (res.status === 404) return null;
    } catch {}
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  return null;
}
const text = (url) => get(url, "text");

async function pool(items, size, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}

const toJpeg = (input) =>
  sharp(input).resize(800, 800, { fit: "inside", withoutEnlargement: true }).flatten({ background: "#ffffff" }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();

const fileFor = (code) => `${code.toLowerCase().replace(/[^a-z0-9-]/g, "-")}.jpg`;

const db = JSON.parse(await readFile(path.join(root, "data", "db.json"), "utf8"));
const key = (c) => c.toUpperCase().replace(/[^A-Z0-9]/g, "");
const codes = new Map();
for (const p of db.products) for (const c of [p.code, ...(p.aliases ?? [])]) codes.set(key(c), p.code);
const productFor = (c) => codes.get(key(c));

await mkdir(outDir, { recursive: true });
const previous = existsSync(mapFile) ? JSON.parse(await readFile(mapFile, "utf8")) : {};
const map = {};
for (const [code, src] of Object.entries(previous)) {
  const file = path.join(root, "public", src);
  if (!existsSync(file)) continue;
  const jpg = fileFor(code);
  const meta = await sharp(file).metadata();
  if (path.basename(file) === jpg && meta.format === "jpeg" && meta.width <= 800 && meta.height <= 800) {
    map[code] = src;
    continue;
  }
  await writeFile(path.join(outDir, jpg), await toJpeg(await readFile(file)));
  if (path.basename(file) !== jpg) await unlink(file);
  map[code] = `/products/${jpg}`;
}

async function save(productCode, url) {
  if (!productCode || map[productCode]) return false;
  map[productCode] = "pending";
  const body = await get(url, "buffer");
  if (!body) return void delete map[productCode];
  const file = fileFor(productCode);
  await writeFile(path.join(outDir, file), await toJpeg(body));
  map[productCode] = `/products/${file}`;
  return true;
}

const links = new Set();
for (let pg = 1; pg < 60; pg++) {
  const html = await text(`${SITE}/products/${pg > 1 ? `?pg=${pg}` : ""}`);
  if (!html) break;
  const before = links.size;
  for (const m of html.matchAll(/href="(https:\/\/enertec\.co\.za\/products\/[^"]+\.html)"/g)) links.add(m[1]);
  if (links.size === before) break;
}

const pages = (
  await pool([...links], 8, async (url) => {
    const html = await text(url);
    const code = html?.match(/id="ppvc-r-code">\s*<p>\s*([^<]+?)\s*<\/p>/)?.[1];
    const image = html?.match(/src="(https:\/\/enertec\.co\.za\/couch\/uploads\/image\/[^"]+)"/)?.[1];
    return code && image ? { code, image } : null;
  })
).filter(Boolean);
const fromSite = (await pool(pages, 3, (p) => save(productFor(p.code), encodeURI(decodeURI(p.image))))).filter(Boolean).length;

const shop = [];
for (let page = 1; page < 20; page++) {
  const body = await text(`https://batterypowerzone.co.za/products.json?limit=250&page=${page}`);
  const products = body ? JSON.parse(body).products : [];
  if (!products.length) break;
  shop.push(...products);
}
const fromShop = (
  await pool(shop, 3, (sp) => {
    const image = sp.images?.[0]?.src;
    const sku = sp.variants?.map((v) => v.sku).find((s) => s && productFor(s));
    return image && sku ? save(productFor(sku), `${image}${image.includes("?") ? "&" : "?"}width=800`) : false;
  })
).filter(Boolean).length;

const keep = new Set(Object.values(map).map((src) => path.basename(src)));
for (const f of await readdir(outDir)) if (!keep.has(f)) await unlink(path.join(outDir, f));

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(mapFile, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`${links.size} enertec.co.za pages · ${shop.length} Battery Powerzone products`);
console.log(`New photos: ${fromSite} from enertec.co.za, ${fromShop} from Battery Powerzone`);
console.log(`${Object.keys(sorted).length} of ${db.products.length} products have a photo`);
