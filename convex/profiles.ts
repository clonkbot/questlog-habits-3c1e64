import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

export const createOrUpdate = mutation({
  args: { displayName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      if (args.displayName) {
        await ctx.db.patch(existing._id, { displayName: args.displayName });
      }
      return existing._id;
    }

    return await ctx.db.insert("profiles", {
      userId,
      displayName: args.displayName || "Adventurer",
      totalXp: 0,
      level: 1,
      streak: 0,
      createdAt: Date.now(),
    });
  },
});

export const addXp = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const newXp = profile.totalXp + args.amount;
    const newLevel = Math.floor(newXp / 500) + 1;
    const today = new Date().toISOString().split("T")[0];

    // Update streak logic
    let newStreak = profile.streak;
    if (profile.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (profile.lastActiveDate === yesterdayStr) {
        newStreak = profile.streak + 1;
      } else if (profile.lastActiveDate !== today) {
        newStreak = 1;
      }
    }

    await ctx.db.patch(profile._id, {
      totalXp: newXp,
      level: newLevel,
      streak: newStreak,
      lastActiveDate: today,
    });

    return { newXp, newLevel, levelUp: newLevel > profile.level };
  },
});
