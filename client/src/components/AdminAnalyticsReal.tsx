import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

export function AdminAnalyticsReal() {
  const [days, setDays] = useState(30);

  // Fetch all analytics data
  const { data: engagement, isLoading: engagementLoading } = trpc.systemAdmin.getUserEngagement.useQuery({ days });
  const { data: performance, isLoading: performanceLoading } = trpc.systemAdmin.getLearningPerformance.useQuery({ days });
  const { data: revenue, isLoading: revenueLoading } = trpc.systemAdmin.getPaymentRevenue.useQuery({ days });
  const { data: churn, isLoading: churnLoading } = trpc.systemAdmin.getChurnRetention.useQuery({ days });
  const { data: clv, isLoading: clvLoading } = trpc.systemAdmin.getCustomerLTV.useQuery();

  const isLoading = engagementLoading || performanceLoading || revenueLoading || churnLoading || clvLoading;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              days === d
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Last {d} days
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <Tabs defaultValue="engagement" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="churn">Churn</TabsTrigger>
            <TabsTrigger value="ltv">LTV</TabsTrigger>
          </TabsList>

          {/* User Engagement Tab */}
          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{engagement?.totalUsers || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Users (Last {days}d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{engagement?.activeUsers || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* DAU Chart */}
            {engagement?.dau && engagement.dau.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Daily Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagement.dau}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#0088FE" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Login Frequency */}
            {engagement?.loginFrequency && engagement.loginFrequency.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>User Activity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {engagement.loginFrequency.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm">{item.frequency}</span>
                        <span className="font-bold">{item.userCount} users</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Learning Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            {/* Score Distribution */}
            {performance?.scoreDistribution && performance.scoreDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={performance.scoreDistribution}
                        dataKey="count"
                        nameKey="band"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {performance.scoreDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Scores by Task Type */}
            {performance?.scoresByTaskType && performance.scoresByTaskType.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Average Scores by Task Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performance.scoresByTaskType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="taskType" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Weak Areas */}
            {performance?.weakAreas && performance.weakAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Weak Areas (Lowest Scores)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {performance.weakAreas.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="font-medium">{item.taskType}</span>
                        <div className="text-right">
                          <div className="font-bold">{(item.avgScore || 0).toFixed(1)}</div>
                          <div className="text-xs text-gray-600">{item.attempts} attempts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">NPR {(revenue?.totalRevenue || 0).toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Failed Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{revenue?.failedPayments || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue by Method */}
            {revenue?.revenueByMethod && revenue.revenueByMethod.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenue.revenueByMethod}
                        dataKey="total"
                        nameKey="method"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {revenue.revenueByMethod.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Daily Revenue */}
            {revenue?.dailyRevenue && revenue.dailyRevenue.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Daily Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenue.dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#FFBB28" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Subscription Breakdown */}
            {revenue?.subscriptionBreakdown && revenue.subscriptionBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Subscriptions by Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {revenue.subscriptionBreakdown.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span className="font-medium">{item.plan}</span>
                        <div className="text-right">
                          <div className="font-bold">{item.count} active</div>
                          <div className="text-xs text-gray-600">MRR: NPR {(item.totalMrr || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Churn Tab */}
          <TabsContent value="churn" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{churn?.active || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Churned (Last {days}d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{churn?.churned || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{(churn?.churnRate || 0).toFixed(2)}%</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* LTV Tab */}
          <TabsContent value="ltv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Average Customer Lifetime Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-teal-600">NPR {(clv?.averageClv || 0).toLocaleString()}</div>
              </CardContent>
            </Card>

            {clv?.topCustomers && clv.topCustomers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Customers by LTV</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {clv.topCustomers.slice(0, 10).map((customer: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">User #{customer.userId}</span>
                        <div className="text-right">
                          <div className="font-bold">NPR {(customer.totalSpent || 0).toLocaleString()}</div>
                          <div className="text-xs text-gray-600">{customer.transactionCount} transactions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
