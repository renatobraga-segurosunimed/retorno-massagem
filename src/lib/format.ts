import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value?: number | null): string {
  if (value === null || value === undefined) return "—";
  return brl.format(value);
}

export function formatDate(ts: number): string {
  return format(ts, "d MMM yyyy", { locale: ptBR });
}

export function formatDateTime(ts: number): string {
  return format(ts, "d MMM yyyy · HH:mm", { locale: ptBR });
}

export function formatWeekdayDateTime(ts: number): string {
  return format(ts, "EEE, d MMM · HH:mm", { locale: ptBR });
}

/** "hoje" / "há 3 dias" / "—" */
export function formatDaysAgo(days: number | null | undefined): string {
  if (days === null || days === undefined) return "—";
  if (days <= 0) return "hoje";
  if (days === 1) return "há 1 dia";
  return `há ${days} dias`;
}

/** WhatsApp deep link for Brazilian phones when possible. */
export function whatsappHref(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 12 && digits.startsWith("55")) {
    return `https://wa.me/${digits}`;
  }
  if (digits.length === 10 || digits.length === 11) {
    return `https://wa.me/55${digits}`;
  }
  return null;
}

export function telHref(phone?: string | null): string | null {
  if (!phone) return null;
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** yyyy-mm-dd in local time, for <input type="date"> */
export function toDateInputValue(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Combines date + time inputs into a timestamp. */
export function fromDateInputValue(date: string, time: string): number {
  return new Date(`${date}T${time || "09:00"}:00`).getTime();
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
