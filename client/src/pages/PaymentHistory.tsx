import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard, Download, Calendar, DollarSign, CheckCircle, Clock, XCircle,
  RefreshCw, ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface Payment {
  id: number;
  amount: number;
  gateway: "esewa" | "khalti";
  status: "pending" | "completed" | "failed" | "refunded";
  description: string;
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
}

interface Subscription {
  id: number;
  planName: string;
  status: "active" | "inactive" | "canceled" | "expired";
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  autoRenew: boolean;
  price: number;
  features: string[];
}

export default function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"payments" | "subscription">("payments");

  useEffect(() => {
    if (!user) return;
    loadPaymentData();
  }, [user]);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      // In production, fetch from tRPC
      // const paymentHistory = await trpc.payment.getPaymentHistory.useQuery();
      // const activeSubscription = await trpc.payment.getActiveSubscription.useQuery();

      // Mock data for now
      setPayments([
        {
          id: 1,
          amount: 999,
          gateway: "khalti",
          status: "completed",
          description: "Pro Plan - Monthly",
          transactionId: "KHL123456789",
          createdAt: "2026-03-10T10:30:00Z",
          completedAt: "2026-03-10T10:35:00Z",
        },
        {
          id: 2,
          amount: 1999,
          gateway: "esewa",
          status: "completed",
          description: "Premium Plan - Yearly",
          transactionId: "ESW987654321",
          createdAt: "2026-02-15T14:20:00Z",
          completedAt: "2026-02-15T14:25:00Z",
        },
      ]);

      setSubscription({
        id: 1,
        planName: "Pro",
        status: "active",
        startDate: "2026-03-10T00:00:00Z",
        endDate: "2026-04-10T00:00:00Z",
        renewalDate: "2026-04-10T00:00:00Z",
        autoRenew: true,
        price: 999,
        features: ["Unlimited Practice", "AI Feedback", "Analytics Dashboard", "Priority Support"],
      });
    } catch (error) {
      console.error("Failed to load payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      case "active":
        return <Badge className="bg-teal-500">Active</Badge>;
      case "canceled":
        return <Badge variant="secondary">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Please log in to view payment history</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Billing & Payments</h1>
              <p className="text-slate-600">Manage your subscription and payment history</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("subscription")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "subscription"
                ? "bg-teal-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Current Subscription
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "payments"
                ? "bg-teal-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Payment History
          </button>
        </div>

        {/* Current Subscription */}
        {activeTab === "subscription" && subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{subscription.planName} Plan</CardTitle>
                    <CardDescription>
                      {getStatusBadge(subscription.status)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-teal-600">₨{subscription.price}</p>
                    <p className="text-sm text-slate-600">per month</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subscription Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Started</p>
                    <p className="font-semibold text-slate-900">
                      {formatDate(subscription.startDate)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Next Renewal</p>
                    <p className="font-semibold text-slate-900">
                      {subscription.renewalDate ? formatDate(subscription.renewalDate) : "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Auto-Renew</p>
                    <p className="font-semibold text-slate-900">
                      {subscription.autoRenew ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Included Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {subscription.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Manage Auto-Renewal
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Payment History */}
        {activeTab === "payments" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>All your transactions and receipts</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">Loading payment history...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No payments yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment, i) => (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {getStatusIcon(payment.status)}
                          <div>
                            <p className="font-medium text-slate-900">{payment.description}</p>
                            <p className="text-sm text-slate-600 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDate(payment.createdAt)}
                            </p>
                            {payment.transactionId && (
                              <p className="text-xs text-slate-500 font-mono">
                                {payment.transactionId}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-slate-900 flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ₨{payment.amount}
                            </p>
                            {getStatusBadge(payment.status)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Receipt
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upgrade CTA */}
        {!subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Ready to Upgrade?
                </h3>
                <p className="text-slate-600 mb-6">
                  Choose a plan that fits your study goals and unlock unlimited practice
                </p>
                <Link href="/pricing">
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    View Plans
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
