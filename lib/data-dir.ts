import "server-only";
import { tmpdir } from "os";
import path from "path";

/**
 * Serverless hosts like Vercel only allow writes under the OS temp folder, and that storage is
 * per-instance and wiped on cold starts, so edits there are demo-only until a real database is wired in.
 */
export const DATA_DIR =
  process.env.DATA_DIR ?? (process.env.VERCEL ? path.join(tmpdir(), "enertec-data") : path.join(process.cwd(), "data"));
