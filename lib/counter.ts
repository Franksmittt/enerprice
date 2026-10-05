import "server-only";
import { cookies } from "next/headers";

export const COUNTER_COOKIE = "enertec_counter";
export const DEFAULT_RETAIL_MARKUP = 35;

/**
 * Counter mode hides trade prices so the screen can be turned to the buyer's customer. It is a
 * per-device preference (the counter PC), so it lives in a cookie rather than on the account.
 * `margin` reveals the buyer's own cost, profit and GP under each retail price; `inclVat` picks
 * which retail price is shown and rounded.
 */
export type CounterMode = { markup: number; margin: boolean; inclVat: boolean } | null;

export function encodeCounter(mode: NonNullable<CounterMode>) {
  return new URLSearchParams({ markup: String(mode.markup), margin: mode.margin ? "1" : "0", vat: mode.inclVat ? "incl" : "excl" }).toString();
}

export async function getCounterMode(): Promise<CounterMode> {
  const raw = (await cookies()).get(COUNTER_COOKIE)?.value;
  if (!raw) return null;
  // Older cookies hold only the markup number.
  const params = new URLSearchParams(raw.includes("=") ? raw : `markup=${raw}`);
  const markup = Number(params.get("markup"));
  return {
    markup: Number.isFinite(markup) && markup >= 0 ? markup : DEFAULT_RETAIL_MARKUP,
    margin: params.get("margin") === "1",
    inclVat: params.get("vat") !== "excl",
  };
}
