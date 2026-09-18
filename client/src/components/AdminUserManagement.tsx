import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, Filter, MoreVertical, Ban, Crown, Trash2, Eye, Mail,
  UserPlus, Download, ArrowUpDown,
} from "lucide-react";
import { motion } from "framer-motion";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  lastSignedIn: string;
  status: "active" | "inactive" | "banned";
  sessionsCount: number;
  totalScore?: number;
}

interface AdminUserManagementProps {
  users?: User[];
  onUserAction?: (userId: number, action: string) => void;
}

export default function AdminUserManagement({ users = [], onUserAction }: AdminUserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "user" | "admin">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "banned">("all");
  const [sortBy, setSortBy] = useState<"name" | "created" | "lastSignedIn">("created");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Mock data if not provided
  const mockUsers: User[] = [
    {
      id: 1,
      name: "Raj Kumar",
      email: "raj@example.com",
      role: "user",
      createdAt: "2026-01-15T10:30:00Z",
      lastSignedIn: "2026-03-12T08:20:00Z",
      status: "active",
      sessionsCount: 24,
      totalScore: 72,
    },
    {
      id: 2,
      name: "Priya Singh",
      email: "priya@example.com",
      role: "user",
      createdAt: "2026-02-01T14:45:00Z",
      lastSignedIn: "2026-03-11T15:30:00Z",
      status: "active",
      sessionsCount: 18,
      totalScore: 68,
    },
    {
      id: 3,
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      createdAt: "2025-12-01T09:00:00Z",
      lastSignedIn: "2026-03-12T09:00:00Z",
      status: "active",
      sessionsCount: 156,
      totalScore: 85,
    },
  ];

  const displayUsers = users.length > 0 ? users : mockUsers;

  // Filter and search
  const filteredUsers = displayUsers
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "lastSignedIn":
          return new Date(b.lastSignedIn).getTime() - new Date(a.lastSignedIn).getTime();
        default:
          return 0;
      }
    });

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "banned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">User Management</h3>
          <p className="text-sm text-slate-400">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button size="sm" className="gap-2 bg-teal-600 hover:bg-teal-700">
            <UserPlus className="w-4 h-4" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as any)}
          className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-teal-500"
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-teal-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg flex items-center justify-between"
        >
          <span className="text-sm text-teal-300">
            {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              Ban Selected
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Clear Selection
            </Button>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      <Card className="bg-slate-700 border-slate-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600 bg-slate-800">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map((u) => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                  <button
                    onClick={() => setSortBy("name")}
                    className="flex items-center gap-2 hover:text-white"
                  >
                    Name <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Sessions</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                  <button
                    onClick={() => setSortBy("lastSignedIn")}
                    className="flex items-center gap-2 hover:text-white"
                  >
                    Last Seen <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-slate-600 hover:bg-slate-600/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-4 h-4 rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{user.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${user.email}`} className="text-teal-400 hover:text-teal-300 text-sm">
                      {user.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{user.sessionsCount}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{formatDate(user.lastSignedIn)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onUserAction?.(user.id, "view")}
                        className="p-2 hover:bg-slate-500 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-slate-400" />
                      </button>
                      {user.role === "user" && (
                        <button
                          onClick={() => onUserAction?.(user.id, "promote")}
                          className="p-2 hover:bg-slate-500 rounded transition-colors"
                          title="Promote to Admin"
                        >
                          <Crown className="w-4 h-4 text-slate-400" />
                        </button>
                      )}
                      {user.status !== "banned" && (
                        <button
                          onClick={() => onUserAction?.(user.id, "ban")}
                          className="p-2 hover:bg-slate-500 rounded transition-colors"
                          title="Ban User"
                        >
                          <Ban className="w-4 h-4 text-slate-400" />
                        </button>
                      )}
                      <button
                        onClick={() => onUserAction?.(user.id, "delete")}
                        className="p-2 hover:bg-red-500/20 rounded transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">No users found matching your filters</p>
          </CardContent>
        )}
      </Card>

      {/* Pagination */}
      {filteredUsers.length > 10 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing 1-10 of {filteredUsers.length} users
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
