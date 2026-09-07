export interface CsvClientRow {
  name: string;
  phone?: string;
  email?: string;
}

export interface CsvParseResult {
  rows: CsvClientRow[];
  skipped: number;
}

/**
 * Minimal CSV parsing for client imports. Supports comma or semicolon
 * separators and an optional header row (detected by the word "nome").
 */
export function parseClientsCsv(text: string): CsvParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return { rows: [], skipped: 0 };

  const firstLine = lines[0];
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  const sep = semicolons > commas ? ";" : ",";

  let nameIdx = 0;
  let phoneIdx = 1;
  let emailIdx = 2;
  let startIndex = 0;

  if (firstLine.toLowerCase().includes("nome")) {
    const cols = firstLine.split(sep).map((c) => c.trim().toLowerCase());
    const find = (...needles: string[]) => {
      for (const needle of needles) {
        const idx = cols.findIndex((c) => c.includes(needle));
        if (idx >= 0) return idx;
      }
      return -1;
    };
    nameIdx = find("nome", "name", "cliente");
    phoneIdx = find("telefone", "celular", "whats", "tel", "fone", "phone");
    emailIdx = find("email", "e-mail");
    startIndex = 1;
  }

  const rows: CsvClientRow[] = [];
  let skipped = 0;

  for (const line of lines.slice(startIndex)) {
    const cols = line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    const name = cols[nameIdx >= 0 ? nameIdx : 0] ?? "";
    if (!name) {
      skipped++;
      continue;
    }
    rows.push({
      name,
      phone: phoneIdx >= 0 ? cols[phoneIdx] || undefined : undefined,
      email: emailIdx >= 0 ? cols[emailIdx] || undefined : undefined,
    });
  }

  return { rows, skipped };
}
