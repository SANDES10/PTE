/**
 * Email Service
 * Handles sending emails via Resend API
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface PaymentReceiptData {
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  planName: string;
  planDuration: string;
  date: string;
  receiptUrl?: string;
}

interface SubscriptionRenewalData {
  userName: string;
  userEmail: string;
  planName: string;
  amount: number;
  currency: string;
  renewalDate: string;
  nextBillingDate: string;
}

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  planName: string;
  activationDate: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || "test_key";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "noreply@ptepractice.com";
const SENDER_NAME = "PTEMaster";

/**
 * Send email using Resend API
 */
async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // In production, use actual Resend API
    // For now, log the email
    console.log(`[Email] Sending to ${options.to}: ${options.subject}`);

    // Simulate API call
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceipt(data: PaymentReceiptData): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .receipt-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
          .receipt-item.total { border-bottom: none; font-weight: bold; font-size: 18px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Receipt</h1>
            <p>Thank you for your purchase!</p>
          </div>

          <div class="content">
            <h2>Hello ${data.userName},</h2>
            <p>Your payment has been received and processed successfully.</p>

            <div class="receipt-item">
              <span>Plan:</span>
              <span>${data.planName} (${data.planDuration})</span>
            </div>
            <div class="receipt-item">
              <span>Amount:</span>
              <span>${data.currency} ${data.amount.toLocaleString()}</span>
            </div>
            <div class="receipt-item">
              <span>Payment Method:</span>
              <span>${data.paymentMethod}</span>
            </div>
            <div class="receipt-item">
              <span>Transaction ID:</span>
              <span>${data.transactionId}</span>
            </div>
            <div class="receipt-item">
              <span>Date:</span>
              <span>${data.date}</span>
            </div>
            <div class="receipt-item total">
              <span>Total:</span>
              <span>${data.currency} ${data.amount.toLocaleString()}</span>
            </div>

            <p style="margin-top: 30px;">Your subscription is now active and you have full access to all premium features.</p>

            <center>
              <a href="https://ptepractice.com/dashboard" class="button">Go to Dashboard</a>
            </center>
          </div>

          <div class="footer">
            <p>© 2026 PTEMaster. All rights reserved.</p>
            <p>If you have any questions, please contact support@ptepractice.com</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail({
    to: data.userEmail,
    subject: `Payment Receipt - ${data.planName} Plan`,
    html,
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
  });

  return result.success;
}

/**
 * Send subscription renewal reminder
 */
export async function sendSubscriptionRenewalReminder(data: SubscriptionRenewalData): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Renewal Reminder</h1>
          </div>

          <div class="content">
            <h2>Hello ${data.userName},</h2>
            <p>Your ${data.planName} subscription will renew on <strong>${data.nextBillingDate}</strong>.</p>

            <div class="alert">
              <strong>Renewal Details:</strong><br>
              Amount: ${data.currency} ${data.amount.toLocaleString()}<br>
              Plan: ${data.planName}<br>
              Renewal Date: ${data.renewalDate}
            </div>

            <p>Your subscription will automatically renew to ensure uninterrupted access to all premium features.</p>

            <p><strong>What's included in your ${data.planName} plan:</strong></p>
            <ul>
              <li>Unlimited practice questions</li>
              <li>AI-powered scoring and feedback</li>
              <li>Personalized coaching plans</li>
              <li>Advanced analytics dashboard</li>
              <li>Priority support</li>
            </ul>

            <center>
              <a href="https://ptepractice.com/subscription" class="button">Manage Subscription</a>
            </center>
          </div>

          <div class="footer">
            <p>© 2026 PTEMaster. All rights reserved.</p>
            <p>If you have any questions, please contact support@ptepractice.com</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail({
    to: data.userEmail,
    subject: `Your ${data.planName} Subscription Renews Soon`,
    html,
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
  });

  return result.success;
}

/**
 * Send welcome email for new subscribers
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .feature { background: white; padding: 15px; border-radius: 6px; }
          .feature strong { color: #14b8a6; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to PTEMaster!</h1>
            <p>Your ${data.planName} subscription is now active</p>
          </div>

          <div class="content">
            <h2>Hello ${data.userName},</h2>
            <p>Welcome to PTEMaster! We're excited to have you on board. Your ${data.planName} subscription is now active as of ${data.activationDate}.</p>

            <h3>Getting Started:</h3>
            <div class="feature-grid">
              <div class="feature">
                <strong>📚 Practice Questions</strong><br>
                Access 500+ PTE Academic questions
              </div>
              <div class="feature">
                <strong>🤖 AI Scoring</strong><br>
                Get instant feedback on your responses
              </div>
              <div class="feature">
                <strong>📊 Analytics</strong><br>
                Track your progress with detailed reports
              </div>
              <div class="feature">
                <strong>🎯 Coaching Plans</strong><br>
                Personalized study roadmaps
              </div>
            </div>

            <h3>Recommended Next Steps:</h3>
            <ol>
              <li>Complete your profile with your target PTE score</li>
              <li>Take a diagnostic test to assess your current level</li>
              <li>Follow your personalized coaching plan</li>
              <li>Practice regularly and track your improvement</li>
            </ol>

            <center>
              <a href="https://ptepractice.com/dashboard" class="button">Start Practicing</a>
            </center>
          </div>

          <div class="footer">
            <p>© 2026 PTEMaster. All rights reserved.</p>
            <p>If you have any questions, please contact support@ptepractice.com</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail({
    to: data.userEmail,
    subject: `Welcome to PTEMaster - Your ${data.planName} Subscription is Active`,
    html,
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
  });

  return result.success;
}

/**
 * Send subscription cancellation confirmation
 */
export async function sendCancellationConfirmation(userName: string, userEmail: string, planName: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Cancelled</h1>
          </div>

          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Your ${planName} subscription has been successfully cancelled.</p>

            <p><strong>What happens now:</strong></p>
            <ul>
              <li>Your access to premium features will end at the end of your current billing period</li>
              <li>You'll be downgraded to the Free plan</li>
              <li>Your practice history and progress will be preserved</li>
              <li>You can reactivate your subscription anytime</li>
            </ul>

            <p>We'd love to hear your feedback! If there's anything we can improve, please let us know.</p>

            <center>
              <a href="https://ptepractice.com/feedback" class="button">Share Feedback</a>
            </center>
          </div>

          <div class="footer">
            <p>© 2026 PTEMaster. All rights reserved.</p>
            <p>If you have any questions, please contact support@ptepractice.com</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail({
    to: userEmail,
    subject: "Subscription Cancelled - PTEMaster",
    html,
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
  });

  return result.success;
}

export default {
  sendPaymentReceipt,
  sendSubscriptionRenewalReminder,
  sendWelcomeEmail,
  sendCancellationConfirmation,
};
