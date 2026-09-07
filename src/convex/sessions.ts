import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireProfessional } from "./professionals";

/** All sessions of the professional, newest first, with client names. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const professional = await requireProfessional(ctx);
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_professional", (q) =>
        q.eq("professionalId", professional._id),
      )
      .collect();
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_professional", (q) =>
        q.eq("professionalId", professional._id),
      )
      .collect();

    const clientInfo = new Map(
      clients.map((c) => [c._id, { name: c.name, phone: c.phone }]),
    );

    return sessions
      .map((session) => ({
        ...session,
        clientName: clientInfo.get(session.clientId)?.name ?? "Cliente",
        clientPhone: clientInfo.get(session.clientId)?.phone,
      }))
      .sort((a, b) => b.date - a.date);
  },
});

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    serviceId: v.optional(v.id("services")),
    date: v.number(),
    status: v.union(v.literal("agendada"), v.literal("realizada")),
    price: v.optional(v.number()),
    paid: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const professional = await requireProfessional(ctx);

    const client = await ctx.db.get(args.clientId);
    if (!client || client.professionalId !== professional._id) {
      throw new Error("Cliente não encontrado.");
    }

    let serviceName: string | undefined = undefined;
    if (args.serviceId) {
      const service = await ctx.db.get(args.serviceId);
      if (!service || service.professionalId !== professional._id) {
        throw new Error("Serviço não encontrado.");
      }
      serviceName = service.name;
    }

    return await ctx.db.insert("sessions", {
      professionalId: professional._id,
      clientId: args.clientId,
      serviceId: args.serviceId,
      serviceName,
      date: args.date,
      status: args.status,
      price: args.price,
      paid: args.status === "realizada" ? args.paid : undefined,
      notes: args.notes?.trim() || undefined,
    });
  },
});

/** Marks a scheduled session as completed. */
export const complete = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, { id }) => {
    const professional = await requireProfessional(ctx);
    const session = await ctx.db.get(id);
    if (!session || session.professionalId !== professional._id) {
      throw new Error("Sessão não encontrada.");
    }
    await ctx.db.patch(id, { status: "realizada" });
  },
});

/** Cancels a scheduled session. */
export const cancel = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, { id }) => {
    const professional = await requireProfessional(ctx);
    const session = await ctx.db.get(id);
    if (!session || session.professionalId !== professional._id) {
      throw new Error("Sessão não encontrada.");
    }
    await ctx.db.patch(id, { status: "cancelada", paid: undefined });
  },
});

/** Toggles the payment flag of a completed session. */
export const setPaid = mutation({
  args: { id: v.id("sessions"), paid: v.boolean() },
  handler: async (ctx, { id, paid }) => {
    const professional = await requireProfessional(ctx);
    const session = await ctx.db.get(id);
    if (!session || session.professionalId !== professional._id) {
      throw new Error("Sessão não encontrada.");
    }
    await ctx.db.patch(id, { paid });
  },
});

export const remove = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, { id }) => {
    const professional = await requireProfessional(ctx);
    const session = await ctx.db.get(id);
    if (!session || session.professionalId !== professional._id) {
      throw new Error("Sessão não encontrada.");
    }
    await ctx.db.delete(id);
  },
});
