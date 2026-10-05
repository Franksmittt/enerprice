import "server-only";
import { randomUUID } from "crypto";
import { mkdir, readFile, rename, rm, writeFile } from "fs/promises";
import path from "path";
import { DATA_DIR } from "./data-dir";
import {
  DEFAULT_PRICELIST_NOTES,
  DEFAULT_WARRANTY_TERMS,
  RETIRED_CATEGORIES,
  SEED_CATEGORIES,
  SEED_RANGES,
  SEED_VERSION,
  SEED_WARRANTY_RULES,
  buildSeed,
  imageFor,
  seedProducts,
} from "./seed";
import type { Database, Product } from "./types";

const DB_FILE = path.join(DATA_DIR, "db.json");

let queue: Promise<unknown> = Promise.resolve();

/** Runs tasks one at a time so concurrent requests can't interleave read-modify-write cycles. */
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);
  queue = run.catch(() => undefined);
  return run;
}

async function loadFile(): Promise<Database | null> {
  try {
    return JSON.parse(await readFile(DB_FILE, "utf8")) as Database;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

const isCurrent = (db: Database) => (db.settings.seedVersion ?? 1) >= SEED_VERSION;

/** Loads the database, seeding or migrating it first if needed. Only call from inside the queue. */
async function loadCurrent(): Promise<Database> {
  const db = await loadFile();
  if (!db) {
    const seed = buildSeed();
    await persist(seed);
    return seed;
  }
  if (!isCurrent(db)) {
    db.categories = SEED_CATEGORIES;
    db.products = mergeSeed(db.products)
      .map(retireCategories)
      .map((p) => (p.image ? p : { ...p, image: imageFor(p.code) }));
    db.warrantyRules ??= [];
    const known = new Set(db.warrantyRules.map((r) => r.id));
    db.warrantyRules.push(...SEED_WARRANTY_RULES.filter((r) => !known.has(r.id)));
    db.ranges ??= SEED_RANGES;
    db.settings.warrantyTerms ??= DEFAULT_WARRANTY_TERMS;
    for (const tier of db.tiers) {
      for (const id of Object.keys(RETIRED_CATEGORIES)) delete tier.byCategory[id];
    }
    db.settings.pricelistNotes ??= DEFAULT_PRICELIST_NOTES;
    db.settings.seedVersion = SEED_VERSION;
    await persist(db);
  }
  return db;
}

export async function readDb(): Promise<Database> {
  const db = await loadFile();
  if (db && isCurrent(db)) return db;
  return enqueue(loadCurrent);
}

/**
 * Adds newly seeded pricelists and refreshes spec data on seeded products, while keeping
 * Enertec's own edits (cost, manual prices) and anything imported or added in the portal.
 */
function mergeSeed(existing: Product[]): Product[] {
  const byCode = new Map(existing.map((p) => [p.code, p]));
  const matched = new Set<string>();
  const seeded = seedProducts().map((seed) => {
    // A seed alias lets a product's main code change without losing Enertec's cost and price edits.
    const current = [seed.code, ...(seed.aliases ?? [])].map((code) => byCode.get(code)).find(Boolean);
    if (current) matched.add(current.code);
    return current
      ? {
          ...current,
          code: seed.code,
          categoryId: seed.categoryId,
          description: seed.description,
          group: seed.group,
          brand: seed.brand,
          specs: seed.specs,
          alsoIn: seed.alsoIn,
          aliases: seed.aliases,
          discontinued: seed.discontinued,
        }
      : seed;
  });
  const seedCodes = new Set(seeded.map((p) => p.code));
  return [...seeded, ...existing.filter((p) => !seedCodes.has(p.code) && !matched.has(p.code))];
}

/** Moves products (including ones Enertec added or imported) out of folded-away categories. */
function retireCategories(p: Product): Product {
  const move = (id: string) => RETIRED_CATEGORIES[id] ?? id;
  const alsoIn = [...new Set((p.alsoIn ?? []).map(move))].filter((id) => id !== move(p.categoryId));
  return { ...p, categoryId: move(p.categoryId), alsoIn: alsoIn.length ? alsoIn : undefined };
}

/**
 * Writes to a uniquely named temp file then renames it over db.json, so a reader only ever
 * sees a complete file. A shared temp name let two concurrent writes interleave into invalid JSON.
 */
async function persist(db: Database) {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(db, null, 2));
  try {
    await renameWithRetry(tmp, DB_FILE);
  } catch (error) {
    await rm(tmp, { force: true });
    throw error;
  }
}

/** Windows refuses to replace a file another request has open for reading; that clears within milliseconds. */
async function renameWithRetry(from: string, to: string, attempts = 5) {
  for (let i = 1; ; i++) {
    try {
      return await rename(from, to);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (i >= attempts || (code !== "EPERM" && code !== "EBUSY")) throw error;
      await new Promise((resolve) => setTimeout(resolve, 20 * i));
    }
  }
}

export function updateDb<T>(mutate: (db: Database) => T | Promise<T>): Promise<T> {
  return enqueue(async () => {
    const db = await loadCurrent();
    const result = await mutate(db);
    await persist(db);
    return result;
  });
}

export async function resetDb() {
  await updateDb((db) => Object.assign(db, buildSeed()));
}
