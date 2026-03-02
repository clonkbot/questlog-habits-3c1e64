import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // User profiles with XP tracking
  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    totalXp: v.number(),
    level: v.number(),
    streak: v.number(),
    lastActiveDate: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Main daily tasks (core habits)
  mainTasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    xpReward: v.number(),
    icon: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Bonus tasks (unlocked after main tasks)
  bonusTasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    xpReward: v.number(),
    icon: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Daily completions tracking
  completions: defineTable({
    userId: v.id("users"),
    taskId: v.union(v.id("mainTasks"), v.id("bonusTasks")),
    taskType: v.union(v.literal("main"), v.literal("bonus")),
    date: v.string(), // YYYY-MM-DD format
    xpEarned: v.number(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_task_and_date", ["taskId", "date"]),
});
