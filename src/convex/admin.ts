import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { PLAN, TRIAL_DAYS, computeAccess } from "../lib/billing";

const DAY_MS = 86_400_000;

/**
 * E-mails allowed into the managerial area. Configure ADMIN_EMAILS in the
 * Convex environment (comma-separated, e.g. "owner@retorno.com,ti@retorno.com").
 */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<string> {
  const userId = await getAuthUserId(ctx);
  const user = userId ? await ctx.db.get(userId) : null;
  const email = user?.email?.toLowerCase();
  if (!email || !adminEmails().includes(email)) {
    throw new Error("Acesso restrito a administradores da plataforma.");
  }
  return email;
}

/** Whether the signed-in user belongs to the platform administration. */
export const isMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    const email = user?.email?.toLowerCase() ?? null;
    return { isAdmin: email !== null && adminEmails().includes(email) };
  },
});

/**
 * Full overview for the managerial dashboard: every account with its trial /
 * subscription status, plus the latest payments received.
 */
export const accounts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const professionals = await ctx.db.query("professionals").collect();
    const payments = await ctx.db.query("payments").collect();
    const clients = await ctx.db.query("clients").collect();
    const sessions = await ctx.db.query("sessions").collect();
    const notes = await ctx.db.query("clientNotes").collect();

    // Usage per account: how much of the system each professional is using.
    interface Usage {
      clientsCount: number;
      sessionsCount: number;
      realizedCount: number;
      scheduledCount: number;
      lastActivityAt: number;
    }
    const usage = new Map<string, Usage>();
    const touch = (professionalId: string, at: number) => {
      const entry =
        usage.get(professionalId) ??
        {
          clientsCount: 0,
          sessionsCount: 0,
          realizedCount: 0,
          scheduledCount: 0,
          lastActivityAt: 0,
        };
      entry.lastActivityAt = Math.max(entry.lastActivityAt, at);
      usage.set(professionalId, entry);
    };
    for (const client of clients) {
      const entry =
        usage.get(client.professionalId) ??
        ({
          clientsCount: 0,
          sessionsCount: 0,
          realizedCount: 0,
          scheduledCount: 0,
          lastActivityAt: 0,
        } satisfies Usage);
      entry.clientsCount++;
      entry.lastActivityAt = Math.max(entry.lastActivityAt, client.createdAt);
      usage.set(client.professionalId, entry);
    }
    for (const session of sessions) {
      const entry =
        usage.get(session.professionalId) ??
        ({
          clientsCount: 0,
          sessionsCount: 0,
          realizedCount: 0,
          scheduledCount: 0,
          lastActivityAt: 0,
        } satisfies Usage);
      entry.sessionsCount++;
      if (session.status === "realizada") entry.realizedCount++;
      if (session.status === "agendada") entry.scheduledCount++;
      entry.lastActivityAt = Math.max(entry.lastActivityAt, session._creationTime);
      usage.set(session.professionalId, entry);
    }
    for (const note of notes) {
      touch(note.professionalId, note.createdAt);
    }

    const emailByUser = new Map<string, string>();
    for (const professional of professionals) {
      const user = await ctx.db.get(professional.userId);
      if (user?.email) emailByUser.set(professional.userId, user.email);
    }

    const now = Date.now();
    const rows = professionals
      .map((professional) => ({
        _id: professional._id,
        businessName: professional.businessName,
        professionalName: professional.professionalName,
        city: professional.city,
        email: emailByUser.get(professional.userId) ?? "—",
        createdAt: professional._creationTime,
        trialEndsAt:
          professional.trialEndsAt ??
          professional._creationTime + TRIAL_DAYS * DAY_MS,
        paidUntil: professional.paidUntil,
        status: computeAccess(professional, now),
        usage:
          usage.get(professional._id) ??
          {
            clientsCount: 0,
            sessionsCount: 0,
            realizedCount: 0,
            scheduledCount: 0,
            lastActivityAt: 0,
          },
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    const paidPayments = payments.filter((payment) => payment.status === "paid");
    const paymentsRows = payments
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20)
      .map((payment) => ({
        _id: payment._id,
        professionalName:
          professionals.find(
            (professional) => professional._id === payment.professionalId,
          )?.professionalName ?? "—",
        businessName:
          professionals.find(
            (professional) => professional._id === payment.professionalId,
          )?.businessName ?? "—",
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
      }));

    return {
      rows,
      payments: paymentsRows,
      stats: {
        total: rows.length,
        trial: rows.filter((row) => row.status === "trial").length,
        active: rows.filter((row) => row.status === "active").length,
        expired: rows.filter((row) => row.status === "expired").length,
        revenueCents: paidPayments.reduce((sum, payment) => sum + payment.amount, 0),
        clientsCount: clients.length,
        sessionsCount: sessions.length,
        realizedSessionsCount: sessions.filter(
          (session) => session.status === "realizada",
        ).length,
        scheduledSessionsCount: sessions.filter(
          (session) => session.status === "agendada",
        ).length,
      },
    };
  },
});

/** Manually grants (or extends) paid access — e.g. for PIX transfers made outside the gateway. */
export const grantAccess = mutation({
  args: { professionalId: v.id("professionals"), days: v.optional(v.number()) },
  handler: async (ctx, { professionalId, days }) => {
    await requireAdmin(ctx);
    const professional = await ctx.db.get(professionalId);
    if (!professional) throw new Error("Conta não encontrada.");

    const now = Date.now();
    const periodDays = days ?? PLAN.periodDays;

    await ctx.db.insert("payments", {
      professionalId,
      amount: PLAN.priceCents,
      method: "manual",
      status: "paid",
      provider: "manual",
      periodDays,
      createdAt: now,
      paidAt: now,
    });

    const base = Math.max(now, professional.paidUntil ?? 0);
    const paidUntil = base + periodDays * DAY_MS;
    await ctx.db.patch(professionalId, { paidUntil });
    return paidUntil;
  },
});
