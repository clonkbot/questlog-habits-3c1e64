import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getTodayCompletions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const today = new Date().toISOString().split("T")[0];

    return await ctx.db
      .query("completions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .collect();
  },
});

export const getRecentCompletions = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const daysToFetch = args.days || 7;
    const dates: string[] = [];

    for (let i = 0; i < daysToFetch; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }

    const completions = await ctx.db
      .query("completions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return completions.filter((c) => dates.includes(c.date));
  },
});

export const completeTask = mutation({
  args: {
    taskId: v.union(v.id("mainTasks"), v.id("bonusTasks")),
    taskType: v.union(v.literal("main"), v.literal("bonus")),
    xpReward: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];

    // Check if already completed today
    const existing = await ctx.db
      .query("completions")
      .withIndex("by_task_and_date", (q) => q.eq("taskId", args.taskId).eq("date", today))
      .unique();

    if (existing) throw new Error("Task already completed today");

    return await ctx.db.insert("completions", {
      userId,
      taskId: args.taskId,
      taskType: args.taskType,
      date: today,
      xpEarned: args.xpReward,
      completedAt: Date.now(),
    });
  },
});

export const uncompleteTask = mutation({
  args: {
    taskId: v.union(v.id("mainTasks"), v.id("bonusTasks")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];

    const completion = await ctx.db
      .query("completions")
      .withIndex("by_task_and_date", (q) => q.eq("taskId", args.taskId).eq("date", today))
      .unique();

    if (completion && completion.userId === userId) {
      await ctx.db.delete(completion._id);
      return completion.xpEarned;
    }

    return 0;
  },
});
