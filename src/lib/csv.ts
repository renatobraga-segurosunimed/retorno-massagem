import * as XLSX from "xlsx";

export interface CsvClientRow {
  name: string;
  phone?: string;
  email?: string;
}

export interface CsvParseResult {
  rows: CsvClientRow[];
  skipped: number;
}

const COLUMN_SYNONYMS = {
  name: ["nome", "name", "cliente", "paciente"],
  phone: ["telefone", "celular", "whats", "whatsapp", "tel", "fone", "phone"],
  email: ["email", "e-mail", "mail"],
};

/** Finds a column index by trying each synonym (substring match). */
function findColumn(cells: string[], needles: string[]): number {
  for (const needle of needles) {
    const index = cells.findIndex((cell) => cell.includes(needle));
    if (index >= 0) return index;
  }
  return -1;
}

interface ColumnMap {
  nameIdx: number;
  phoneIdx: number;
  emailIdx: number;
  startIndex: number;
}

/**
 * Detects whether the first row is a header (any cell mentions "nome") and
 * maps columns by header names, or falls back to the positional order
 * nome, telefone, email.
 */
function mapColumns(firstRow: string[]): ColumnMap {
  const lower = firstRow.map((cell) => cell.trim().toLowerCase());
  const hasHeader = lower.some((cell) => cell.includes("nome"));
  if (!hasHeader) {
    return { nameIdx: 0, phoneIdx: 1, emailIdx: 2, startIndex: 0 };
  }
  return {
    nameIdx: findColumn(lower, COLUMN_SYNONYMS.name),
    phoneIdx: findColumn(lower, COLUMN_SYNONYMS.phone),
    emailIdx: findColumn(lower, COLUMN_SYNONYMS.email),
    startIndex: 1,
  };
}

function rowsToClients(matrix: string[][]): CsvParseResult {
  if (matrix.length === 0) return { rows: [], skipped: 0 };
  const { nameIdx, phoneIdx, emailIdx, startIndex } = mapColumns(matrix[0]);

  const rows: CsvClientRow[] = [];
  let skipped = 0;

  for (const cells of matrix.slice(startIndex)) {
    const name = (cells[nameIdx >= 0 ? nameIdx : 0] ?? "").trim();
    if (!name) {
      skipped++;
      continue;
    }
    rows.push({
      name,
      phone: phoneIdx >= 0 ? cells[phoneIdx]?.trim() || undefined : undefined,
      email: emailIdx >= 0 ? cells[emailIdx]?.trim() || undefined : undefined,
    });
  }

  return { rows, skipped };
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

  const matrix = lines.map((line) =>
    line.split(sep).map((cell) => cell.trim().replace(/^"|"$/g, "")),
  );
  return rowsToClients(matrix);
}

/**
 * Parses a client import file: CSV/TXT (comma or semicolon separated) or
 * Excel spreadsheets (.xlsx / .xls, first sheet).
 */
export async function parseClientsFile(file: File): Promise<CsvParseResult> {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) return { rows: [], skipped: 0 };
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      blankrows: false,
      defval: "",
    });
    return rowsToClients(
      matrix.map((row) => row.map((cell) => String(cell ?? "").trim())),
    );
  }
  return parseClientsCsv(await file.text());
}

/** Downloads a ready-to-fill CSV model with the expected columns. */
export function downloadClientsTemplate(): void {
  const lines = [
    "nome,telefone,email",
    "Mariana Lima,(11) 99999-0000,mariana@email.com",
    "Paulo Souza,(11) 98888-0000,paulo@email.com",
    "Cláudia Ferreira,(21) 97777-0000,claudia@email.com",
  ];
  // BOM keeps accents intact when the file is opened in Excel.
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "modelo-clientes.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
