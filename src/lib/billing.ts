/** Shared billing constants + helpers (pure, used by Convex and the UI). */

const DAY_MS = 86_400_000;

export const TRIAL_DAYS = 30;

export const PLAN = {
  name: "Plano Profissional",
  priceCents: 4990,
  periodDays: 30,
  description: "Acesso completo ao Retorno Massagem por 30 dias",
} as const;

export type PlanStatus = "trial" | "active" | "expired";

/**
 * Access status of a workspace:
 * - "active"  → paid period still running (paidUntil in the future)
 * - "trial"   → within the 30-day free trial
 * - "expired" → trial over and no valid payment
 *
 * Works for legacy accounts too: when trialEndsAt is missing, the trial is
 * counted from the professional document's creation time.
 */
export function computeAccess(
  professional: {
    trialEndsAt?: number;
    paidUntil?: number;
    _creationTime: number;
  },
  now: number,
): PlanStatus {
  if (professional.paidUntil && professional.paidUntil > now) return "active";
  const trialEndsAt =
    professional.trialEndsAt ?? professional._creationTime + TRIAL_DAYS * DAY_MS;
  return now < trialEndsAt ? "trial" : "expired";
}

/** Whole days remaining until the given timestamp (0 when in the past). */
export function daysLeft(until: number | undefined, now: number): number {
  if (until === undefined) return 0;
  return Math.max(0, Math.ceil((until - now) / DAY_MS));
}
