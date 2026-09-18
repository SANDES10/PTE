import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity, Users, Settings, Database, AlertCircle, LogOut,
  TrendingUp, Server, Shield, Lock, FileText, BarChart3,
  Download, Upload, RefreshCw, Trash2, Eye, Edit, CheckCircle,
  Clock, Zap, HardDrive, Cpu, MemoryStick, Search,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SystemAdminPanel() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("health");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real data from backend
  const { data: systemStats, isLoading: statsLoading } = trpc.systemAdmin.getSystemStats.useQuery();
  const { data: systemHealth, isLoading: healthLoading } = trpc.systemAdmin.getSystemHealth.useQuery();
  const { data: activityLogs, isLoading: logsLoading } = trpc.systemAdmin.getActivityLogs.useQuery({
    limit: 50,
    offset: 0,
  });
  const { data: alerts, isLoading: alertsLoading } = trpc.systemAdmin.getSystemAlerts.useQuery();
  const { data: performanceMetrics, isLoading: metricsLoading } = trpc.systemAdmin.getPerformanceMetrics.useQuery();

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

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-12 bg-slate-600 rounded-lg animate-pulse" />
      ))}
    </div>
  );

  // Empty state
  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
      <p className="text-slate-400">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">System Admin Panel</h1>
              <p className="text-xs text-slate-400">Senior Administrator Control</p>
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
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* System Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total Users</p>
                    <p className="text-lg font-bold text-white">
                      {statsLoading ? "..." : systemStats?.totalUsers || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            {/* Active Subscriptions */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Active Subscriptions</p>
                    <p className="text-lg font-bold text-white">
                      {statsLoading ? "..." : systemStats?.activeSubscriptions || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total Revenue</p>
                    <p className="text-lg font-bold text-white">
                      ₨{statsLoading ? "..." : (systemStats?.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            {/* Failed Payments */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Failed Payments</p>
                    <p className="text-lg font-bold text-white">
                      {statsLoading ? "..." : systemStats?.failedPayments || 0}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-slate-700 border-slate-600 grid w-full grid-cols-6">
              <TabsTrigger value="health" className="text-white data-[state=active]:bg-red-600">
                <Server className="w-4 h-4 mr-2" />
                Health
              </TabsTrigger>
              <TabsTrigger value="users" className="text-white data-[state=active]:bg-red-600">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="content" className="text-white data-[state=active]:bg-red-600">
                <FileText className="w-4 h-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-white data-[state=active]:bg-red-600">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-white data-[state=active]:bg-red-600">
                <BarChart3 className="w-4 h-4 mr-2" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="alerts" className="text-white data-[state=active]:bg-red-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                Alerts
              </TabsTrigger>
            </TabsList>

            {/* Health Tab */}
            <TabsContent value="health" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Service Status</CardTitle>
                  <CardDescription>Real-time system service monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {healthLoading ? (
                    <LoadingSkeleton />
                  ) : systemHealth?.services && systemHealth.services.length > 0 ? (
                    <div className="space-y-3">
                      {systemHealth.services.map((service, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{service.name}</p>
                            <p className="text-xs text-slate-400">Uptime: {service.uptime}</p>
                          </div>
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {service.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No service data available" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Platform Users</CardTitle>
                  <CardDescription>Manage and monitor user accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search users by email or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  {statsLoading ? (
                    <LoadingSkeleton />
                  ) : systemStats?.totalUsers && systemStats.totalUsers > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Total Users: {systemStats.totalUsers}</p>
                      <p className="text-sm text-slate-400">Active Users: {systemStats.activeUsers}</p>
                    </div>
                  ) : (
                    <EmptyState message="No users found in the system" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Content Management</CardTitle>
                  <CardDescription>Upload and manage PTE questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { type: "Speaking", count: 250 },
                      { type: "Writing", count: 180 },
                      { type: "Reading", count: 320 },
                      { type: "Listening", count: 200 },
                    ].map((content, i) => (
                      <div key={i} className="p-4 bg-slate-600 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-medium">{content.type}</p>
                            <p className="text-2xl font-bold text-teal-400">{content.count}</p>
                          </div>
                          <FileText className="w-8 h-8 text-teal-500" />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700">
                            <Upload className="w-3 h-3 mr-1" />
                            Upload
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">System Configuration</CardTitle>
                  <CardDescription>Manage system-wide settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {[
                      { label: "Email Service", value: "Resend API", status: "configured" },
                      { label: "Payment Gateway", value: "Khalti + eSewa", status: "configured" },
                      { label: "Storage Service", value: "AWS S3", status: "configured" },
                      { label: "Analytics", value: "Custom Dashboard", status: "configured" },
                      { label: "Backup Service", value: "Daily Backups", status: "configured" },
                      { label: "API Rate Limit", value: "1000 req/min", status: "active" },
                    ].map((setting, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{setting.label}</p>
                          <p className="text-sm text-slate-400">{setting.value}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-500">{setting.status}</Badge>
                          <Button size="sm" variant="ghost" className="text-blue-400">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Activity Logs</CardTitle>
                  <CardDescription>Track all system activities and events</CardDescription>
                </CardHeader>
                <CardContent>
                  {logsLoading ? (
                    <LoadingSkeleton />
                  ) : activityLogs && activityLogs.length > 0 ? (
                    <div className="space-y-2">
                      {activityLogs.map((log: any, i: number) => (
                        <div key={i} className="p-3 bg-slate-600 rounded-lg border-l-4 border-teal-500">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-white font-medium">{log.action}</p>
                              <p className="text-sm text-slate-400">
                                {log.userName} on {log.target}
                              </p>
                            </div>
                            <Badge variant={log.status === "success" ? "default" : "destructive"}>
                              {log.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-400">{log.details}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No activity logs available" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">System Alerts</CardTitle>
                  <CardDescription>Critical system notifications and warnings</CardDescription>
                </CardHeader>
                <CardContent>
                  {alertsLoading ? (
                    <LoadingSkeleton />
                  ) : alerts && alerts.length > 0 ? (
                    <div className="space-y-3">
                      {alerts.map((alert: any, i: number) => (
                        <div
                          key={i}
                          className={`p-4 rounded-lg border-l-4 ${
                            alert.severity === "error"
                              ? "bg-red-900/20 border-red-500"
                              : alert.severity === "warning"
                              ? "bg-yellow-900/20 border-yellow-500"
                              : "bg-blue-900/20 border-blue-500"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-white font-medium">{alert.title}</p>
                              <p className="text-sm text-slate-300">{alert.message}</p>
                            </div>
                            <Badge
                              variant={
                                alert.severity === "error"
                                  ? "destructive"
                                  : alert.severity === "warning"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No active alerts" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
