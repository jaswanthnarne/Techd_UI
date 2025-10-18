// UserManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import UserForm from "../../components/forms/UserFrom";
import { userAPI, submissionAdminAPI } from "../../services/admin";
import {
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Shield,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  User,
  Download,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  Crown,
  Zap,
  Trophy,
  Target,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Memoized fetch functions
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserSubmissions = useCallback(async (userId) => {
    try {
      setSubmissionsLoading(true);
      const response = await submissionAdminAPI.getUserSubmissions(userId);
      const submissions = response.data.submissions || [];
      const user = response.data.user;

      setUserSubmissions(submissions);
      setSelectedUser(user);

      const stats = calculateUserStats(submissions, user);
      setUserStats(stats);
    } catch (error) {
      toast.error("Failed to fetch user submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Memoized calculations
  const calculateUserStats = useCallback((submissions, user) => {
    const totalSubmissions = submissions.length;
    const approvedSubmissions = submissions.filter(
      (sub) => sub.submissionStatus === "approved"
    ).length;
    const pendingSubmissions = submissions.filter(
      (sub) => sub.submissionStatus === "pending"
    ).length;
    const rejectedSubmissions = submissions.filter(
      (sub) => sub.submissionStatus === "rejected"
    ).length;

    const totalPoints = submissions.reduce(
      (sum, sub) => sum + (sub.points || 0),
      0
    );
    const averagePoints =
      totalSubmissions > 0 ? Math.round(totalPoints / totalSubmissions) : 0;
    const successRate =
      totalSubmissions > 0
        ? Math.round((approvedSubmissions / totalSubmissions) * 100)
        : 0;

    const recentSubmissions = submissions
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5);

    return {
      totalSubmissions,
      approvedSubmissions,
      pendingSubmissions,
      rejectedSubmissions,
      totalPoints,
      averagePoints,
      successRate,
      recentSubmissions,
      user,
    };
  }, []);

  // Memoized handlers
  const handleCreateUser = useCallback(
    async (data) => {
      try {
        setActionLoading(true);
        await userAPI.createUser(data);
        toast.success("User created successfully");
        setShowModal(false);
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to create user");
      } finally {
        setActionLoading(false);
      }
    },
    [fetchUsers]
  );

  const handleUpdateUser = useCallback(
    async (data) => {
      try {
        setActionLoading(true);
        await userAPI.updateUser(editingUser._id, data);
        toast.success("User updated successfully");
        setShowModal(false);
        setEditingUser(null);
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to update user");
      } finally {
        setActionLoading(false);
      }
    },
    [editingUser, fetchUsers]
  );

  const handleDeleteUser = useCallback(
    async (id) => {
      if (!confirm("Are you sure you want to delete this user?")) return;

      try {
        await userAPI.deleteUser(id);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    },
    [fetchUsers]
  );

  // const handleResetPassword = useCallback(async (id) => {
  //   if (
  //     !confirm(
  //       "Reset password for this user? They will receive an email with temporary password."
  //     )
  //   )
  //     return;

  //   try {
  //     await userAPI.resetPassword(id);
  //     toast.success("Password reset successfully");
  //   } catch (error) {
  //     toast.error("Failed to reset password");
  //   }
  // }, []);

  const handleToggleStatus = useCallback(
    async (user) => {
      try {
        await userAPI.updateUser(user._id, { isActive: !user.isActive });
        toast.success(
          `User ${!user.isActive ? "activated" : "deactivated"} successfully`
        );
        fetchUsers();
      } catch (error) {
        toast.error("Failed to update user status");
      }
    },
    [fetchUsers]
  );

  const openEditModal = useCallback((user) => {
    setEditingUser(user);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingUser(null);
  }, []);

  const closeSubmissionsModal = useCallback(() => {
    setSelectedUser(null);
    setUserSubmissions([]);
    setUserStats(null);
  }, []);

  const toggleRowExpansion = useCallback((userId) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(userId)) {
        newExpanded.delete(userId);
      } else {
        newExpanded.add(userId);
      }
      return newExpanded;
    });
  }, []);

  // Memoized badge components
  const getRoleBadge = useCallback((role) => {
    const isAdmin = role === "admin";
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
          isAdmin
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow"
            : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow"
        }`}
      >
        <Shield className="h-3 w-3 mr-1" />
        {isAdmin ? "Admin" : "Student"}
      </span>
    );
  }, []);

  const getStatusBadge = useCallback((isActive) => {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
          isActive
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow"
            : "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow"
        }`}
      >
        {isActive ? (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </>
        ) : (
          <>
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </>
        )}
      </span>
    );
  }, []);

  const getSubmissionStatusBadge = useCallback((status) => {
    const statusConfig = {
      pending: {
        color: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white",
        icon: Clock,
        label: "Pending",
      },
      approved: {
        color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        color: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
        icon: XCircle,
        label: "Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shadow transition-colors ${config.color}`}
      >
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  }, []);

  // Memoized export function
  const exportUserSubmissions = useCallback(() => {
    if (!selectedUser) return;

    const headers = [
      "CTF Title",
      "Category",
      "Submitted At",
      "Status",
      "Points",
      "Flag",
      "Screenshot URL",
      "Attempt Number",
      "Reviewed By",
      "Reviewed At",
      "Admin Feedback",
    ];

    const csvContent = [
      headers.join(","),
      ...userSubmissions.map((sub) =>
        [
          `"${sub.ctf?.title || "Unknown"}"`,
          `"${sub.ctf?.category || "No category"}"`,
          `"${new Date(sub.submittedAt).toLocaleString()}"`,
          `"${sub.submissionStatus}"`,
          `"${sub.points || 0}"`,
          `"${sub.flag}"`,
          `"${sub.screenshot?.url || "N/A"}"`,
          `"${sub.attemptNumber || 1}"`,
          `"${sub.reviewedBy ? sub.reviewedBy.fullName : "N/A"}"`,
          `"${
            sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleString() : "N/A"
          }"`,
          `"${sub.adminFeedback || "N/A"}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedUser.fullName}-submissions.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Submissions exported successfully");
  }, [selectedUser, userSubmissions]);

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Memoized stats
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((user) => user.isActive).length,
      inactive: users.filter((user) => !user.isActive).length,
      admins: users.filter((user) => user.role === "admin").length,
      students: users.filter((user) => user.role === "student").length,
      verified: users.filter((user) => user.isVerified).length,
      totalSubmissions: users.reduce(
        (total, user) => total + (user.submissionsCount || 0),
        0
      ),
    };
  }, [users]);

  // Optimized StatCard component
  const StatCard = useCallback(
    ({ title, value, description, icon: Icon, color = "blue" }) => {
      const colorClasses = {
        blue: {
          bg: "bg-gradient-to-br from-blue-50 to-blue-100",
          iconBg: "bg-gradient-to-r from-blue-500 to-cyan-500",
          text: "text-blue-700",
        },
        green: {
          bg: "bg-gradient-to-br from-green-50 to-green-100",
          iconBg: "bg-gradient-to-r from-green-500 to-emerald-500",
          text: "text-green-700",
        },
        purple: {
          bg: "bg-gradient-to-br from-purple-50 to-purple-100",
          iconBg: "bg-gradient-to-r from-purple-500 to-pink-500",
          text: "text-purple-700",
        },
        yellow: {
          bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
          iconBg: "bg-gradient-to-r from-yellow-500 to-amber-500",
          text: "text-yellow-700",
        },
      }[color];

      return (
        <Card
          className={`border-0 shadow-lg transition-all duration-200 hover:shadow-xl ${colorClasses.bg}`}
        >
          <Card.Content className="p-6">
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-2xl shadow-lg ${colorClasses.iconBg}`}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                {description && (
                  <p
                    className={`text-sm ${colorClasses.text} font-medium mt-1`}
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>
          </Card.Content>
        </Card>
      );
    },
    []
  );

  // Optimized table row component
  const UserTableRow = useCallback(
    ({ user }) => {
      const isExpanded = expandedRows.has(user._id);

      return (
        <React.Fragment>
          <tr className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-colors duration-150">
            <td className="px-6 py-4">
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleRowExpansion(user._id)}
                  className="flex-shrink-0 p-2 hover:bg-white rounded-xl transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-purple-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-purple-600" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => fetchUserSubmissions(user._id)}
                    className="text-left hover:text-purple-700 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 mb-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform shadow-lg">
                        {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-purple-700">
                          {user.fullName}
                        </h3>
                        <p className="text-sm text-gray-500 group-hover:text-purple-600 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {user.contactNumber && (
                  <div className="flex items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                    <Phone className="h-4 w-4 mr-2 text-blue-500" />
                    {user.contactNumber}
                  </div>
                )}
              </div>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                {user.specialization || "N/A"}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
                {user.expertiseLevel || "Beginner"}
              </span>
            </td>
            <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
            <td className="px-6 py-4">{getStatusBadge(user.isActive)}</td>
            <td className="px-6 py-4">
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString()
                  : "Never"}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => openEditModal(user)}
                  className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all border-2 border-transparent hover:border-blue-200"
                  title="Edit User"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleToggleStatus(user)}
                  className={`p-3 rounded-xl transition-all border-2 border-transparent hover:shadow-md ${
                    user.isActive
                      ? "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 hover:border-yellow-200"
                      : "text-green-600 hover:text-green-800 hover:bg-green-50 hover:border-green-200"
                  }`}
                  title={user.isActive ? "Deactivate" : "Activate"}
                >
                  {user.isActive ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                </button>
                {/* <button
                  onClick={() => handleResetPassword(user._id)}
                  className="p-3 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-xl transition-all border-2 border-transparent hover:border-orange-200"
                  title="Reset Password"
                >
                  <Mail className="h-4 w-4" />
                </button> */}
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all border-2 border-transparent hover:border-red-200"
                  title="Delete User"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
          {isExpanded && (
            <tr className="bg-gradient-to-r from-blue-50/50 to-purple-50/50">
              <td colSpan="8" className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">
                      User Information
                    </h4>
                    <div className="space-y-2">
                      <p className="flex items-center space-x-2">
                        <span className="text-gray-600 font-medium">
                          Semester:
                        </span>
                        <span className="bg-white px-3 py-1 rounded-lg border border-gray-200">
                          {user.Sem || "N/A"}
                        </span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <span className="text-gray-600 font-medium">
                          Verified:
                        </span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                            user.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isVerified ? "Yes" : "No"}
                        </span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <span className="text-gray-600 font-medium">
                          Joined:
                        </span>
                        <span className="bg-white px-3 py-1 rounded-lg border border-gray-200">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">
                      Quick Actions
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => fetchUserSubmissions(user._id)}
                        className="inline-flex items-center px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Activity
                      </button>
                      {/* <button
                        onClick={() => handleResetPassword(user._id)}
                        className="inline-flex items-center px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Reset Password
                      </button> */}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    },
    [
      expandedRows,
      toggleRowExpansion,
      fetchUserSubmissions,
      getRoleBadge,
      getStatusBadge,
      openEditModal,
      handleToggleStatus,
      // handleResetPassword,
      handleDeleteUser,
    ]
  );

  return (
    <Layout
      title="User Management"
      subtitle="Manage platform users and their access"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-12">
        {/* Hero Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              USER COMMAND CENTER
            </h1>
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage user accounts, permissions, and platform access
          </p>
        </div>

        {/* Control Panel */}
        <Card className="border-0 shadow-xl mb-8 bg-white/80 backdrop-blur-sm">
          <Card.Content className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    User Control Panel
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Real-time user management
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={fetchUsers}
                  className="flex items-center space-x-2 border-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Data</span>
                </Button>

                <Button
                  onClick={() => setShowModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create User</span>
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.total}
            description="Platform population"
            icon={User}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={stats.active}
            description="Currently engaged"
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="Administrators"
            value={stats.admins}
            description="System operators"
            icon={Shield}
            color="purple"
          />
          <StatCard
            title="Students"
            value={stats.students}
            description="Platform participants"
            icon={Award}
            color="yellow"
          />
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-xl mb-6 bg-white/80 backdrop-blur-sm">
          <Card.Content className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/50"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/50"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="student">Student</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/50"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Users Table - Desktop View */}
        <Card className="hidden lg:block border-0 shadow-xl">
          <Card.Content className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Expertise
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center">
                        <div className="flex justify-center items-center space-x-3">
                          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-purple-600 h-8 w-8"></div>
                          <span className="text-gray-600 font-medium">
                            Loading users...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <UserTableRow key={user._id} user={user} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center">
                        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          No Users Found
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          {searchTerm ||
                          roleFilter !== "all" ||
                          statusFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Get started by creating your first user"}
                        </p>
                        <Button
                          onClick={() => setShowModal(true)}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create User
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>

        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            <Card className="border-0 shadow-xl">
              <Card.Content className="p-8 text-center">
                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-purple-600 h-8 w-8 mx-auto"></div>
                <p className="mt-3 text-gray-600 font-medium">
                  Loading users...
                </p>
              </Card.Content>
            </Card>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card
                key={user._id}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
              >
                <Card.Content className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <button
                        onClick={() => fetchUserSubmissions(user._id)}
                        className="text-left hover:text-purple-700 transition-colors group w-full"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform shadow-lg">
                            {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 group-hover:text-purple-700 text-lg">
                              {user.fullName}
                            </h3>
                            <p className="text-sm text-gray-500 group-hover:text-purple-600 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMobileMenuOpen(
                            mobileMenuOpen === user._id ? null : user._id
                          )
                        }
                        className="p-3 hover:bg-gray-100 rounded-xl border-2 border-gray-200"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>

                      {mobileMenuOpen === user._id && (
                        <div className="absolute right-0 top-12 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 w-48">
                          <button
                            onClick={() => {
                              openEditModal(user);
                              setMobileMenuOpen(null);
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-blue-700 hover:bg-blue-50 rounded-t-xl border-b border-gray-200"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit User</span>
                          </button>
                          <button
                            onClick={() => {
                              handleToggleStatus(user);
                              setMobileMenuOpen(null);
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-yellow-700 hover:bg-yellow-50 border-b border-gray-200"
                          >
                            {user.isActive ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                            <span>
                              {user.isActive ? "Deactivate" : "Activate"}
                            </span>
                          </button>
                          {/* <button
                            onClick={() => {
                              handleResetPassword(user._id);
                              setMobileMenuOpen(null);
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-orange-700 hover:bg-orange-50 border-b border-gray-200"
                          >
                            <Mail className="h-4 w-4" />
                            <span>Reset Password</span>
                          </button> */}
                          <button
                            onClick={() => {
                              handleDeleteUser(user._id);
                              setMobileMenuOpen(null);
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 rounded-b-xl"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete User</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 font-medium">
                        Role
                      </div>
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 font-medium">
                        Status
                      </div>
                      {getStatusBadge(user.isActive)}
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 font-medium">
                        Expertise
                      </div>
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
                        {user.expertiseLevel || "Beginner"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 font-medium">
                        Last Login
                      </div>
                      <div className="text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : "Never"}
                      </div>
                    </div>
                  </div>

                  {user.contactNumber && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span>{user.contactNumber}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => fetchUserSubmissions(user._id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Activity
                    </button>
                  </div>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card className="border-0 shadow-xl">
              <Card.Content className="p-8 text-center">
                <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Users Found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first user"}
                </p>
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </Card.Content>
            </Card>
          )}
        </div>

        {/* User Submissions Modal */}
        <Modal
          isOpen={!!selectedUser}
          onClose={closeSubmissionsModal}
          size="max-w-7xl"
        >
          {selectedUser && (
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedUser.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {selectedUser.fullName}
                    </h2>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getRoleBadge(selectedUser.role)}
                      {getStatusBadge(selectedUser.isActive)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={exportUserSubmissions}
                    className="flex items-center space-x-2 border-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </Button>
                  <Button
                    onClick={closeSubmissionsModal}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg"
                  >
                    Close
                  </Button>
                </div>
              </div>

              {/* User Stats */}
              {userStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg">
                    <Card.Content className="p-4 text-center">
                      <div className="text-2xl font-black text-blue-700">
                        {userStats.totalSubmissions}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">
                        Total Submissions
                      </div>
                    </Card.Content>
                  </Card>
                  <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
                    <Card.Content className="p-4 text-center">
                      <div className="text-2xl font-black text-green-700">
                        {userStats.approvedSubmissions}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Approved
                      </div>
                    </Card.Content>
                  </Card>
                  <Card className="border-0 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg">
                    <Card.Content className="p-4 text-center">
                      <div className="text-2xl font-black text-yellow-700">
                        {userStats.pendingSubmissions}
                      </div>
                      <div className="text-sm text-yellow-600 font-medium">
                        Pending
                      </div>
                    </Card.Content>
                  </Card>
                  <Card className="border-0 bg-gradient-to-br from-red-50 to-pink-50 shadow-lg">
                    <Card.Content className="p-4 text-center">
                      <div className="text-2xl font-black text-red-700">
                        {userStats.rejectedSubmissions}
                      </div>
                      <div className="text-sm text-red-600 font-medium">
                        Rejected
                      </div>
                    </Card.Content>
                  </Card>
                </div>
              )}

              {/* Submissions Table */}
              <Card className="border-0 shadow-xl">
                <Card.Content className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-600 to-blue-600">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                            CTF Challenge
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                            Submitted At
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                            Points
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {submissionsLoading ? (
                          <tr>
                            <td colSpan="6" className="px-4 py-8 text-center">
                              <div className="flex justify-center items-center space-x-3">
                                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-purple-600 h-6 w-6"></div>
                                <span className="text-gray-600">
                                  Loading submissions...
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : userSubmissions.length > 0 ? (
                          userSubmissions.map((submission) => (
                            <tr
                              key={submission._id}
                              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="text-sm font-bold text-gray-900">
                                  {submission.ctf?.title || "Unknown CTF"}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                                  {submission.ctf?.category || "No category"}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                                  {new Date(
                                    submission.submittedAt
                                  ).toLocaleString()}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {getSubmissionStatusBadge(
                                  submission.submissionStatus
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-lg font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                  {submission.points || 0}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() =>
                                    window.open(
                                      submission.screenshot?.url,
                                      "_blank"
                                    )
                                  }
                                  className="inline-flex items-center px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-4 py-12 text-center">
                              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No Submissions Found
                              </h3>
                              <p className="text-gray-500">
                                This user hasn't submitted any CTF challenges
                                yet.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card.Content>
              </Card>
            </div>
          )}
        </Modal>

        {/* Create/Edit User Modal */}
        <Modal isOpen={showModal} onClose={closeModal} size="max-w-2xl">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {editingUser ? "Edit User" : "Create New User"}
              </h2>
            </div>
            <UserForm
              user={editingUser}
              onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
              onCancel={closeModal}
              loading={actionLoading}
            />
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default UserManagement;
