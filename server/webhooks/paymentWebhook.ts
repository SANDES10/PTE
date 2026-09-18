/**
 * Payment Webhook Handlers
 * Handles eSewa and Khalti payment confirmations
 */

import { Router, Request, Response } from "express";
import { getDb } from "../db";
import {
  updatePaymentStatus,
  getPaymentByReferenceId,
  createSubscription,
  getUserActiveSubscription,
} from "../payment/db";
import { verifyESewaPayment } from "../payment/esewa";
import { verifyKhaltiPayment } from "../payment/khalti";
import crypto from "crypto";

const router = Router();

const KHALTI_SECRET = process.env.KHALTI_SECRET_KEY || "test_secret_key";

/**
 * eSewa Payment Webhook
 * Called after user completes payment on eSewa
 */
router.post("/esewa", async (req: Request, res: Response) => {
  try {
    const { oid, amt, refId, pid, scd } = req.query;

    if (!oid || !amt || !refId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Verify payment with eSewa
    const verification = await verifyESewaPayment(
      {
        merchantCode: scd as string,
        successUrl: "",
        failureUrl: "",
        isProduction: process.env.NODE_ENV === "production",
      },
      oid as string
    );

    if (!verification.success) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // Update payment status
    const payment = await getPaymentByReferenceId(refId as string);
    if (payment) {
      await updatePaymentStatus(
        payment.id,
        "completed",
        verification.transactionCode,
        { esewaVerification: verification }
      );

      // Create subscription if this is a subscription payment
      if (payment.subscriptionId === null) {
        // Extract plan ID from product code (format: PLAN{planId})
        const planMatch = (pid as string)?.match(/PLAN(\d+)/);
        if (planMatch) {
          const planId = parseInt(planMatch[1]);
          await createSubscription({
            userId: payment.userId,
            planId,
            autoRenew: true,
          });
        }
      }
    }

    return res.json({ success: true, message: "Payment confirmed" });
  } catch (error) {
    console.error("eSewa webhook error:", error);
    return res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
});

/**
 * Khalti Payment Webhook
 * Called after user completes payment on Khalti
 */
router.post("/khalti", async (req: Request, res: Response) => {
  try {
    const { pidx, transaction_id, status, amount } = req.body;

    if (!pidx || !transaction_id) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Verify webhook signature
    const signature = req.headers["khalti-signature"] as string;
    if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", KHALTI_SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (signature !== expectedSignature) {
        return res.status(401).json({ success: false, message: "Invalid signature" });
      }
    }

    if (status !== "Completed") {
      return res.json({ success: true, message: "Payment not completed" });
    }

    // Update payment status
    const payment = await getPaymentByReferenceId(pidx);
    if (payment) {
      await updatePaymentStatus(
        payment.id,
        "completed",
        transaction_id,
        { khaltiWebhook: req.body }
      );

      // Create subscription if this is a subscription payment
      if (payment.subscriptionId === null && payment.gateway === "khalti") {
        // For now, assume this is a Pro plan subscription
        // In production, store plan info in payment metadata
        await createSubscription({
          userId: payment.userId,
          planId: 2, // Pro plan
          autoRenew: true,
        });
      }
    }

    return res.json({ success: true, message: "Payment confirmed" });
  } catch (error) {
    console.error("Khalti webhook error:", error);
    return res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
});

/**
 * Khalti Verification Endpoint
 * Called by frontend to verify payment after redirect
 */
router.post("/khalti/verify", async (req: Request, res: Response) => {
  try {
    const { pidx, transactionId, amount } = req.body;

    const verification = await verifyKhaltiPayment(
      {
        publicKey: process.env.KHALTI_PUBLIC_KEY || "test_public_key",
        secretKey: KHALTI_SECRET,
        isProduction: process.env.NODE_ENV === "production",
      },
      { pidx, transactionId, amount }
    );

    if (!verification.success) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // Update payment status
    const payment = await getPaymentByReferenceId(pidx);
    if (payment) {
      await updatePaymentStatus(
        payment.id,
        "completed",
        verification.transactionId,
        { khaltiVerification: verification }
      );

      // Create subscription
      if (payment.subscriptionId === null) {
        await createSubscription({
          userId: payment.userId,
          planId: 2, // Pro plan
          autoRenew: true,
        });
      }
    }

    return res.json({ success: true, verification });
  } catch (error) {
    console.error("Khalti verification error:", error);
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
});

export default router;
