import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const requestPremium = mutation({
  args: {
    paymentMethod: v.union(v.literal("stripe"), v.literal("external")),
    paymentReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Check if there's already a pending request
    const existingRequest = await ctx.db
      .query("premiumRequests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingRequest) {
      throw new Error("You already have a pending premium request");
    }

    return await ctx.db.insert("premiumRequests", {
      userId,
      email: user.email || "",
      paymentMethod: args.paymentMethod,
      paymentReference: args.paymentReference,
      status: "pending",
      requestedAt: Date.now(),
    });
  },
});

export const getUserPremiumRequest = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("premiumRequests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
  },
});

// Admin functions
export const getAllPremiumRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile?.isAdmin) throw new Error("Admin access required");

    const requests = await ctx.db
      .query("premiumRequests")
      .order("desc")
      .collect();

    // Get user details for each request
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const user = await ctx.db.get(request.userId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", request.userId))
          .unique();
        
        return {
          ...request,
          user: {
            name: user?.name || profile?.displayName || "Unknown",
            email: user?.email || "",
          },
        };
      })
    );

    return requestsWithUsers;
  },
});

export const approvePremiumRequest = mutation({
  args: {
    requestId: v.id("premiumRequests"),
    expiresAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", adminUserId))
      .unique();

    if (!adminProfile?.isAdmin) throw new Error("Admin access required");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    if (request.status !== "pending") {
      throw new Error("Request has already been processed");
    }

    // Update the request
    await ctx.db.patch(args.requestId, {
      status: "approved",
      reviewedAt: Date.now(),
      reviewedBy: adminUserId,
      notes: args.notes,
    });

    // Update user's premium status
    const userProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", request.userId))
      .unique();

    if (userProfile) {
      await ctx.db.patch(userProfile._id, {
        isPremium: true,
        premiumExpiresAt: args.expiresAt,
      });
    }
  },
});

export const rejectPremiumRequest = mutation({
  args: {
    requestId: v.id("premiumRequests"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", adminUserId))
      .unique();

    if (!adminProfile?.isAdmin) throw new Error("Admin access required");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    if (request.status !== "pending") {
      throw new Error("Request has already been processed");
    }

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      reviewedAt: Date.now(),
      reviewedBy: adminUserId,
      notes: args.notes,
    });
  },
});

export const revokePremium = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", adminUserId))
      .unique();

    if (!adminProfile?.isAdmin) throw new Error("Admin access required");

    const userProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!userProfile) throw new Error("User profile not found");

    await ctx.db.patch(userProfile._id, {
      isPremium: false,
      premiumExpiresAt: undefined,
    });
  },
});
