import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { TRIAL_DAYS } from "../lib/billing";

/** Returns the signed-in user's workspace, or null when none exists yet. */
export async function getMyProfessionalDoc(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"professionals"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db
    .query("professionals")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

/** Same, but throws when onboarding has not been completed. */
export async function requireProfessional(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"professionals">> {
  const professional = await getMyProfessionalDoc(ctx);
  if (!professional) {
    throw new Error("Complete a configuração inicial do seu espaço.");
  }
  return professional;
}

export const getMine = query({
  args: {},
  handler: async (ctx) => getMyProfessionalDoc(ctx),
});

/** Saves the onboarding step 1 fields, creating the workspace on first use. */
export const saveOnboarding = mutation({
  args: {
    businessName: v.string(),
    professionalName: v.string(),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Não autenticado.");

    const existing = await getMyProfessionalDoc(ctx);
    const patch = {
      businessName: args.businessName.trim(),
      professionalName: args.professionalName.trim(),
      city: args.city?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return await ctx.db.insert("professionals", {
      userId,
      ...patch,
      onboarded: false,
    });
  },
});

/** Marks onboarding as complete. */
export const finishOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const professional = await getMyProfessionalDoc(ctx);
    if (!professional) {
      throw new Error("Configure seu espaço antes de continuar.");
    }
    if (!professional.onboarded) {
      await ctx.db.patch(professional._id, { onboarded: true });
    }
    // Starts the 30-day free trial on first completion (keeps the original
    // date if onboarding is redone later).
    if (professional.trialEndsAt === undefined) {
      await ctx.db.patch(professional._id, {
        trialEndsAt: Date.now() + TRIAL_DAYS * 86_400_000,
      });
    }
    return professional._id;
  },
});

/** Updates business/professional info from the settings page. */
export const updateProfile = mutation({
  args: {
    businessName: v.string(),
    professionalName: v.string(),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const professional = await requireProfessional(ctx);
    await ctx.db.patch(professional._id, {
      businessName: args.businessName.trim(),
      professionalName: args.professionalName.trim(),
      city: args.city?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
    });
  },
});
