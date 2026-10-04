/**
 * eSewa Payment Gateway Integration
 * Nepali payment gateway for online transactions
 */

import crypto from "crypto";

export interface ESewaConfig {
  merchantCode: string;
  successUrl: string;
  failureUrl: string;
  isProduction: boolean;
}

export interface ESewaPaymentRequest {
  amount: number; // in NPR
  productCode: string;
  productName: string;
  productDescription: string;
  referenceId: string;
  userId: number;
}

export interface ESewaPaymentResponse {
  transactionCode: string;
  status: string;
  totalAmount: number;
  productCode: string;
  signedFieldNames: string;
  signature: string;
  paymentUrl: string;
}

export interface ESewaVerificationResponse {
  success: boolean;
  transactionCode?: string;
  status?: string;
  totalAmount?: number;
  productCode?: string;
  message?: string;
}

/**
 * Generate MD5 hash for eSewa signature
 */
function generateSignature(data: string, secretKey: string): string {
  return crypto
    .createHash("md5")
    .update(data + secretKey)
    .digest("hex");
}

/**
 * Create eSewa payment request
 */
export function createESewaPaymentRequest(
  config: ESewaConfig,
  payment: ESewaPaymentRequest
): ESewaPaymentResponse {
  const baseUrl = config.isProduction
    ? "https://esewa.com.np/epay/main"
    : "https://uat.esewa.com.np/epay/main";

  // eSewa requires specific field order for signature
  const signatureData = `${payment.amount}${config.merchantCode}${payment.productCode}${payment.referenceId}`;
  const signature = generateSignature(signatureData, "8gBm/:&EnhH.1/q");

  const params = new URLSearchParams({
    amt: payment.amount.toString(),
    psc: payment.productCode,
    pdc: payment.productDescription,
    txAmt: "0", // tax amount
    tAmt: payment.amount.toString(), // total amount
    pid: payment.referenceId,
    scd: config.merchantCode,
    su: config.successUrl,
    fu: config.failureUrl,
    sign: signature,
  });

  return {
    transactionCode: "",
    status: "pending",
    totalAmount: payment.amount,
    productCode: payment.productCode,
    signedFieldNames: "amt,psc,pdc,pid,scd,su,fu",
    signature,
    paymentUrl: `${baseUrl}?${params.toString()}`,
  };
}

/**
 * Verify eSewa payment response
 * Called after user returns from eSewa payment page
 */
export async function verifyESewaPayment(
  config: ESewaConfig,
  transactionCode: string
): Promise<ESewaVerificationResponse> {
  try {
    const verifyUrl = config.isProduction
      ? "https://esewa.com.np/api/validate"
      : "https://uat.esewa.com.np/api/validate";

    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        q: transactionCode,
      }).toString(),
    });

    const data = await response.json();

    // eSewa returns status 0 for success
    if (data.status === "0" || data.status === 0) {
      return {
        success: true,
        transactionCode: data.transaction_code || transactionCode,
        status: "completed",
        totalAmount: data.total_amount,
        productCode: data.product_code,
      };
    }

    return {
      success: false,
      message: "Payment verification failed",
    };
  } catch (error) {
    console.error("eSewa verification error:", error);
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
  return `PTE${userId}${timestamp}`;
}
