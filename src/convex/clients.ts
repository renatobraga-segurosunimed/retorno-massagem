import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireProfessional } from "./professionals";
import { computeReturnPattern } from "./returnPattern";

const clientFields = {
  name: v.string(),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  notes: v.optional(v.string()),
};

/** All clients with their computed return pattern (for the list page). */
export const list = query({
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
      if (session.status === "realizada") {
        const dates = realizedByClient.get(session.clientId) ?? [];
        dates.push(session.date);
        realizedByClient.set(session.clientId, dates);
      }
    }

    const now = Date.now();
    return clients
      .map((client) => ({
        ...client,
        pattern: computeReturnPattern(
          realizedByClient.get(client._id) ?? [],
          now,
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  },
});

/** Full detail of one client: info, sessions, notes and pattern. */
export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, { id }) => {
    const professional = await requireProfessional(ctx);
    const client = await ctx.db.get(id);
    if (!client || client.professionalId !== professional._id) return null;

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_client", (q) => q.eq("clientId", id))
      .collect();
    const notes = await ctx.db
      .query("clientNotes")
      .withIndex("by_client", (q) => q.eq("clientId", id))
      .collect();

    sessions.sort((a, b) => b.date - a.date);
    notes.sort((a, b) => b.createdAt - a.createdAt);

    const realizedDates = sessions
      .filter((s) => s.status === "realizada")
      .map((s) => s.date);

    return {
      client,
      sessions,
      notes,
      pattern: computeReturnPattern(realizedDates, Date.now()),
    };
  },
});

export const create = mutation({
  args: clientFields,
  handler: async (ctx, args) => {
    const professional = await requireProfessional(ctx);
    return await ctx.db.insert("clients", {
      professionalId: professional._id,
      ...args,
      name: args.name.trim(),
      createdAt: Date.now(),
    });
  },
});

/** Bulk import from CSV parsing done on the client. */
export const importRows = mutation({
  args: {
    rows: v.array(
      v.object({
        name: v.string(),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { rows }) => {
    const professional = await requireProfessional(ctx);
    const now = Date.now();
    let imported = 0;
    for (const row of rows) {
      const name = row.name.trim();
      if (!name) continue;
      await ctx.db.insert("clients", {
        professionalId: professional._id,
        name,
        phone: row.phone?.trim() || undefined,
        email: row.email?.trim() || undefined,
        createdAt: now,
      });
      imported++;
    }
    return imported;
  },
});

export const update = mutation({
  args: { id: v.id("clients"), ...clientFields },
  handler: async (ctx, { id, ...patch }) => {
    const professional = await requireProfessional(ctx);
    const client = await ctx.db.get(id);
    if (!client || client.professionalId !== professional._id) {
      throw new Error("Cliente não encontrado.");
    }
    await ctx.db.patch(id, { ...patch, name: patch.name.trim() });
  },
});

export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, { id }) => {
    const professional = await requireProfessional(ctx);
    const client = await ctx.db.get(id);
    if (!client || client.professionalId !== professional._id) {
      throw new Error("Cliente não encontrado.");
    }
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_client", (q) => q.eq("clientId", id))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
    const notes = await ctx.db
      .query("clientNotes")
      .withIndex("by_client", (q) => q.eq("clientId", id))
      .collect();
    for (const note of notes) {
      await ctx.db.delete(note._id);
    }
    await ctx.db.delete(id);
  },
});
