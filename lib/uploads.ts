import "server-only";
import path from "path";

/** Photos uploaded in the back office. Outside public/, which is only served as it was at build time. */
export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
