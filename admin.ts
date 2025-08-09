import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile?.isAdmin) throw new Error("Admin access required");

    const profiles = await ctx.db.query("profiles").collect();
    
    const usersWithDetails = await Promise.all(
      profiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        const messageCount = await ctx.db
          .query("messages")
          .filter((q) => q.eq(q.field("userId"), profile.userId))
          .collect()
          .then(messages => messages.length);

        return {
          ...profile,
          user: {
            name: user?.name || profile.displayName || "Unknown",
            email: user?.email || "",
          },
          messageCount,
        };
      })
    );

    return usersWithDetails;
  },
});

export const makeUserAdmin = mutation({
  args: { userId: v.id("users") },
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

    await ctx.db.patch(userProfile._id, { isAdmin: true });
  },
});

export const removeUserAdmin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", adminUserId))
      .unique();

    if (!adminProfile?.isAdmin) throw new Error("Admin access required");

    // Don't allow removing admin from self
    if (args.userId === adminUserId) {
      throw new Error("Cannot remove admin access from yourself");
    }

    const userProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!userProfile) throw new Error("User profile not found");

    await ctx.db.patch(userProfile._id, { isAdmin: false });
  },
});

export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile?.isAdmin) throw new Error("Admin access required");

    const totalUsers = await ctx.db.query("profiles").collect().then(p => p.length);
    const premiumUsers = await ctx.db.query("profiles")
      .filter((q) => q.eq(q.field("isPremium"), true))
      .collect()
      .then(p => p.length);
    
    const totalChats = await ctx.db.query("chats").collect().then(c => c.length);
    const totalMessages = await ctx.db.query("messages").collect().then(m => m.length);
    
    const pendingRequests = await ctx.db
      .query("premiumRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect()
      .then(r => r.length);

    return {
      totalUsers,
      premiumUsers,
      freeUsers: totalUsers - premiumUsers,
      totalChats,
      totalMessages,
      pendingRequests,
    };
  },
});
