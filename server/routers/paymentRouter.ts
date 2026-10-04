/**
 * Payment Router - eSewa and Khalti Integration
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createPayment,
  updatePaymentStatus,
  getPaymentByReferenceId,
  getUserPayments,
  getSubscriptionPlans,
  createSubscription,
  getUserActiveSubscription,
  cancelSubscription,
  getSubscriptionWithPlan,
} from "../payment/db";
import {
  createESewaPaymentRequest,
  verifyESewaPayment,
  generateReferenceId as generateESewaReferenceId,
} from "../payment/esewa";
import {
  createKhaltiPaymentRequest,
  verifyKhaltiPayment,
  generateReferenceId as generateKhaltiReferenceId,
  nprToKhalti,
} from "../payment/khalti";

const ESEWA_CONFIG = {
  merchantCode: process.env.ESEWA_MERCHANT_CODE || "TESTMERCHANT",
  successUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/payment/esewa/success`,
  failureUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/payment/esewa/failure`,
  isProduction: process.env.NODE_ENV === "production",
};

const KHALTI_CONFIG = {
  publicKey: process.env.KHALTI_PUBLIC_KEY || "test_public_key",
  secretKey: process.env.KHALTI_SECRET_KEY || "test_secret_key",
  isProduction: process.env.NODE_ENV === "production",
};

export const paymentRouter = router({
  // Get all subscription plans
  getPlans: publicProcedure.query(async () => {
    return getSubscriptionPlans();
  }),

  // Initiate eSewa payment
  initiateESewaPayment: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
        productName: z.string(),
        productDescription: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const referenceId = generateESewaReferenceId(ctx.user.id, Date.now());

        // Create payment record (we'll track by referenceId)
        try {
          await createPayment({
            userId: ctx.user.id,
            gateway: "esewa",
            amount: 1000, // Placeholder - get from plan
            description: input.productDescription,
            referenceId,
          });
        } catch (e) {
          console.error("Error creating payment record:", e);
        }

        // Generate eSewa payment request
        const esewaRequest = createESewaPaymentRequest(ESEWA_CONFIG, {
          amount: 1000,
          productCode: `PLAN${input.planId}`,
          productName: input.productName,
          productDescription: input.productDescription,
          referenceId,
          userId: ctx.user.id,
        });

        return {
          paymentId: 0,
          paymentUrl: esewaRequest.paymentUrl,
          referenceId,
        };
      } catch (error) {
        console.error("eSewa payment initiation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initiate eSewa payment",
        });
      }
    }),

  // Verify eSewa payment
  verifyESewaPayment: protectedProcedure
    .input(z.object({ transactionCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const verification = await verifyESewaPayment(
          ESEWA_CONFIG,
          input.transactionCode
        );

        if (!verification.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Payment verification failed",
          });
        }

        // Update payment status
        const payment = await getPaymentByReferenceId(
          verification.transactionCode || ""
        );
        if (payment) {
          try {
            await updatePaymentStatus(
              payment.id,
              "completed",
              verification.transactionCode,
              { verificationResponse: verification }
            );
          } catch (e) {
            console.error("Error updating payment status:", e);
          }
        }

        return { success: true, verification };
      } catch (error) {
        console.error("eSewa verification error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment verification failed",
        });
      }
    }),

  // Initiate Khalti payment
  initiateKhaltiPayment: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
        productName: z.string(),
        productDescription: z.string(),
        amount: z.number(),
        customerEmail: z.string().email(),
        customerPhone: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const referenceId = generateKhaltiReferenceId(ctx.user.id, Date.now());

        // Create payment record (we'll track by referenceId)
        try {
          await createPayment({
            userId: ctx.user.id,
            gateway: "khalti",
            amount: input.amount,
            description: input.productDescription,
            referenceId,
          });
        } catch (e) {
          console.error("Error creating payment record:", e);
        }

        // Generate Khalti payment request
        const khaltiRequest = await createKhaltiPaymentRequest(KHALTI_CONFIG, {
          amount: nprToKhalti(input.amount),
          productName: input.productName,
          productDescription: input.productDescription,
          referenceId,
          userId: ctx.user.id,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
        });

        return {
          paymentId: 0,
          pidx: khaltiRequest.pidx,
          paymentUrl: khaltiRequest.paymentUrl,
          referenceId,
        };
      } catch (error) {
        console.error("Khalti payment initiation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initiate Khalti payment",
        });
      }
    }),

  // Verify Khalti payment
  verifyKhaltiPayment: protectedProcedure
    .input(
      z.object({
        pidx: z.string(),
        transactionId: z.string(),
        amount: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const verification = await verifyKhaltiPayment(KHALTI_CONFIG, {
          pidx: input.pidx,
          transactionId: input.transactionId,
          amount: input.amount,
        });

        if (!verification.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Payment verification failed",
          });
        }

        // Update payment status
        const payment = await getPaymentByReferenceId(input.pidx);
        if (payment) {
          try {
            await updatePaymentStatus(
              payment.id,
              "completed",
              verification.transactionId,
              { verificationResponse: verification }
            );
          } catch (e) {
            console.error("Error updating payment status:", e);
          }
        }

        return { success: true, verification };
      } catch (error) {
        console.error("Khalti verification error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment verification failed",
        });
      }
    }),

  // Get user's payment history
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    return getUserPayments(ctx.user.id, 20);
  }),

  // Get user's active subscription
  getActiveSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await getUserActiveSubscription(ctx.user.id);
    if (!subscription) return null;

    return getSubscriptionWithPlan(subscription.id);
  }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await getSubscriptionWithPlan(input.subscriptionId);
      if (!subscription || subscription.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await cancelSubscription(input.subscriptionId);
      return { success: true };
    }),
});
