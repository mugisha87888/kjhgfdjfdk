import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles with premium status
  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    avatar: v.optional(v.string()),
    isPremium: v.boolean(),
    premiumExpiresAt: v.optional(v.number()),
    isAdmin: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Chat sessions
  chats: defineTable({
    userId: v.id("users"),
    title: v.string(),
    lastMessageAt: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Chat messages
  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.id("users"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    timestamp: v.number(),
  }).index("by_chat", ["chatId"]),

  // Premium approval requests
  premiumRequests: defineTable({
    userId: v.id("users"),
    email: v.string(),
    paymentMethod: v.union(v.literal("stripe"), v.literal("external")),
    paymentReference: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    requestedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // AI prompts and configurations
  aiPrompts: defineTable({
    name: v.string(),
    prompt: v.string(),
    isPremium: v.boolean(),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }),

  // Analytics and usage tracking
  analytics: defineTable({
    userId: v.id("users"),
    event: v.string(),
    metadata: v.optional(v.object({})),
    timestamp: v.number(),
  }).index("by_user", ["userId"])
    .index("by_event", ["event"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
