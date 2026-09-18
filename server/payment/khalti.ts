/**
 * Khalti Payment Gateway Integration
 * Nepali digital wallet and payment gateway
 */

export interface KhaltiConfig {
  publicKey: string;
  secretKey: string;
  isProduction: boolean;
}

export interface KhaltiPaymentRequest {
  amount: number; // in paisa (1 NPR = 100 paisa)
  productName: string;
  productDescription: string;
  referenceId: string;
  userId: number;
  customerEmail: string;
  customerPhone: string;
}

export interface KhaltiPaymentResponse {
  pidx: string; // Payment ID
  paymentUrl: string;
  expiresAt: string;
}

export interface KhaltiVerificationRequest {
  pidx: string;
  transactionId: string;
  amount: number;
}

export interface KhaltiVerificationResponse {
  success: boolean;
  pidx?: string;
  transactionId?: string;
  status?: string;
  amount?: number;
  message?: string;
}

/**
 * Create Khalti payment request
 */
export async function createKhaltiPaymentRequest(
  config: KhaltiConfig,
  payment: KhaltiPaymentRequest
): Promise<KhaltiPaymentResponse> {
  const baseUrl = config.isProduction
    ? "https://khalti.com/api/v2/epayment/initiate/"
    : "https://a.khalti.com/api/v2/epayment/initiate/";

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${config.publicKey}`,
      },
      body: JSON.stringify({
        return_url: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/payment/khalti/callback`,
        website_url: process.env.VITE_FRONTEND_URL || "http://localhost:3000",
        amount: payment.amount, // in paisa
        product_name: payment.productName,
        product_description: payment.productDescription,
        customer_name: `User ${payment.userId}`,
        customer_email: payment.customerEmail,
        customer_phone: payment.customerPhone,
        merchant_username: "PTEMaster",
      }),
    });

    const data = await response.json();

    if (data.pidx) {
      const paymentUrl = config.isProduction
        ? `https://khalti.com/epayment/payment/${data.pidx}`
        : `https://a.khalti.com/epayment/payment/${data.pidx}`;

      return {
        pidx: data.pidx,
        paymentUrl,
        expiresAt: data.expires_at,
      };
    }

    throw new Error("Failed to create Khalti payment");
  } catch (error) {
    console.error("Khalti payment creation error:", error);
    throw error;
  }
}

/**
 * Verify Khalti payment
 */
export async function verifyKhaltiPayment(
  config: KhaltiConfig,
  verification: KhaltiVerificationRequest
): Promise<KhaltiVerificationResponse> {
  const baseUrl = config.isProduction
    ? "https://khalti.com/api/v2/epayment/lookup/"
    : "https://a.khalti.com/api/v2/epayment/lookup/";

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${config.secretKey}`,
      },
      body: JSON.stringify({
        pidx: verification.pidx,
      }),
    });

    const data = await response.json();

    if (data.status === "Completed") {
      return {
        success: true,
        pidx: data.pidx,
        transactionId: data.transaction_id,
        status: "completed",
        amount: data.amount,
      };
    }

    return {
      success: false,
      message: `Payment status: ${data.status}`,
    };
  } catch (error) {
    console.error("Khalti verification error:", error);
    return {
      success: false,
      message: "Payment verification error",
    };
  }
}

/**
 * Generate unique reference ID for payment
 */
export function generateReferenceId(userId: number, timestamp: number): string {
  return `KHL${userId}${timestamp}`;
}

/**
 * Convert NPR to paisa for Khalti API
 */
export function nprToKhalti(nprAmount: number): number {
  return nprAmount * 100;
}

/**
 * Convert paisa to NPR from Khalti API
 */
export function khaltiToNpr(paisaAmount: number): number {
  return paisaAmount / 100;
}
