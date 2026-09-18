import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, CreditCard, BarChart3, Settings, LogOut,
  TrendingUp, DollarSign, ShoppingCart, AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import AdminUserManagement from "@/components/AdminUserManagement";
import AdminAnalytics from "@/components/AdminAnalytics";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      window.location.href = "/";
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  // Mock data - in production, fetch from API
  const stats = {
    totalUsers: 1234,
    activeSubscriptions: 456,
    totalRevenue: 2500000, // NPR
    storageUsed: 125.5, // GB
    monthlyGrowth: 12.5, // %
    conversionRate: 37, // %
  };

  const revenueByGateway = [
    { gateway: "Khalti", amount: 1500000, percentage: 60 },
    { gateway: "eSewa", amount: 1000000, percentage: 40 },
  ];

  const subscriptionPlans = [
    { name: "Free", users: 500, revenue: 0 },
    { name: "Pro", users: 300, revenue: 1500000 },
    { name: "Premium", users: 156, revenue: 1000000 },
  ];

  const recentPayments = [
    { id: 1, user: "User #1234", amount: 999, gateway: "Khalti", date: "2 hours ago", status: "completed" },
    { id: 2, user: "User #5678", amount: 1999, gateway: "eSewa", date: "4 hours ago", status: "completed" },
    { id: 3, user: "User #9012", amount: 499, gateway: "Khalti", date: "1 day ago", status: "pending" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-slate-400">PTEMaster Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Users",
              value: stats.totalUsers.toLocaleString(),
              icon: Users,
              color: "bg-blue-500",
              trend: `+${stats.monthlyGrowth}% this month`,
            },
            {
              label: "Active Subscriptions",
              value: stats.activeSubscriptions.toLocaleString(),
              icon: ShoppingCart,
              color: "bg-teal-500",
              trend: `${stats.conversionRate}% conversion`,
            },
            {
              label: "Total Revenue",
              value: `₨${(stats.totalRevenue / 100000).toFixed(1)}L`,
              icon: DollarSign,
              color: "bg-green-500",
              trend: "All time",
            },
            {
              label: "Storage Used",
              value: `${stats.storageUsed.toFixed(1)} GB`,
              icon: BarChart3,
              color: "bg-purple-500",
              trend: "of unlimited",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-slate-700 border-slate-600 hover:border-slate-500 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-slate-500 mt-2">{stat.trend}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-700 border-slate-600">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Revenue by Gateway */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Revenue by Gateway</CardTitle>
                  <CardDescription>Payment method breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {revenueByGateway.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-white font-medium">{item.gateway}</span>
                        <span className="text-sm text-teal-400">₨{(item.amount / 100000).toFixed(1)}L</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-teal-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.percentage}% of revenue</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Subscriptions by Plan */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Subscriptions by Plan</CardTitle>
                  <CardDescription>Active users per plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscriptionPlans.map((plan, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{plan.name}</p>
                        <p className="text-sm text-slate-400">{plan.users} users</p>
                      </div>
                      <Badge variant={plan.name === "Free" ? "secondary" : "default"}>
                        ₨{plan.revenue > 0 ? (plan.revenue / 100000).toFixed(0) + "L" : "Free"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Payments */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Recent Payments</CardTitle>
                <CardDescription>Latest 10 transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{payment.user}</p>
                          <p className="text-xs text-slate-400">{payment.gateway} • {payment.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-white">₨{payment.amount}</span>
                        <Badge
                          variant={payment.status === "completed" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Billing Management</CardTitle>
                <CardDescription>Revenue and subscription tracking</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-40 text-slate-400">
                  <div className="text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Billing dashboard coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Settings</CardTitle>
                <CardDescription>Platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-600 rounded-lg border border-slate-500">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Payment Gateway Configuration</h4>
                        <p className="text-sm text-slate-400 mb-3">
                          Configure your eSewa and Khalti merchant accounts in environment variables
                        </p>
                        <div className="text-xs text-slate-500 space-y-1 font-mono">
                          <p>ESEWA_MERCHANT_CODE=your_merchant_code</p>
                          <p>KHALTI_PUBLIC_KEY=your_public_key</p>
                          <p>KHALTI_SECRET_KEY=your_secret_key</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
