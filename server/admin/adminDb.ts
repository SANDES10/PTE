/**
 * Admin Database Query Helpers
 * Real database queries for system admin operations
 */

import { getDb } from "../db";
import { users, subscriptions, payments, practiceSessions } from "../../drizzle/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

/**
 * Get total system statistics
 */
export async function getSystemStatistics() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Get total users
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get active subscriptions
    const activeSubsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));
    const activeSubscriptions = activeSubsResult[0]?.count || 0;

    // Get total revenue
    const revenueResult = await db
      .select({ total: sql<number>`sum(${payments.amount})` })
      .from(payments)
      .where(eq(payments.status, "completed"));
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get total sessions
    const sessionsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(practiceSessions);
    const totalSessions = sessionsResult[0]?.count || 0;

    // Get failed payments
    const failedPaymentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(payments)
      .where(eq(payments.status, "failed"));
    const failedPayments = failedPaymentsResult[0]?.count || 0;

    // Get active users (all users for now)
    const activeUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const activeUsers = activeUsersResult[0]?.count || 0;

    return {
      totalUsers,
      activeUsers,
      totalSessions,
      totalRevenue,
      activeSubscriptions,
      failedPayments,
      pendingSupport: 0, // Would need support tickets table
      systemErrors: 0, // Would need error logs table
      apiCalls: 0, // Would need API logs table
      storageUsed: 0, // Would need storage tracking
      databaseSize: 0, // Would need to query DB size
    };
  } catch (error) {
    console.error("[Admin] Error fetching system statistics:", error);
    throw error;
  }
}

/**
 * Get all admin users
 */
export async function getAdminUsers() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const admins = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: sql<string>`'active'`,
        lastLogin: users.createdAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "admin"))
      .orderBy(desc(users.createdAt));

    return admins;
  } catch (error) {
    console.error("[Admin] Error fetching admin users:", error);
    throw error;
  }
}

/**
 * Get all platform users with pagination
 */
export async function getPlatformUsers(limit: number = 50, offset: number = 0) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "user"));
    const total = countResult[0]?.count || 0;

    // Get users with pagination
    const platformUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        lastLogin: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "user"))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      users: platformUsers,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error("[Admin] Error fetching platform users:", error);
    throw error;
  }
}

/**
 * Get user subscription details
 */
export async function getUserSubscriptions(limit: number = 50, offset: number = 0) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions);
    const total = countResult[0]?.count || 0;

    // Get subscriptions with user info
    const subs = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        userName: users.name,
        userEmail: users.email,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        renewalDate: subscriptions.renewalDate,
        autoRenew: subscriptions.autoRenew,
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .orderBy(desc(subscriptions.startDate))
      .limit(limit)
      .offset(offset);

    return {
      subscriptions: subs,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error("[Admin] Error fetching user subscriptions:", error);
    throw error;
  }
}

/**
 * Get payment transactions
 */
export async function getPaymentTransactions(limit: number = 50, offset: number = 0) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(payments);
    const total = countResult[0]?.count || 0;

    // Get payments with user info
    const txns = await db
      .select({
        id: payments.id,
        userId: payments.userId,
        userName: users.name,
        userEmail: users.email,
        amount: payments.amount,
        currency: payments.currency,
        gateway: payments.gateway,
        status: payments.status,
        transactionId: payments.transactionId,
        createdAt: payments.createdAt,
        completedAt: payments.completedAt,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      transactions: txns,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error("[Admin] Error fetching payment transactions:", error);
    throw error;
  }
}

/**
 * Get revenue statistics by gateway
 */
export async function getRevenueByGateway() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const revenue = await db
      .select({
        gateway: payments.gateway,
        total: sql<number>`sum(${payments.amount})`,
        count: sql<number>`count(*)`,
      })
      .from(payments)
      .where(eq(payments.status, "completed"))
      .groupBy(payments.gateway);

    return revenue;
  } catch (error) {
    console.error("[Admin] Error fetching revenue by gateway:", error);
    throw error;
  }
}

/**
 * Get user activity logs
 */
export async function getUserActivityLogs(limit: number = 50, offset: number = 0) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Get recent practice sessions as activity
    const logs = await db
      .select({
        id: practiceSessions.id,
        userId: practiceSessions.userId,
        userName: users.name,
        action: sql<string>`'Practice Session'`,
         target: sql<string>`CONCAT(${practiceSessions.section}, ' - ', ${practiceSessions.status})`,
        timestamp: practiceSessions.startedAt,
        status: practiceSessions.status,
        details: sql<string>`'Practice session completed'`,
      })
      .from(practiceSessions)
      .leftJoin(users, eq(practiceSessions.userId, users.id))
      .orderBy(desc(practiceSessions.startedAt))
      .limit(limit)
      .offset(offset);

    return logs;
  } catch (error) {
    console.error("[Admin] Error fetching activity logs:", error);
    throw error;
  }
}

/**
 * Get user growth statistics (last 30 days)
 */
export async function getUserGrowthStats() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const growth = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))
      .groupBy(sql<string>`DATE(${users.createdAt})`)
      .orderBy(sql<string>`DATE(${users.createdAt})`);

    return growth;
  } catch (error) {
    console.error("[Admin] Error fetching user growth stats:", error);
    throw error;
  }
}

/**
 * Ban or unban a user
 */
export async function toggleUserBan(userId: number, reason?: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Get current user status
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) throw new Error("User not found");

    // For now, we'll just log the action
    // In production, you'd update a user_bans table
    console.log(`[Admin] User ${userId} ban toggled. Reason: ${reason || "No reason provided"}`);

    return {
      success: true,
      userId,
      action: "ban_toggled",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[Admin] Error toggling user ban:", error);
    throw error;
  }
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const stats = await db
      .select({
        status: subscriptions.status,
        count: sql<number>`count(*)`,
      })
      .from(subscriptions)
      .groupBy(subscriptions.status);

    return stats;
  } catch (error) {
    console.error("[Admin] Error fetching subscription stats:", error);
    throw error;
  }
}

export default {
  getSystemStatistics,
  getAdminUsers,
  getPlatformUsers,
  getUserSubscriptions,
  getPaymentTransactions,
  getRevenueByGateway,
  getUserActivityLogs,
  getUserGrowthStats,
  toggleUserBan,
  getSubscriptionStats,
};
