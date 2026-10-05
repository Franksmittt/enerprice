import { readFile } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/uploads";

export async function GET(_: Request, ctx: RouteContext<"/media/[file]">) {
  const { file } = await ctx.params;
  if (!/^[a-z0-9-]+\.jpg$/.test(file)) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(body, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
