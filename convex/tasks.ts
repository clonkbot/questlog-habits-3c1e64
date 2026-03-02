import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Main Tasks
export const listMainTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("mainTasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createMainTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    xpReward: v.number(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("mainTasks", {
      userId,
      title: args.title,
      description: args.description,
      xpReward: args.xpReward,
      icon: args.icon,
      createdAt: Date.now(),
    });
  },
});

export const deleteMainTask = mutation({
  args: { id: v.id("mainTasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});

// Bonus Tasks
export const listBonusTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("bonusTasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createBonusTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    xpReward: v.number(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("bonusTasks", {
      userId,
      title: args.title,
      description: args.description,
      xpReward: args.xpReward,
      icon: args.icon,
      createdAt: Date.now(),
    });
  },
});

export const deleteBonusTask = mutation({
  args: { id: v.id("bonusTasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
