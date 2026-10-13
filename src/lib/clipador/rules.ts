import type { Warning } from "./types";

/** Prêmio por posição no fim do mês (índice 0 = 1º lugar). Altere aqui para mudar a premiação. */
export const PRIZES = [2000, 1500, 1500, 1000, 1000, 500, 500] as const;

/** A cada N clipes removidos pela equipe, 1 advertência automática. */
export const REMOVALS_PER_WARNING = 3;
/** Quantas advertências ativas tiram o clipador da competição... */
export const WARNINGS_LIMIT = 3;
/** ...dentro de quantos meses... */
export const WARNING_WINDOW_MONTHS = 6;
/** ...e por quantos meses ele fica fora. */
export const SUSPENSION_MONTHS = 3;

/** Dia útil do mês seguinte até quando o prêmio é pago. */
export const PAYOUT_BUSINESS_DAY = 5;

export function prizeForPosition(position: number): number {
  return PRIZES[position - 1] ?? 0;
}

export function isWarningActive(w: Warning, now: Date = new Date()): boolean {
  if (w.annulled) return false;
  const limit = new Date(now);
  limit.setMonth(limit.getMonth() - WARNING_WINDOW_MONTHS);
  return new Date(w.createdAt) >= limit;
}

export function activeWarnings(warnings: Warning[], now: Date = new Date()): Warning[] {
  return warnings.filter((w) => isWarningActive(w, now));
}

/** Quantos clipes removidos faltam até a próxima advertência automática. */
export function removalsUntilNextWarning(removedAllTime: number): number {
  const rest = removedAllTime % REMOVALS_PER_WARNING;
  return REMOVALS_PER_WARNING - rest;
}

/** Dias que faltam para fechar o mês da competição (YYYY-MM). */
export function daysLeftInMonth(month: string, now: Date = new Date()): number {
  const [y, m] = month.split("-").map(Number);
  const end = new Date(y, m, 1); // 1º dia do mês seguinte, 00:00
  const ms = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}
