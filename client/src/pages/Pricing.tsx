import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, X, Star, Zap, Crown, ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  period: string;
  badge?: string;
  features: {
    name: string;
    included: boolean;
  }[];
  cta: string;
  highlighted?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    currency: "₨",
    period: "Forever",
    features: [
      { name: "50+ Practice Questions", included: true },
      { name: "Basic Score Reporting", included: true },
      { name: "Community Support", included: true },
      { name: "AI Feedback", included: false },
      { name: "Personalized Coaching", included: false },
      { name: "Advanced Analytics", included: false },
      { name: "Priority Support", included: false },
    ],
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious learners",
    price: 999,
    currency: "₨",
    period: "per month",
    badge: "POPULAR",
    highlighted: true,
    features: [
      { name: "500+ Practice Questions", included: true },
      { name: "AI-Powered Scoring", included: true },
      { name: "Personalized Coaching Plans", included: true },
      { name: "Advanced Analytics Dashboard", included: true },
      { name: "Progress Tracking", included: true },
      { name: "Email Support", included: true },
      { name: "Priority Support", included: false },
    ],
    cta: "Start Pro Trial",
  },
  {
    id: "premium",
    name: "Premium",
    description: "For maximum results",
    price: 1999,
    currency: "₨",
    period: "per month",
    badge: "BEST VALUE",
    features: [
      { name: "Unlimited Practice Questions", included: true },
      { name: "AI-Powered Scoring", included: true },
      { name: "Personalized Coaching Plans", included: true },
      { name: "Advanced Analytics Dashboard", included: true },
      { name: "One-on-One Sessions", included: true },
      { name: "Priority Email Support", included: true },
      { name: "24/7 Priority Support", included: true },
    ],
    cta: "Start Premium Trial",
  },
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === 0) return "Free";
    if (billingCycle === "yearly") {
      return `${plan.currency}${(plan.price * 12 * 0.9).toLocaleString()}`;
    }
    return `${plan.currency}${plan.price.toLocaleString()}`;
  };

  const getPeriod = (plan: PricingPlan) => {
    if (plan.price === 0) return plan.period;
    if (billingCycle === "yearly") {
      return "per year (save 10%)";
    }
    return plan.period;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-slate-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-slate-900">PTEMaster</span>
            </div>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-teal-600 hover:bg-teal-700">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Choose the perfect plan for your PTE Academic preparation journey
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                billingCycle === "yearly"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Yearly
              <Badge className="ml-2 bg-green-500">Save 10%</Badge>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${plan.highlighted ? "md:scale-105" : ""}`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <Card
                className={`h-full ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 shadow-lg"
                    : "bg-white hover:shadow-lg transition-shadow"
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-900">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900">
                        {getPrice(plan)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-slate-600 text-sm">{getPeriod(plan)}</span>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-teal-600 hover:bg-teal-700 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                    }`}
                  >
                    {plan.cta}
                  </Button>

                  {/* Features */}
                  <div className="space-y-3 pt-6 border-t border-slate-200">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            feature.included ? "text-slate-700" : "text-slate-400"
                          }
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-8 border border-slate-200"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-600">
                Yes! You can cancel your subscription at any time. No questions asked, no hidden fees.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Is there a free trial?</h3>
              <p className="text-slate-600">
                Absolutely! Pro and Premium plans come with a 7-day free trial. No credit card required.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-600">
                We accept Khalti and eSewa for secure payments in Nepal. All transactions are encrypted.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-slate-600">
                Yes! You can change your plan anytime. We'll prorate the charges based on your usage.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Do you offer discounts?</h3>
              <p className="text-slate-600">
                Yes! Yearly plans include a 10% discount. We also offer special discounts for bulk purchases.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What if I need help?</h3>
              <p className="text-slate-600">
                Our support team is here to help! Premium members get 24/7 priority support via email and chat.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Ace Your PTE?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of students who have improved their PTE scores with PTEMaster
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button className="bg-white text-teal-600 hover:bg-slate-100 gap-2">
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10 gap-2"
            >
              Schedule Demo
              <Zap className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
