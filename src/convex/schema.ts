import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Workspace of each professional (one per authenticated user).
    professionals: defineTable({
      userId: v.id("users"),
      businessName: v.string(),
      professionalName: v.string(),
      city: v.optional(v.string()),
      phone: v.optional(v.string()),
      onboarded: v.boolean(),
    }).index("by_user", ["userId"]),

    // Service catalog offered by the professional.
    services: defineTable({
      professionalId: v.id("professionals"),
      name: v.string(),
      description: v.optional(v.string()),
      durationMin: v.optional(v.number()),
      price: v.optional(v.number()),
      active: v.boolean(),
    }).index("by_professional", ["professionalId"]),

    // Clients of the professional.
    clients: defineTable({
      professionalId: v.id("professionals"),
      name: v.string(),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_professional", ["professionalId"]),

    // Sessions: scheduled (agendada) or completed (realizada) appointments.
    sessions: defineTable({
      professionalId: v.id("professionals"),
      clientId: v.id("clients"),
      serviceId: v.optional(v.id("services")),
      serviceName: v.optional(v.string()),
      date: v.number(), // session date/time (ms)
      status: v.union(
        v.literal("agendada"),
        v.literal("realizada"),
        v.literal("cancelada"),
      ),
      price: v.optional(v.number()),
      paid: v.optional(v.boolean()),
      notes: v.optional(v.string()),
    })
      .index("by_professional", ["professionalId"])
      .index("by_client", ["clientId"]),

    // Free-form notes / contact comments about a client.
    clientNotes: defineTable({
      professionalId: v.id("professionals"),
      clientId: v.id("clients"),
      text: v.string(),
      createdAt: v.number(),
    }).index("by_client", ["clientId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
