const intFmt = new Intl.NumberFormat("pt-BR");
const compactFmt = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const brlFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brlShortFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const fmtInt = (n: number) => intFmt.format(n);
export const fmtCompact = (n: number) => compactFmt.format(n);
export const fmtBRL = (n: number) => brlFmt.format(n);
export const fmtBRLShort = (n: number) => brlShortFmt.format(n);

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** "2026-10" → "outubro" */
export function monthName(month: string): string {
  return MONTHS[Number(month.split("-")[1]) - 1];
}
/** "2026-10" → "outubro de 2026" */
export function monthLabel(month: string): string {
  return `${monthName(month)} de ${month.split("-")[0]}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** 13/10/2026 15:59 */
export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
/** 13/10 */
export function fmtDayMonth(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}
/** 15:59 */
export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "hoje às 12:00", "ontem às 12:00" ou "11/10 às 12:00" */
export function fmtRelativeDay(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const day = sameDay(d, now) ? "hoje" : sameDay(d, yesterday) ? "ontem" : fmtDayMonth(iso);
  return `${day} às ${fmtTime(iso)}`;
}

export function plural(n: number, one: string, many: string): string {
  return `${fmtInt(n)} ${n === 1 ? one : many}`;
}
