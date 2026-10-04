/**
 * Payment Database Helpers
 */

import { getDb } from "../db";
import {
  payments,
  subscriptions,
  subscriptionPlans,
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function createPayment(data: {
  userId: number;
  subscriptionId?: number;
  gateway: "esewa" | "khalti";
  amount: number;
  description: string;
  referenceId: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  const [payment] = await db
    .insert(payments)
    .values({
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      gateway: data.gateway,
      amount: data.amount,
      currency: "NPR",
      status: "pending",
      description: data.description,
      referenceId: data.referenceId,
    })
    .returning();

  return payment;
}

export async function updatePaymentStatus(
  paymentId: number,
  status: "pending" | "completed" | "failed" | "refunded",
  transactionId?: string,
  metadata?: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (transactionId) updateData.transactionId = transactionId;
  if (metadata) updateData.metadata = metadata;
  if (status === "completed") updateData.completedAt = new Date();

  await db.update(payments).set(updateData).where(eq(payments.id, paymentId));
}

export async function getPaymentByReferenceId(referenceId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.referenceId, referenceId))
    .limit(1);

  return payment;
}

export async function getUserPayments(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  return db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
}

export async function createSubscriptionPlan(data: {
  name: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
  maxSessions?: number;
  storageGB?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  const [plan] = await db
    .insert(subscriptionPlans)
    .values({
      name: data.name,
      price: data.price,
      interval: data.interval,
      features: data.features,
      maxSessions: data.maxSessions,
      storageGB: data.storageGB,
    })
    .returning();

  return plan;
}

export async function getSubscriptionPlans() {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  return db.select().from(subscriptionPlans);
}

export async function getSubscriptionPlanById(planId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId))
    .limit(1);

  return plan;
}

export async function createSubscription(data: {
  userId: number;
  planId: number;
  autoRenew?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  const plan = await getSubscriptionPlanById(data.planId);
  if (!plan) throw new Error("Plan not found");

  const startDate = new Date();
  const endDate = new Date();

  if (plan.interval === "monthly") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  const [subscription] = await db
    .insert(subscriptions)
    .values({
      userId: data.userId,
      planId: data.planId,
      status: "active",
      startDate,
      endDate,
      renewalDate: endDate,
      autoRenew: data.autoRenew ?? true,
    })
    .returning();

  return subscription;
}

export async function getUserActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1);

  return subscription;
}

export async function cancelSubscription(subscriptionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscriptionId));
}

export async function getSubscriptionWithPlan(subscriptionId: number) {
  const db = await getDb();
  if (!db) return null;

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, subscriptionId))
    .limit(1);

  if (!subscription) return null;

  const plan = await getSubscriptionPlanById(subscription.planId);
  return { ...subscription, plan };
}

export async function getTotalRevenue() {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db
      .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)::int` })
      .from(payments)
      .where(eq(payments.status, "completed"));
    return result[0]?.total ?? 0;
  } catch {
    return 0;
  }
}

export async function getRevenueByGateway() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      gateway: payments.gateway,
      total: sql<number>`sum(${payments.amount})::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(payments)
    .where(eq(payments.status, "completed"))
    .groupBy(payments.gateway);
}

export async function getActiveSubscriptionsCount() {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));
    return result[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function getSubscriptionsByPlan() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      name: subscriptionPlans.name,
      count: sql<number>`count(*)::int`,
    })
    .from(subscriptions)
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(eq(subscriptions.status, "active"))
    .groupBy(subscriptionPlans.name);
}
