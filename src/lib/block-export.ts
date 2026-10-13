// Turn a kanban, timeline, or table into text you can paste into a doc or spreadsheet.

type Data = Record<string, unknown>;

const cell = (v: unknown) => String(v ?? "").replace(/\r?\n/g, " ");

function grid(type: string, d: Data): string[][] | null {
  if (type === "table") {
    return [(d.headers as string[]) ?? [], ...((d.rows as string[][]) ?? [])];
  }
  if (type === "timeline") {
    return [["Date", "Milestone"], ...((d.items as { date: string; text: string }[]) ?? []).map((i) => [i.date, i.text])];
  }
  if (type === "kanban") {
    const cols = (d.columns as { title: string; cards: { text: string }[] }[]) ?? [];
    const height = Math.max(0, ...cols.map((c) => c.cards.length));
    return [cols.map((c) => c.title), ...Array.from({ length: height }, (_, r) => cols.map((c) => c.cards[r]?.text ?? ""))];
  }
  return null;
}

export const canExport = (type: string) => ["table", "timeline", "kanban"].includes(type);

export function toMarkdown(type: string, d: Data): string {
  const rows = grid(type, d);
  if (!rows || !rows[0]?.length) return "";
  const line = (r: string[]) => `| ${r.map((c) => cell(c).replace(/\|/g, "\\|")).join(" | ")} |`;
  return [line(rows[0]), line(rows[0].map(() => "---")), ...rows.slice(1).map(line)].join("\n");
}

export function toCsv(type: string, d: Data): string {
  const rows = grid(type, d);
  if (!rows) return "";
  const q = (c: string) => (/[",\n]/.test(cell(c)) ? `"${cell(c).replace(/"/g, '""')}"` : cell(c));
  return rows.map((r) => r.map(q).join(",")).join("\n");
}
