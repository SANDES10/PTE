/**
 * System Admin Router
 * Advanced system control procedures for senior administrators
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as adminDb from "../admin/adminDb";
import * as analyticsDb from "../admin/analyticsDb";
/**
 * Admin-only procedure - checks for super admin role
 */
const adminOnlyProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only administrators can access this resource",
    });
  }
  return next({ ctx });
});

export const systemAdminRouter = router({
  /**
   * Get system health status
   */
  getSystemHealth: adminOnlyProcedure.query(async ({ ctx }) => {
    try {
      // In production, fetch real metrics from monitoring service
      return {
        status: "healthy" as const,
        cpu: Math.floor(Math.random() * 80),
        memory: Math.floor(Math.random() * 80),
        database: "connected" as const,
        api: "operational" as const,
        uptime: "45 days 12 hours",
        lastCheck: new Date().toISOString(),
        services: [
          { name: "API Server", status: "operational", uptime: "99.9%" },
          { name: "Database", status: "operational", uptime: "99.95%" },
          { name: "Cache Server", status: "operational", uptime: "100%" },
          { name: "Email Service", status: "operational", uptime: "99.8%" },
          { name: "Payment Gateway", status: "operational", uptime: "99.99%" },
          { name: "Storage Service", status: "operational", uptime: "99.9%" },
        ],
      };
    } catch (error) {
      console.error("[Admin] Error fetching system health:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Get system statistics
   */
  getSystemStats: adminOnlyProcedure.query(async ({ ctx }) => {
    try {
      return await adminDb.getSystemStatistics();
    } catch (error) {
      console.error("[Admin] Error fetching system stats:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Get activity logs
   */
  getActivityLogs: adminOnlyProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        filter: z.enum(["all", "user_actions", "system_events", "errors"]).default("all"),
      })
    )
    .query(async ({ input }) => {
      try {
        return await adminDb.getUserActivityLogs(input.limit, input.offset);
      } catch (error) {
        console.error("[Admin] Error fetching activity logs:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Ban or unban a user
   */
  toggleUserBan: adminOnlyProcedure
    .input(
      z.object({
        userId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Log the action
      console.log(`[Admin] ${ctx.user?.name} toggled ban status for user ${input.userId}`);

      return {
        success: true,
        message: "User ban status updated",
        userId: input.userId,
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Update system configuration
   */
  updateSystemConfig: adminOnlyProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(`[Admin] ${ctx.user?.name} updated config: ${input.key}`);

      return {
        success: true,
        message: "Configuration updated",
        key: input.key,
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Trigger system backup
   */
  triggerBackup: adminOnlyProcedure.mutation(async ({ ctx }) => {
    console.log(`[Admin] ${ctx.user?.name} triggered system backup`);

    return {
      success: true,
      backupId: `backup_${Date.now()}`,
      status: "in_progress",
      estimatedTime: "15 minutes",
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Get backup history
   */
  getBackupHistory: adminOnlyProcedure.query(async () => {
    return [
      {
        id: "backup_1710000000000",
        date: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
        size: "2.5 GB",
        status: "completed",
        duration: "12 minutes",
      },
      {
        id: "backup_1709913600000",
        date: new Date(Date.now() - 48 * 60 * 60000).toISOString(),
        size: "2.4 GB",
        status: "completed",
        duration: "11 minutes",
      },
      {
        id: "backup_1709827200000",
        date: new Date(Date.now() - 72 * 60 * 60000).toISOString(),
        size: "2.3 GB",
        status: "completed",
        duration: "10 minutes",
      },
    ];
  }),

  /**
   * Get API key management
   */
  getApiKeys: adminOnlyProcedure.query(async () => {
    // Mock API keys - in production, fetch from secure vault
    return [
      {
        id: "key_1",
        name: "Email Service",
        key: "sk_live_••••••••••••••••",
        status: "active",
        lastUsed: "2 minutes ago",
        createdAt: "2024-01-15",
      },
      {
        id: "key_2",
        name: "Payment Gateway",
        key: "pk_live_••••••••••••••••",
        status: "active",
        lastUsed: "5 minutes ago",
        createdAt: "2024-01-20",
      },
      {
        id: "key_3",
        name: "Storage Service",
        key: "aws_••••••••••••••••",
        status: "active",
        lastUsed: "1 hour ago",
        createdAt: "2024-02-01",
      },
    ];
  }),

  /**
   * Rotate API key
   */
  rotateApiKey: adminOnlyProcedure
    .input(
      z.object({
        keyId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(`[Admin] ${ctx.user?.name} rotated API key: ${input.keyId}`);

      return {
        success: true,
        message: "API key rotated successfully",
        newKey: "sk_live_••••••••••••••••",
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Get user engagement metrics
   */
  getUserEngagement: adminOnlyProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      try {
        return await analyticsDb.getUserEngagementMetrics(input.days);
      } catch (error) {
        console.error("[Admin] Error fetching user engagement:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Get learning performance metrics
   */
  getLearningPerformance: adminOnlyProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      try {
        return await analyticsDb.getLearningPerformanceMetrics(input.days);
      } catch (error) {
        console.error("[Admin] Error fetching learning performance:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Get payment and revenue metrics
   */
  getPaymentRevenue: adminOnlyProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      try {
        return await analyticsDb.getPaymentRevenueMetrics(input.days);
      } catch (error) {
        console.error("[Admin] Error fetching payment revenue:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Get customer lifetime value
   */
  getCustomerLTV: adminOnlyProcedure.query(async () => {
    try {
      return await analyticsDb.getCustomerLifetimeValue();
    } catch (error) {
      console.error("[Admin] Error fetching CLV:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Get churn and retention metrics
   */
  getChurnRetention: adminOnlyProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      try {
        return await analyticsDb.getChurnRetentionMetrics(input.days);
      } catch (error) {
        console.error("[Admin] Error fetching churn retention:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Get system alerts
   */
  getSystemAlerts: adminOnlyProcedure.query(async () => {
    // Mock alerts - in production, fetch from monitoring service
    return [
      {
        id: 1,
        severity: "warning" as const,
        title: "High Memory Usage",
        message: "Memory usage is at 78%, consider scaling up",
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: 2,
        severity: "info" as const,
        title: "Backup Completed",
        message: "Daily backup completed successfully",
        timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      },
      {
        id: 3,
        severity: "error" as const,
        title: "Failed Payment Processing",
        message: "2 payments failed in the last hour",
        timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
      },
    ];
  }),

  /**
   * Acknowledge alert
   */
  acknowledgeAlert: adminOnlyProcedure
    .input(
      z.object({
        alertId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(`[Admin] ${ctx.user?.name} acknowledged alert: ${input.alertId}`);

      return {
        success: true,
        message: "Alert acknowledged",
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Get system performance metrics
   */
  getPerformanceMetrics: adminOnlyProcedure.query(async () => {
    // Mock performance metrics - in production, fetch from monitoring service
    return {
      apiResponseTime: "145ms",
      databaseQueryTime: "23ms",
      cacheHitRate: "87%",
      errorRate: "0.02%",
      uptime: "99.98%",
      requestsPerSecond: 1250,
      activeConnections: 456,
      queuedRequests: 12,
    };
  }),
});

export default systemAdminRouter;
