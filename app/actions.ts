"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, requireAdmin, requireSession } from "@/lib/auth";
import { COUNTER_COOKIE, DEFAULT_RETAIL_MARKUP, encodeCounter } from "@/lib/counter";
import { readDb, resetDb, updateDb } from "@/lib/db";
import { slugify } from "@/lib/format";
import { hashPassword, verifyPassword } from "@/lib/password";
import { imageFor } from "@/lib/seed";
import type { MarginMethod, WarrantyRule } from "@/lib/types";
import { UPLOAD_DIR } from "@/lib/uploads";

export type FormState = { error?: string; ok?: string } | undefined;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

function toNumber(value: unknown) {
  const n = Number(String(value ?? "").replace(/[R\s,]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

async function startSession(role: "admin" | "customer", id: string) {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(role, id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").toLowerCase();
  const password = text(form, "password");
  const db = await readDb();

  const admin = db.admins.find((a) => a.email.toLowerCase() === email);
  if (admin && verifyPassword(password, admin.passwordHash)) {
    await startSession("admin", admin.id);
    redirect("/admin");
  }
  const customer = db.customers.find((c) => c.email.toLowerCase() === email);
  if (customer && verifyPassword(password, customer.passwordHash)) {
    await startSession("customer", customer.id);
    redirect("/portal");
  }
  return { error: "That email and password don't match an account." };
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}

export async function register(_: FormState, form: FormData): Promise<FormState> {
  const company = text(form, "company");
  const contact = text(form, "contact");
  const email = text(form, "email").toLowerCase();
  const phone = text(form, "phone");
  const password = text(form, "password");
  if (!company || !contact || !email || password.length < 6) {
    return { error: "Fill in every field. Passwords need at least 6 characters." };
  }
  const id = await updateDb((db) => {
    if (db.customers.some((c) => c.email.toLowerCase() === email) || db.admins.some((a) => a.email === email)) return null;
    const id = `cus_${Date.now().toString(36)}`;
    db.customers.push({
      id,
      accountNo: "",
      company,
      contact,
      email,
      phone,
      passwordHash: hashPassword(password),
      tierId: null,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    return id;
  });
  if (!id) return { error: "An account with that email already exists." };
  await startSession("customer", id);
  revalidatePath("/admin", "layout");
  redirect("/portal");
}

/* ---------- Counter mode ---------- */

export async function setCounterMode(form: FormData) {
  await requireSession();
  const jar = await cookies();
  if (text(form, "mode") === "off") {
    jar.delete(COUNTER_COOKIE);
  } else {
    const markup = toNumber(form.get("markup"));
    const value = encodeCounter({
      markup: markup >= 0 && markup <= 500 ? markup : DEFAULT_RETAIL_MARKUP,
      margin: text(form, "margin") === "1",
      inclVat: text(form, "vat") !== "excl",
    });
    jar.set(COUNTER_COOKIE, value, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  revalidatePath("/portal", "layout");
}

/* ---------- Back office ---------- */

/** Blank means "use the warranty rules"; "none" means the product carries no warranty. */
function parseMonths(raw: string): number | null | undefined {
  if (raw === "") return undefined;
  if (/^(none|no|0)$/i.test(raw)) return null;
  const n = toNumber(raw);
  return Number.isInteger(n) && n > 0 && n <= 600 ? n : undefined;
}

function ruleFrom(form: FormData, id: string): WarrantyRule | null {
  const months = parseMonths(text(form, "months"));
  const validFrom = text(form, "validFrom");
  if (months === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(validFrom)) return null;
  return {
    id,
    brand: text(form, "brand"),
    chem: text(form, "chem"),
    categoryId: text(form, "categoryId"),
    match: text(form, "match"),
    months,
    conditions: text(form, "conditions"),
    note: text(form, "note"),
    validFrom,
  };
}

export async function saveWarrantyRule(form: FormData) {
  await requireAdmin();
  const id = text(form, "id") || `w${Date.now().toString(36)}`;
  const rule = ruleFrom(form, id);
  if (!rule) return;
  await updateDb((db) => {
    const i = db.warrantyRules.findIndex((r) => r.id === id);
    if (i === -1) db.warrantyRules.push(rule);
    else db.warrantyRules[i] = rule;
  });
  revalidatePath("/", "layout");
}

export async function deleteWarrantyRule(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  await updateDb((db) => {
    db.warrantyRules = db.warrantyRules.filter((r) => r.id !== id);
  });
  revalidatePath("/", "layout");
}

export async function setProductWarranty(form: FormData) {
  await requireAdmin();
  const code = text(form, "code").toUpperCase();
  const months = parseMonths(text(form, "months"));
  const clear = text(form, "clear") === "1";
  await updateDb((db) => {
    const p = db.products.find((x) => x.code === code);
    if (!p) return;
    if (clear || months === undefined) delete p.warranty;
    else p.warranty = { months, conditions: text(form, "conditions") };
    p.updatedAt = new Date().toISOString();
  });
  revalidatePath("/", "layout");
}

export async function setProductImage(form: FormData) {
  await requireAdmin();
  const code = text(form, "code").toUpperCase();
  const file = form.get("photo");
  let image: string | undefined;
  if (text(form, "websitePhoto") === "1") {
    image = imageFor(code);
  } else if (file instanceof File && file.size > 0 && file.size < 14_000_000) {
    const jpg = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    const name = `${slugify(code)}-${Date.now().toString(36)}.jpg`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, name), jpg);
    image = `/media/${name}`;
  } else {
    return;
  }
  await updateDb((db) => {
    const p = db.products.find((x) => x.code === code);
    if (!p) return;
    p.image = image;
    p.updatedAt = new Date().toISOString();
  });
  revalidatePath("/", "layout");
}

export async function saveRanges(form: FormData) {
  await requireAdmin();
  await updateDb((db) => {
    for (const r of db.ranges) {
      const headline = text(form, `headline_${r.id}`);
      if (headline) r.headline = headline;
      r.points = String(form.get(`points_${r.id}`) ?? r.points).replace(/\r\n/g, "\n").trim();
    }
  });
  revalidatePath("/", "layout");
}

export async function saveWarrantyTerms(form: FormData) {
  await requireAdmin();
  const terms = String(form.get("warrantyTerms") ?? "").replace(/\r\n/g, "\n").trim();
  await updateDb((db) => {
    db.settings.warrantyTerms = terms;
  });
  revalidatePath("/", "layout");
}

export async function updatePricelistSettings(form: FormData) {
  await requireAdmin();
  const month = text(form, "priceListMonth");
  const notes = String(form.get("pricelistNotes") ?? "").replace(/\r\n/g, "\n").trim();
  await updateDb((db) => {
    if (month) db.settings.priceListMonth = month;
    db.settings.pricelistNotes = notes;
  });
  revalidatePath("/", "layout");
}

export async function updateCost(productId: string, cost: number) {
  await requireAdmin();
  if (!Number.isFinite(cost) || cost < 0) return;
  await updateDb((db) => {
    const p = db.products.find((x) => x.id === productId);
    if (!p) return;
    p.cost = Math.round(cost * 100) / 100;
    p.updatedAt = new Date().toISOString();
  });
  revalidatePath("/", "layout");
}

/** Pass `null` to clear the manual price and fall back to the tier rule. */
export async function setOverride(productId: string, tierId: string, price: number | null) {
  await requireAdmin();
  await updateDb((db) => {
    const p = db.products.find((x) => x.id === productId);
    if (!p) return;
    if (price === null || !Number.isFinite(price) || price <= 0) delete p.overrides[tierId];
    else p.overrides[tierId] = Math.round(price * 100) / 100;
    p.updatedAt = new Date().toISOString();
  });
  revalidatePath("/", "layout");
}

export async function addProduct(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const code = text(form, "code").toUpperCase();
  const description = text(form, "description");
  const categoryId = text(form, "categoryId");
  const group = text(form, "group") || "General";
  const cost = toNumber(form.get("cost"));
  if (!code || !description || !categoryId || !(cost > 0)) return { error: "Code, description, category and cost are required." };
  const added = await updateDb((db) => {
    if (db.products.some((p) => p.code === code)) return false;
    db.products.push({
      id: slugify(code),
      code,
      description,
      categoryId,
      group,
      cost,
      overrides: {},
      source: "Added in portal",
      isNew: true,
      updatedAt: new Date().toISOString(),
    });
    return true;
  });
  if (!added) return { error: `${code} already exists.` };
  revalidatePath("/", "layout");
  return { ok: `${code} added.` };
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await updateDb((db) => {
    db.products = db.products.filter((p) => p.id !== productId);
  });
  revalidatePath("/", "layout");
}

export async function saveTier(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const tierId = text(form, "tierId");
  const method = text(form, "method") as MarginMethod;
  const value = toNumber(form.get("value"));
  if (method !== "markup" && method !== "gp") return { error: "Pick GP or markup." };
  if (!(value >= 0) || (method === "gp" && value >= 95)) return { error: "Enter a valid percentage (GP must be below 95%)." };
  await updateDb((db) => {
    const tier = db.tiers.find((t) => t.id === tierId);
    if (!tier) return;
    tier.name = text(form, "name") || tier.name;
    tier.description = text(form, "description");
    tier.method = method;
    tier.value = value;
    tier.byCategory = {};
    for (const c of db.categories) {
      const raw = String(form.get(`cat_${c.id}`) ?? "").trim();
      const n = toNumber(raw);
      if (raw !== "" && n >= 0) tier.byCategory[c.id] = n;
    }
  });
  revalidatePath("/", "layout");
  return { ok: "Tier saved. Prices updated everywhere." };
}

export async function setCustomerTier(customerId: string, tierId: string) {
  await requireAdmin();
  await updateDb((db) => {
    const c = db.customers.find((x) => x.id === customerId);
    if (!c) return;
    c.tierId = tierId || null;
    c.status = tierId ? "active" : "pending";
    if (tierId && !c.accountNo) {
      const letters = c.company.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X");
      c.accountNo = `${letters}${String(db.customers.length).padStart(3, "0")}`;
    }
  });
  revalidatePath("/", "layout");
}

export async function addCustomer(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const company = text(form, "company");
  const email = text(form, "email").toLowerCase();
  const password = text(form, "password");
  const tierId = text(form, "tierId");
  if (!company || !email || password.length < 6 || !tierId) {
    return { error: "Company, email, tier and a 6+ character password are required." };
  }
  const added = await updateDb((db) => {
    if (db.customers.some((c) => c.email.toLowerCase() === email)) return false;
    const letters = company.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X");
    db.customers.push({
      id: `cus_${Date.now().toString(36)}`,
      accountNo: `${letters}${String(db.customers.length + 1).padStart(3, "0")}`,
      company,
      contact: text(form, "contact"),
      email,
      phone: text(form, "phone"),
      passwordHash: hashPassword(password),
      tierId,
      status: "active",
      createdAt: new Date().toISOString(),
    });
    return true;
  });
  if (!added) return { error: "A customer with that email already exists." };
  revalidatePath("/", "layout");
  return { ok: `${company} can now log in.` };
}

export type ImportRow = { code: string; description: string; cost: number; group: string };

export async function importProducts(categoryId: string, source: string, rows: ImportRow[]) {
  await requireAdmin();
  const result = await updateDb((db) => {
    let added = 0;
    let updated = 0;
    const now = new Date().toISOString();
    for (const row of rows) {
      const code = row.code.trim().toUpperCase();
      if (!code || !(row.cost > 0)) continue;
      const existing = db.products.find((p) => p.code === code);
      if (existing) {
        existing.cost = row.cost;
        if (row.description) existing.description = row.description;
        if (row.group) existing.group = row.group;
        existing.categoryId = categoryId;
        existing.updatedAt = now;
        updated++;
      } else {
        db.products.push({
          id: slugify(code),
          code,
          description: row.description || code,
          categoryId,
          group: row.group || "General",
          cost: row.cost,
          overrides: {},
          source: source || "Excel import",
          isNew: true,
          updatedAt: now,
        });
        added++;
      }
    }
    return { added, updated };
  });
  revalidatePath("/", "layout");
  return result;
}

export async function resetDemo() {
  await requireAdmin();
  await resetDb();
  revalidatePath("/", "layout");
}
