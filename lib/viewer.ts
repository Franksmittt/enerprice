import "server-only";
import { requireSession } from "./auth";
import { readDb } from "./db";
import type { Customer, Database, Tier } from "./types";

export type Viewer = {
  db: Database;
  tier: Tier | null;
  customer: Customer | null;
  isAdmin: boolean;
};

/** Resolves which tier's prices the current user may see. Admins can preview any tier. */
export async function getViewer(requestedTier = ""): Promise<Viewer> {
  const session = await requireSession();
  const db = await readDb();
  if (session.role === "admin") {
    const tier = db.tiers.find((t) => t.id === requestedTier) ?? db.tiers[0] ?? null;
    return { db, tier, customer: null, isAdmin: true };
  }
  const customer = session.user;
  const tier = customer.status === "active" ? (db.tiers.find((t) => t.id === customer.tierId) ?? null) : null;
  return { db, tier, customer, isAdmin: false };
}
