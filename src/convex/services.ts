import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireProfessional } from "./professionals";

const serviceFields = {
  name: v.string(),
  description: v.optional(v.string()),
  durationMin: v.optional(v.number()),
  price: v.optional(v.number()),
  active: v.boolean(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const professional = await requireProfessional(ctx);
    const services = await ctx.db
      .query("services")
      .withIndex("by_professional", (q) =>
        q.eq("professionalId", professional._id),
      )
      .collect();
    return services.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  },
});

export const create = mutation({
  args: serviceFields,
  handler: async (ctx, args) => {
    const professional = await requireProfessional(ctx);
    return await ctx.db.insert("services", {
      professionalId: professional._id,
      ...args,
      name: args.name.trim(),
    });
  },
});

export const update = mutation({
  args: { id: v.id("services"), ...serviceFields },
  handler: async (ctx, { id, ...patch }) => {
    const professional = await requireProfessional(ctx);
    const service = await ctx.db.get(id);
    if (!service || service.professionalId !== professional._id) {
      throw new Error("Serviço não encontrado.");
    }
    await ctx.db.patch(id, { ...patch, name: patch.name.trim() });
  },
});

export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    const professional = await requireProfessional(ctx);
    const service = await ctx.db.get(id);
    if (!service || service.professionalId !== professional._id) {
      throw new Error("Serviço não encontrado.");
    }
    await ctx.db.delete(id);
  },
});
