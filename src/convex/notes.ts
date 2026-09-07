import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireProfessional } from "./professionals";

/** Adds a note (comment) about a client. */
export const add = mutation({
  args: { clientId: v.id("clients"), text: v.string() },
  handler: async (ctx, { clientId, text }) => {
    const professional = await requireProfessional(ctx);
    const client = await ctx.db.get(clientId);
    if (!client || client.professionalId !== professional._id) {
      throw new Error("Cliente não encontrado.");
    }
    const trimmed = text.trim();
    if (!trimmed) throw new Error("A anotação não pode ficar vazia.");
    return await ctx.db.insert("clientNotes", {
      professionalId: professional._id,
      clientId,
      text: trimmed,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("clientNotes") },
  handler: async (ctx, { id }) => {
    const professional = await requireProfessional(ctx);
    const note = await ctx.db.get(id);
    if (!note || note.professionalId !== professional._id) {
      throw new Error("Anotação não encontrada.");
    }
    await ctx.db.delete(id);
  },
});
