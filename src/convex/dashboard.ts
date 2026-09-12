import { query } from "./_generated/server";
import { requireProfessional } from "./professionals";
import { computeReturnPattern } from "./returnPattern";

/**
 * Everything the Painel needs in one query: headline stats, the list of
 * clients due to be contacted, and upcoming scheduled sessions.
 */
export const summary = query({
  args: {},
  handler: async (ctx) => {
    const professional = await requireProfessional(ctx);

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_professional", (q) =>
        q.eq("professionalId", professional._id),
      )
      .collect();
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_professional", (q) =>
        q.eq("professionalId", professional._id),
      )
      .collect();

    const clientById = new Map(clients.map((c) => [c._id, c]));
    const now = Date.now();
    const nowDate = new Date(now);
    const monthStart = new Date(
      nowDate.getFullYear(),
      nowDate.getMonth(),
      1,
    ).getTime();
    const monthEnd = new Date(
      nowDate.getFullYear(),
      nowDate.getMonth() + 1,
      1,
    ).getTime();
    const todayStart = new Date(
      nowDate.getFullYear(),
      nowDate.getMonth(),
      nowDate.getDate(),
    ).getTime();

    const realizedByClient = new Map<string, number[]>();
    let monthSessions = 0;
    let monthRevenue = 0;
    let monthReceived = 0;

    for (const session of sessions) {
      if (session.status !== "realizada") continue;
      const dates = realizedByClient.get(session.clientId) ?? [];
      dates.push(session.date);
      realizedByClient.set(session.clientId, dates);

      if (session.date >= monthStart && session.date < monthEnd) {
        monthSessions++;
        monthRevenue += session.price ?? 0;
        if (session.paid) monthReceived += session.price ?? 0;
      }
    }

    const clientsWithPattern = clients.map((client) => ({
      client,
      pattern: computeReturnPattern(
        realizedByClient.get(client._id) ?? [],
        now,
      ),
    }));

    const opportunities = clientsWithPattern
      .filter(
        (entry) =>
          entry.pattern.status === "atrasado" ||
          entry.pattern.status === "atencao",
      )
      .sort((a, b) => (b.pattern.daysOverdue ?? 0) - (a.pattern.daysOverdue ?? 0))
      .slice(0, 8)
      .map((entry) => ({
        clientId: entry.client._id,
        name: entry.client.name,
        phone: entry.client.phone,
        completedCount: entry.pattern.completedCount,
        avgIntervalDays: entry.pattern.avgIntervalDays,
        daysSinceLast: entry.pattern.daysSinceLast,
        daysOverdue: entry.pattern.daysOverdue,
        lastSessionAt: entry.pattern.lastSessionAt,
        status: entry.pattern.status,
      }));

    const overdueCount = clientsWithPattern.filter(
      (entry) => entry.pattern.status === "atrasado",
    ).length;

    const upcoming = sessions
      .filter(
        (session) =>
          session.status === "agendada" && session.date >= todayStart,
      )
      .sort((a, b) => a.date - b.date)
      .slice(0, 6)
      .map((session) => ({
        _id: session._id,
        clientId: session.clientId,
        clientName: clientById.get(session.clientId)?.name ?? "Cliente",
        date: session.date,
        serviceName: session.serviceName,
        price: session.price,
      }));

    return {
      stats: {
        clientsCount: clients.length,
        overdueCount,
        monthSessions,
        monthRevenue,
        monthReceived,
      },
      opportunities,
      upcoming,
    };
  },
});

/**
 * Everything the dedicated Retornos page needs: every client currently due
 * or overdue, without the Painel's top-8 cap.
 */
export const returns = query({
  args: {},
  handler: async (ctx) => {
    const professional = await requireProfessional(ctx);

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_professional", (q) =>
        q.eq("professionalId", professional._id),
      )
      .collect();
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_professional", (q) =>
        q.eq("professionalId", professional._id),
      )
      .collect();

    const realizedByClient = new Map<string, number[]>();
    for (const session of sessions) {
      if (session.status !== "realizada") continue;
      const dates = realizedByClient.get(session.clientId) ?? [];
      dates.push(session.date);
      realizedByClient.set(session.clientId, dates);
    }

    const now = Date.now();
    const opportunities = clients
      .map((client) => ({
        client,
        pattern: computeReturnPattern(
          realizedByClient.get(client._id) ?? [],
          now,
        ),
      }))
      .filter(
        (entry) =>
          entry.pattern.status === "atrasado" ||
          entry.pattern.status === "atencao",
      )
      .sort(
        (a, b) => (b.pattern.daysOverdue ?? 0) - (a.pattern.daysOverdue ?? 0),
      )
      .map((entry) => ({
        clientId: entry.client._id,
        name: entry.client.name,
        phone: entry.client.phone,
        completedCount: entry.pattern.completedCount,
        avgIntervalDays: entry.pattern.avgIntervalDays,
        daysSinceLast: entry.pattern.daysSinceLast,
        daysOverdue: entry.pattern.daysOverdue,
        lastSessionAt: entry.pattern.lastSessionAt,
        status: entry.pattern.status,
      }));

    return {
      clientsCount: clients.length,
      opportunities,
    };
  },
});
