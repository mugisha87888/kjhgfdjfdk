import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      // Return null if profile doesn't exist - it will be created by a mutation
      return null;
    }

    return profile;
  },
});

export const createProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) return existingProfile;

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const profileId = await ctx.db.insert("profiles", {
      userId,
      displayName: user.name || user.email?.split("@")[0] || "User",
      isPremium: false,
      isAdmin: false,
      createdAt: Date.now(),
    });

    return await ctx.db.get(profileId);
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      ...(args.displayName !== undefined && { displayName: args.displayName }),
      ...(args.avatar !== undefined && { avatar: args.avatar }),
    });
  },
});

export const checkPremiumStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { isPremium: false, expired: false };

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return { isPremium: false, expired: false };

    const now = Date.now();
    const expired = profile.premiumExpiresAt && profile.premiumExpiresAt < now;

    if (expired && profile.isPremium) {
      // Auto-expire premium
      await ctx.db.patch(profile._id, { isPremium: false });
      return { isPremium: false, expired: true };
    }

    return {
      isPremium: profile.isPremium,
      expired: false,
      expiresAt: profile.premiumExpiresAt,
    };
  },
});
