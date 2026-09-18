import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, Users, UserCheck, UserX, DollarSign, Activity, Target,
} from "lucide-react";
import { motion } from "framer-motion";

interface AnalyticsData {
  dau: number;
  mau: number;
  churnRate: number;
  ltv: number;
  avgSessionDuration: number;
  conversionRate: number;
  retentionRate: number;
}

interface AdminAnalyticsProps {
  data?: AnalyticsData;
}

export default function AdminAnalytics({ data }: AdminAnalyticsProps) {
  // Mock data
  const mockData = {
    dau: 342,
    mau: 1234,
    churnRate: 8.5,
    ltv: 4500,
    avgSessionDuration: 24,
    conversionRate: 37,
    retentionRate: 65,
  };

  const analyticsData = data || mockData;

  // User growth data
  const userGrowthData = [
    { date: "Mar 1", users: 800, active: 450 },
    { date: "Mar 3", users: 950, active: 520 },
    { date: "Mar 5", users: 1100, active: 610 },
    { date: "Mar 7", users: 1200, active: 680 },
    { date: "Mar 9", users: 1234, active: 750 },
    { date: "Mar 11", users: 1234, active: 342 },
  ];

  // Retention cohort
  const retentionData = [
    { week: "Week 1", retention: 100, day7: 78, day14: 62, day30: 45 },
    { week: "Week 2", retention: 100, day7: 82, day14: 68, day30: 52 },
    { week: "Week 3", retention: 100, day7: 85, day14: 72 },
    { week: "Week 4", retention: 100, day7: 88 },
  ];

  // Revenue data
  const revenueData = [
    { date: "Mar 1", revenue: 8000, subscriptions: 120 },
    { date: "Mar 3", revenue: 12000, subscriptions: 180 },
    { date: "Mar 5", revenue: 15000, subscriptions: 220 },
    { date: "Mar 7", revenue: 18000, subscriptions: 260 },
    { date: "Mar 9", revenue: 22000, subscriptions: 310 },
    { date: "Mar 11", revenue: 25000, subscriptions: 350 },
  ];

  // Engagement distribution
  const engagementData = [
    { name: "Highly Engaged", value: 35, color: "#14b8a6" },
    { name: "Moderately Engaged", value: 45, color: "#06b6d4" },
    { name: "Low Engagement", value: 15, color: "#64748b" },
    { name: "Inactive", value: 5, color: "#334155" },
  ];

  const KPICard = ({ icon: Icon, label, value, trend, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-slate-700 border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">{label}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
              {trend && (
                <p className={`text-xs mt-2 ${trend > 0 ? "text-green-400" : "text-red-400"}`}>
                  {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last week
                </p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Users}
          label="Daily Active Users"
          value={analyticsData.dau.toLocaleString()}
          trend={12}
          color="bg-blue-500"
        />
        <KPICard
          icon={UserCheck}
          label="Monthly Active Users"
          value={analyticsData.mau.toLocaleString()}
          trend={8}
          color="bg-teal-500"
        />
        <KPICard
          icon={UserX}
          label="Churn Rate"
          value={`${analyticsData.churnRate}%`}
          trend={-2}
          color="bg-red-500"
        />
        <KPICard
          icon={DollarSign}
          label="Lifetime Value"
          value={`₨${(analyticsData.ltv / 1000).toFixed(1)}K`}
          trend={15}
          color="bg-green-500"
        />
      </div>

      {/* User Growth Chart */}
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">User Growth Trend</CardTitle>
          <CardDescription>Total users vs daily active users over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#14b8a6"
                fillOpacity={1}
                fill="url(#colorUsers)"
                name="Total Users"
              />
              <Area
                type="monotone"
                dataKey="active"
                stroke="#06b6d4"
                fillOpacity={1}
                fill="url(#colorActive)"
                name="Active Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Revenue Trend</CardTitle>
            <CardDescription>Monthly recurring revenue and new subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#14b8a6" name="Revenue (₨)" />
                <Bar dataKey="subscriptions" fill="#06b6d4" name="New Subscriptions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Distribution */}
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">User Engagement</CardTitle>
            <CardDescription>Distribution of user engagement levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Retention Cohort */}
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">Retention Cohort Analysis</CardTitle>
          <CardDescription>User retention rates by cohort week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="px-4 py-2 text-left text-sm font-semibold text-slate-300">Cohort</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-slate-300">Week 0</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-slate-300">Day 7</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-slate-300">Day 14</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-slate-300">Day 30</th>
                </tr>
              </thead>
              <tbody>
                {retentionData.map((row, i) => (
                  <tr key={i} className="border-b border-slate-600 hover:bg-slate-600/50">
                    <td className="px-4 py-3 text-sm font-medium text-white">{row.week}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className="bg-teal-500">{row.retention}%</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className="bg-teal-600">{row.day7}%</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.day14 && <Badge className="bg-teal-700">{row.day14}%</Badge>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.day30 && <Badge className="bg-teal-800">{row.day30}%</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">Key Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-600 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">Avg Session Duration</p>
              <p className="text-2xl font-bold text-white">{analyticsData.avgSessionDuration} min</p>
              <p className="text-xs text-teal-400 mt-2">↑ 5% from last week</p>
            </div>
            <div className="p-4 bg-slate-600 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">{analyticsData.conversionRate}%</p>
              <p className="text-xs text-teal-400 mt-2">↑ 3% from last week</p>
            </div>
            <div className="p-4 bg-slate-600 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">Retention Rate</p>
              <p className="text-2xl font-bold text-white">{analyticsData.retentionRate}%</p>
              <p className="text-xs text-teal-400 mt-2">↑ 2% from last week</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
