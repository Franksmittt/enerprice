import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDb } from "./db";
import type { AdminUser, Customer } from "./types";

export const SESSION_COOKIE = "enertec_session";
export const SESSION_MAX_AGE = 60 * 60 * 12;

type Role = "admin" | "customer";
type Payload = { r: Role; id: string; iat: number };

function secret() {
  return process.env.SESSION_SECRET ?? "enertec-dev-only-secret-change-me";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(role: Role, id: string) {
  const payload = Buffer.from(JSON.stringify({ r: role, id, iat: Date.now() } satisfies Payload)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verify(token: string): Payload | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as Payload;
    return Date.now() - data.iat > SESSION_MAX_AGE * 1000 ? null : data;
  } catch {
    return null;
  }
}

export type Session = { role: "admin"; user: AdminUser } | { role: "customer"; user: Customer };

export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const data = token ? verify(token) : null;
  if (!data) return null;
  const db = await readDb();
  if (data.r === "admin") {
    const user = db.admins.find((a) => a.id === data.id);
    return user ? { role: "admin", user } : null;
  }
  const user = db.customers.find((c) => c.id === data.id);
  return user ? { role: "customer", user } : null;
});

export async function requireAdmin() {
  const session = await getSession();
  if (session?.role !== "admin") redirect("/");
  return session.user;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/");
  return session;
}
