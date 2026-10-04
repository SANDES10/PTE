import { getDb } from "../db";
import { users, subscriptions, payments, practiceSessions, subscriptionPlans } from "../../drizzle/schema";
import { sql, desc, gte, lte, and, eq } from "drizzle-orm";

// ── User Engagement Metrics ────────────────────────────────────────────────

export async function getUserEngagementMetrics(days: number = 30) {
  const db = await getDb();
  if (!db) return { totalUsers: 0, activeUsers: 0, dau: [], loginFrequency: [] };
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Total users
  const totalUsers = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users);

  // Active users (logged in within period)
  const activeUsers = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${practiceSessions.userId})` })
    .from(practiceSessions)
    .where(gte(practiceSessions.startedAt, startDate));

  // Daily active users
  const dau = await db
    .select({
      date: sql<string>`DATE(${practiceSessions.startedAt})`,
      count: sql<number>`COUNT(DISTINCT ${practiceSessions.userId})`,
    })
    .from(practiceSessions)
    .where(gte(practiceSessions.startedAt, startDate))
    .groupBy(sql`DATE(${practiceSessions.startedAt})`)
    .orderBy(sql`DATE(${practiceSessions.startedAt})`);

  // Login frequency
  const loginFrequency = await db
    .select({
      frequency: sql<string>`CASE 
        WHEN COUNT(*) >= 20 THEN 'Very Active (20+ sessions)'
        WHEN COUNT(*) >= 10 THEN 'Active (10-19 sessions)'
        WHEN COUNT(*) >= 5 THEN 'Regular (5-9 sessions)'
        WHEN COUNT(*) >= 1 THEN 'Occasional (1-4 sessions)'
        ELSE 'Inactive'
      END`,
      userCount: sql<number>`COUNT(DISTINCT ${practiceSessions.userId})`,
    })
    .from(practiceSessions)
    .where(gte(practiceSessions.startedAt, startDate))
    .groupBy(
      sql`CASE 
        WHEN COUNT(*) >= 20 THEN 'Very Active (20+ sessions)'
        WHEN COUNT(*) >= 10 THEN 'Active (10-19 sessions)'
        WHEN COUNT(*) >= 5 THEN 'Regular (5-9 sessions)'
        WHEN COUNT(*) >= 1 THEN 'Occasional (1-4 sessions)'
        ELSE 'Inactive'
      END`
    );

  return {
    totalUsers: totalUsers[0]?.count || 0,
    activeUsers: activeUsers[0]?.count || 0,
    dau: dau || [],
    loginFrequency: loginFrequency || [],
  };
}

// ── Learning Performance Metrics ───────────────────────────────────────────

export async function getLearningPerformanceMetrics(days: number = 30) {
  const db = await getDb();
  if (!db) return { scoresByTaskType: [], scoreDistribution: [], weakAreas: [], improvementTrends: [] };
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Average scores by task type
  const scoresByTaskType = await db
    .select({
      taskType: sql<string>`q.taskType`,
      avgScore: sql<number>`AVG(COALESCE(ps.overallScore, 0))`,
      count: sql<number>`COUNT(*)`,
      minScore: sql<number>`MIN(COALESCE(ps.overallScore, 0))`,
      maxScore: sql<number>`MAX(COALESCE(ps.overallScore, 0))`,
    })
    .from(practiceSessions)
    .where(gte(practiceSessions.startedAt, startDate))
    .groupBy(sql`q.taskType`)
    .orderBy(desc(sql`AVG(COALESCE(ps.overallScore, 0))`));

  // Score distribution
  const scoreDistribution = await db
    .select({
      band: sql<string>`CASE 
        WHEN COALESCE(ps.overallScore, 0) >= 80 THEN '80-90 (Excellent)'
        WHEN COALESCE(ps.overallScore, 0) >= 70 THEN '70-79 (Very Good)'
        WHEN COALESCE(ps.overallScore, 0) >= 60 THEN '60-69 (Good)'
        WHEN COALESCE(ps.overallScore, 0) >= 50 THEN '50-59 (Fair)'
        ELSE '< 50 (Needs Improvement)'
      END`,
      count: sql<number>`COUNT(*)`,
    })
    .from(practiceSessions)
    .where(gte(practiceSessions.startedAt, startDate))
    .groupBy(
      sql`CASE 
        WHEN COALESCE(ps.overallScore, 0) >= 80 THEN '80-90 (Excellent)'
        WHEN COALESCE(ps.overallScore, 0) >= 70 THEN '70-79 (Very Good)'
        WHEN COALESCE(ps.overallScore, 0) >= 60 THEN '60-69 (Good)'
        WHEN COALESCE(ps.overallScore, 0) >= 50 THEN '50-59 (Fair)'
        ELSE '< 50 (Needs Improvement)'
      END`
    );

  // Weak areas (task types with lowest average scores)
  const weakAreas = await db
    .select({
      taskType: sql<string>`q.taskType`,
      avgScore: sql<number>`AVG(COALESCE(ps.overallScore, 0))`,
      attempts: sql<number>`COUNT(*)`,
    })
    .from(practiceSessions)
    .where(gte(practiceSessions.startedAt, startDate))
    .groupBy(sql`q.taskType`)
    .orderBy(sql`AVG(COALESCE(ps.overallScore, 0))`)
    .limit(5);

  // Score improvement trends
  const improvementTrends = await db
    .select({
      date: sql<string>`DATE(ps.startedAt)`,
      avgScore: sql<number>`AVG(COALESCE(ps.overallScore, 0))`,
    })
    .from(practiceSessions)
    .where(gte(practiceSessions.startedAt, startDate))
    .groupBy(sql`DATE(ps.startedAt)`)
    .orderBy(sql`DATE(ps.startedAt)`);

  return {
    scoresByTaskType: scoresByTaskType || [],
    scoreDistribution: scoreDistribution || [],
    weakAreas: weakAreas || [],
    improvementTrends: improvementTrends || [],
  };
}

// ── Payment & Revenue Metrics ──────────────────────────────────────────────

export async function getPaymentRevenueMetrics(days: number = 30) {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, revenueByMethod: [], subscriptionBreakdown: [], failedPayments: 0, dailyRevenue: [] };
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Total revenue
  const totalRevenue = await db
    .select({ total: sql<number>`SUM(${payments.amount})` })
    .from(payments)
    .where(and(gte(payments.createdAt, startDate), eq(payments.status, "completed")));

  // Revenue by payment method
  const revenueByMethod = await db
    .select({
      method: payments.gateway,
      total: sql<number>`SUM(${payments.amount})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(payments)
    .where(and(gte(payments.createdAt, startDate), eq(payments.status, "completed")))
    .groupBy(payments.gateway)
    .orderBy(desc(sql`SUM(${payments.amount})`));

  // Subscription breakdown
  const subscriptionBreakdown = await db
    .select({
      plan: sql<string>`sp.name`,
      count: sql<number>`COUNT(*)`,
      totalMrr: sql<number>`SUM(sp.price)`,
    })
    .from(subscriptions)
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(eq(subscriptions.status, "active"))
    .groupBy(sql`sp.id`);

  // Failed payments
  const failedPayments = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(payments)
    .where(and(gte(payments.createdAt, startDate), eq(payments.status, "failed")));

  // Daily revenue
  const dailyRevenue = await db
    .select({
      date: sql<string>`DATE(${payments.createdAt})`,
      total: sql<number>`SUM(${payments.amount})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(payments)
    .where(and(gte(payments.createdAt, startDate), eq(payments.status, "completed")))
    .groupBy(sql`DATE(${payments.createdAt})`)
    .orderBy(sql`DATE(${payments.createdAt})`);

  return {
    totalRevenue: totalRevenue[0]?.total || 0,
    revenueByMethod: revenueByMethod || [],
    subscriptionBreakdown: subscriptionBreakdown || [],
    failedPayments: failedPayments[0]?.count || 0,
    dailyRevenue: dailyRevenue || [],
  };
}

// ── System Health Metrics ──────────────────────────────────────────────────

export async function getSystemHealthMetrics() {
  // These would typically come from monitoring services
  // For now, returning mock data structure
  return {
    uptime: 99.9,
    errorRate: 0.1,
    avgResponseTime: 245, // ms
    activeConnections: 42,
    storageUsed: 2.4, // GB
    storageTotal: 100, // GB
    cpuUsage: 35,
    memoryUsage: 62,
    databaseStatus: "healthy",
    apiStatus: "operational",
  };
}

// ── Customer Lifetime Value (CLV) ──────────────────────────────────────────

export async function getCustomerLifetimeValue() {
  const db = await getDb();
  if (!db) return { topCustomers: [], averageClv: 0 };

  // Calculate CLV for each user
  const clvData = await db
    .select({
      userId: payments.userId,
      totalSpent: sql<number>`SUM(${payments.amount})`,
      transactionCount: sql<number>`COUNT(*)`,
      firstPayment: sql<string>`MIN(DATE(${payments.createdAt}))`,
      lastPayment: sql<string>`MAX(DATE(${payments.createdAt}))`,
    })
    .from(payments)
    .where(eq(payments.status, "completed"))
    .groupBy(payments.userId)
    .orderBy(desc(sql`SUM(${payments.amount})`))  
    .limit(100);

  // Average CLV
  const avgClv = await db
    .select({
      avgClv: sql<number>`AVG(total_spent)`,
    })
    .from(
      db
        .select({
          total_spent: sql<number>`SUM(${payments.amount})`,
        })
        .from(payments)
        .where(eq(payments.status, "completed"))
        .groupBy(payments.userId)
        .as("clv_calc")
    );

  return {
    topCustomers: clvData || [],
    averageClv: avgClv[0]?.avgClv || 0,
  };
}

// ── Churn & Retention Metrics ──────────────────────────────────────────────

export async function getChurnRetentionMetrics(days: number = 30) {
  const db = await getDb();
  if (!db) return { churned: 0, active: 0, total: 0, churnRate: 0 };
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Churned subscriptions
  const churnedSubs = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(subscriptions)
    .where(and(eq(subscriptions.status, "canceled"), gte(subscriptions.canceledAt, startDate)));

  // Active subscriptions
  const activeSubs = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));

  // Churn rate
  const totalSubs = await db.select({ count: sql<number>`COUNT(*)` }).from(subscriptions);

  const churnRate =
    totalSubs[0]?.count && totalSubs[0].count > 0
      ? ((churnedSubs[0]?.count || 0) / totalSubs[0].count) * 100
      : 0;

  return {
    churned: churnedSubs[0]?.count || 0,
    active: activeSubs[0]?.count || 0,
    total: totalSubs[0]?.count || 0,
    churnRate: parseFloat(churnRate.toFixed(2)),
  };
}
