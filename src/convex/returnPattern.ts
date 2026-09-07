/**
 * Pure helpers that analyze a client's completed sessions and derive their
 * return pattern — the core of the product.
 *
 * "realizada" sessions ordered by date → average interval between visits →
 * expected return date → how overdue the client is right now.
 */

const DAY_MS = 86_400_000;

export type ReturnStatus = "novo" | "em_dia" | "atencao" | "atrasado";

export interface ReturnPattern {
  /** Number of completed sessions. */
  completedCount: number;
  /** Average days between completed sessions, or null with fewer than 2. */
  avgIntervalDays: number | null;
  /** Timestamp of the last completed session. */
  lastSessionAt: number | null;
  /** When the client is expected back, based on their average interval. */
  expectedReturnAt: number | null;
  /** Days since the last completed session. */
  daysSinceLast: number | null;
  /** Positive when the client is past their expected return date. */
  daysOverdue: number | null;
  /** Derived classification used across the UI. */
  status: ReturnStatus;
}

export function computeReturnPattern(
  realizedDates: number[],
  now: number,
): ReturnPattern {
  const dates = [...realizedDates].sort((a, b) => a - b);
  const lastSessionAt = dates.length > 0 ? dates[dates.length - 1] : null;

  if (dates.length < 2 || lastSessionAt === null) {
    return {
      completedCount: dates.length,
      avgIntervalDays: null,
      lastSessionAt,
      expectedReturnAt: null,
      daysSinceLast:
        lastSessionAt !== null
          ? Math.floor((now - lastSessionAt) / DAY_MS)
          : null,
      daysOverdue: null,
      status: "novo",
    };
  }

  let totalInterval = 0;
  for (let i = 1; i < dates.length; i++) {
    totalInterval += dates[i] - dates[i - 1];
  }
  const avgIntervalDays = Math.round(
    totalInterval / (dates.length - 1) / DAY_MS,
  );
  const expectedReturnAt = lastSessionAt + avgIntervalDays * DAY_MS;
  const daysSinceLast = Math.floor((now - lastSessionAt) / DAY_MS);
  const daysOverdue = Math.floor((now - expectedReturnAt) / DAY_MS);

  const status: ReturnStatus =
    daysOverdue <= 0 ? "em_dia" : daysOverdue <= 7 ? "atencao" : "atrasado";

  return {
    completedCount: dates.length,
    avgIntervalDays,
    lastSessionAt,
    expectedReturnAt,
    daysSinceLast,
    daysOverdue,
    status,
  };
}
