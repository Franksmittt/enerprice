import "server-only";
import path from "path";
import { DATA_DIR } from "./data-dir";

/** Photos uploaded in the back office. Outside public/, which is only served as it was at build time. */
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
