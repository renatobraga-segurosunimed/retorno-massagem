import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { getMyProfessionalDoc } from "./professionals";
import { PLAN, TRIAL_DAYS, computeAccess, type PlanStatus } from "../lib/billing";

const DAY_MS = 86_400_000;

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Access status, plan and payment history for the signed-in professional.
 * Returns null when the user has no workspace yet. Never throws, so it can
 * also drive gates in the UI (paywall, admin nav).
 */
export const myAccess = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const isAdmin = Boolean(
      user?.email && adminEmails().includes(user.email.toLowerCase()),
    );

    const professional = await getMyProfessionalDoc(ctx);
    if (!professional) return null;

    const now = Date.now();
    const trialEndsAt =
      professional.trialEndsAt ?? professional._creationTime + TRIAL_DAYS * DAY_MS;
    const status: PlanStatus = computeAccess(professional, now);

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_professional", (q) =>
        q.eq("professionalId", professional._id),
      )
      .collect();
    payments.sort((a, b) => b.createdAt - a.createdAt);

    return {
      status,
      trialEndsAt,
      paidUntil: professional.paidUntil,
      plan: PLAN,
      isAdmin,
      payments: payments.slice(0, 12),
    };
  },
});

export const getPayment = internalQuery({
  args: { id: v.id("payments") },
  handler: async (ctx, { id }) => await ctx.db.get(id),
});

/** Creates the pending payment row (also used as the gateway reference). */
export const createPendingPayment = internalMutation({
  args: { professionalId: v.id("professionals") },
  handler: async (ctx, { professionalId }) => {
    const id = await ctx.db.insert("payments", {
      professionalId,
      amount: PLAN.priceCents,
      status: "pending",
      provider: "stripe",
      periodDays: PLAN.periodDays,
      createdAt: Date.now(),
    });
    await ctx.db.patch(id, { externalReference: id });
    return id;
  },
});

/** Confirms a payment and extends the professional's paid access. */
export const markPaid = internalMutation({
  args: {
    paymentId: v.id("payments"),
    providerPaymentId: v.optional(v.string()),
    method: v.union(
      v.literal("credit_card"),
      v.literal("pix"),
      v.literal("manual"),
      v.literal("outros"),
    ),
    paidAt: v.number(),
  },
  handler: async (ctx, { paymentId, providerPaymentId, method, paidAt }) => {
    const payment = await ctx.db.get(paymentId);
    if (!payment || payment.status === "paid") return;

    await ctx.db.patch(paymentId, {
      status: "paid",
      method,
      providerPaymentId,
      paidAt,
    });

    const professional = await ctx.db.get(payment.professionalId);
    if (!professional) return;
    const base = Math.max(paidAt, professional.paidUntil ?? 0);
    await ctx.db.patch(professional._id, {
      paidUntil: base + payment.periodDays * DAY_MS,
    });
  },
});
