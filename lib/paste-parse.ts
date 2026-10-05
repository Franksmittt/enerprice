export type ParsedRow = { code: string; description: string; cost: number; group: string };

const CODE = /^(?=[^\s]*\d)[0-9A-Z][0-9A-Z\-\/.]{3,}$/;
const TRAILING_PRICE = /(?:R\s?|\s{2,}|\t)(\d{1,3}(?:[ \u00a0,]\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*$/;

function parseAmount(raw: string) {
  const n = Number(raw.replace(/[R\s\u00a0,]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Parses rows pasted from Excel or copied out of a PDF:
 * `CODE <tab> Description <tab> Cost`. Lines without a code are treated as
 * either a section heading (no price) or a wrapped description continuing the
 * previous row, which is how the Enertec PDFs break long descriptions.
 */
export function parsePastedRows(text: string): ParsedRow[] {
  const rows: ParsedRow[] = [];
  let group = "";
  let open: ParsedRow | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+$/, "");
    if (!line.trim()) continue;

    const cells = line.includes("\t") ? line.split("\t").map((c) => c.trim()).filter(Boolean) : null;
    const first = (cells ? cells[0] : line.trim().split(/\s+/)[0]) ?? "";
    const isCode = CODE.test(first);

    let cost = NaN;
    let body = cells ? cells.slice(isCode ? 1 : 0).join(" ") : line.trim().slice(isCode ? first.length : 0).trim();
    if (cells && cells.length > 1) {
      const last = parseAmount(cells[cells.length - 1]);
      if (Number.isFinite(last) && last > 0) {
        cost = last;
        body = cells.slice(isCode ? 1 : 0, -1).join(" ");
      }
    } else {
      const m = line.match(TRAILING_PRICE);
      if (m) {
        cost = parseAmount(m[1]);
        body = line.slice(isCode ? line.indexOf(first) + first.length : 0, m.index).trim();
      }
    }

    if (isCode) {
      open = { code: first, description: body, cost, group };
      rows.push(open);
    } else if (open && !(open.cost > 0)) {
      open.description = `${open.description} ${body}`.trim();
      if (cost > 0) open.cost = cost;
    } else if (!(cost > 0) && body === body.toUpperCase() && /[A-Z]/.test(body)) {
      group = body.toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase());
      open = null;
    }
  }
  return rows;
}
