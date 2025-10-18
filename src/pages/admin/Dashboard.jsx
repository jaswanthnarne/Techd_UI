import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import {
  Users,
  Flag,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  LogIn,
  UserCheck,
  Activity,
  Eye,
  EyeOff,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Crown,
  Zap,
  Target,
  Trophy,
  Shield,
  Rocket,
  BarChart3,
  Settings,
  Gamepad2,
  Cpu,
} from "lucide-react";
import { analyticsAPI, ctfAPI, userAPI } from "../../services/admin";
import toast from "react-hot-toast";

// Enhanced StatCard Component
const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  color = "blue",
  onClick,
  clickable = false,
}) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: {
        gradient: "from-blue-500 to-cyan-500",
        bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
        iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
        text: "text-blue-700",
      },
      green: {
        gradient: "from-green-500 to-emerald-500",
        bg: "bg-gradient-to-br from-green-50 to-emerald-50",
        iconBg: "bg-gradient-to-br from-green-500 to-emerald-500",
        text: "text-green-700",
      },
      yellow: {
        gradient: "from-yellow-500 to-amber-500",
        bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
        iconBg: "bg-gradient-to-br from-yellow-500 to-amber-500",
        text: "text-yellow-700",
      },
      purple: {
        gradient: "from-purple-500 to-pink-500",
        bg: "bg-gradient-to-br from-purple-50 to-pink-50",
        iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
        text: "text-purple-700",
      },
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses(color);

  return (
    <Card
      className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
        clickable ? "cursor-pointer" : ""
      } ${colorClasses.bg}`}
      onClick={onClick}
    >
      <Card.Content className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <div
                className={`p-3 rounded-2xl ${colorClasses.iconBg} shadow-lg`}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {title}
                </dt>
                <dd className="text-2xl font-bold text-gray-900 mt-1">
                  {value}
                </dd>
              </div>
            </div>
            {description && (
              <p className={`text-sm ${colorClasses.text} font-medium`}>
                {description}
              </p>
            )}
          </div>
          {clickable && (
            <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

// Enhanced Recent Login Card Component
const RecentLoginCard = ({ user, index }) => {
  const getTimeAgo = (date) => {
    if (!date) return "Never";
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      : "bg-gradient-to-r from-red-500 to-pink-500 text-white";
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      superadmin: "bg-gradient-to-r from-red-500 to-orange-500 text-white",
      student: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
      user: "bg-gradient-to-r from-gray-500 to-gray-700 text-white",
    };
    return colors[role] || colors.user;
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:border-blue-200 transition-all group">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform shadow-lg">
          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.fullName || "Unknown User"}
            </p>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getRoleColor(
                user?.role
              )}`}
            >
              {user?.role || "user"}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate">
            {user?.email || "No email"}
          </p>
          <p className="text-xs text-gray-500">
            Last login: {getTimeAgo(user?.lastLogin)}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
            user?.isActive
          )}`}
        >
          {user?.isActive ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  );
};

// Enhanced Recent Activity Card Component
const RecentActivityCard = ({ activity, index }) => {
  const activityType = activity?.type || "unknown";
  const isCorrect = activity?.isCorrect || false;

  const getActivityIcon = (type, isCorrect) => {
    if (type === "submission") {
      return isCorrect ? (
        <CheckCircle className="h-4 w-4 text-white" />
      ) : (
        <AlertCircle className="h-4 w-4 text-white" />
      );
    } else if (type === "ctf_published") {
      return <Eye className="h-4 w-4 text-white" />;
    } else if (type === "ctf_unpublished") {
      return <EyeOff className="h-4 w-4 text-white" />;
    } else if (type === "ctf_activated") {
      return <PlayCircle className="h-4 w-4 text-white" />;
    } else if (type === "ctf_deactivated") {
      return <PauseCircle className="h-4 w-4 text-white" />;
    }
    return <Activity className="h-4 w-4 text-white" />;
  };

  const getActivityMessage = (activity) => {
    const type = activity?.type || "unknown";

    if (type === "submission") {
      return `${activity.user?.fullName || "Unknown user"} submitted to ${
        activity.ctf?.title || "Unknown CTF"
      }`;
    } else if (type === "ctf_published") {
      return `CTF "${activity.ctfTitle || "Unknown CTF"}" was published`;
    } else if (type === "ctf_unpublished") {
      return `CTF "${activity.ctfTitle || "Unknown CTF"}" was unpublished`;
    } else if (type === "ctf_activated") {
      return `CTF "${activity.ctfTitle || "Unknown CTF"}" was activated`;
    } else if (type === "ctf_deactivated") {
      return `CTF "${activity.ctfTitle || "Unknown CTF"}" was deactivated`;
    } else if (type === "login") {
      return `${activity.user?.fullName || "Unknown user"} logged in`;
    }
    return "Unknown activity";
  };

  const getActivityStatus = (type, isCorrect) => {
    if (type === "submission") {
      return isCorrect ? "Solved" : "Failed";
    } else if (type.startsWith("ctf_")) {
      return (
        type.replace("ctf_", "").charAt(0).toUpperCase() +
        type.replace("ctf_", "").slice(1)
      );
    } else if (type === "login") {
      return "Login";
    }
    return "Activity";
  };

  const getStatusColor = (type, isCorrect) => {
    if (type === "submission") {
      return isCorrect
        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
        : "bg-gradient-to-r from-red-500 to-pink-500 text-white";
    } else if (type.startsWith("ctf_")) {
      return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
    } else if (type === "login") {
      return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
    }
    return "bg-gradient-to-r from-gray-500 to-gray-700 text-white";
  };

  const getIconColor = (type, isCorrect) => {
    if (type === "submission") {
      return isCorrect
        ? "bg-gradient-to-r from-green-500 to-emerald-500"
        : "bg-gradient-to-r from-red-500 to-pink-500";
    } else if (type.startsWith("ctf_")) {
      return "bg-gradient-to-r from-blue-500 to-cyan-500";
    } else if (type === "login") {
      return "bg-gradient-to-r from-purple-500 to-pink-500";
    }
    return "bg-gradient-to-r from-gray-500 to-gray-700";
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:border-purple-200 transition-all group">
      <div className="flex-shrink-0">
        <div
          className={`p-3 rounded-xl shadow-lg ${getIconColor(
            activityType,
            isCorrect
          )}`}
        >
          {getActivityIcon(activityType, isCorrect)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
          {getActivityMessage(activity)}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {new Date(
            activity?.timestamp || activity?.submittedAt || Date.now()
          ).toLocaleString()}
        </p>
        {activity?.points && (
          <p className="text-xs text-gray-500 mt-1">
            {isCorrect ? `+${activity.points} points` : "No points awarded"}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(
            activityType,
            isCorrect
          )}`}
        >
          {getActivityStatus(activityType, isCorrect)}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [comprehensiveAnalytics, setComprehensiveAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentLogins, setRecentLogins] = useState([]);
  const [ctfStatus, setCtfStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [ctfs, setCtfs] = useState([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchDashboardData = async () => {
    try {
      setRefreshLoading(true);

      const [statsResponse, analyticsResponse, loginsResponse, ctfsResponse] =
        await Promise.all([
          analyticsAPI.getDashboardStats(),
          analyticsAPI.getComprehensiveAnalytics({ timeRange: "24h" }),
          analyticsAPI.getRecentLogins({ limit: 8 }),
          ctfAPI.getAllCTFs({ limit: 50, page: 1 }),
        ]);

      const { stats, recentActivity } = statsResponse.data;
      const { analytics } = analyticsResponse.data;

      const currentTime = new Date();
      const ctfStatusBreakdown = {
        active: { count: 0 },
        upcoming: { count: 0 },
        ended: { count: 0 },
        inactive: { count: 0 },
      };

      ctfsResponse.data.ctfs.forEach((ctf) => {
        const startDate = new Date(ctf.schedule?.startDate);
        const endDate = new Date(ctf.schedule?.endDate);

        if (ctf.status === "active") {
          if (currentTime >= startDate && currentTime <= endDate) {
            ctfStatusBreakdown.active.count++;
          } else if (currentTime < startDate) {
            ctfStatusBreakdown.upcoming.count++;
          } else {
            ctfStatusBreakdown.ended.count++;
          }
        } else {
          ctfStatusBreakdown.inactive.count++;
        }
      });

      const safeRecentActivity = Array.isArray(recentActivity)
        ? recentActivity.map((activity) => ({
            ...activity,
            type: activity.type || "unknown",
            isCorrect: activity.isCorrect || false,
          }))
        : [];

      setStats(stats || {});
      setComprehensiveAnalytics(analytics || {});
      setRecentActivity(safeRecentActivity);
      setRecentLogins(loginsResponse.data?.recentLogins || []);
      setCtfStatus(ctfStatusBreakdown);
      setCtfs(ctfsResponse.data.ctfs || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to fetch dashboard data");

      setStats({});
      setComprehensiveAnalytics({});
      setRecentActivity([]);
      setRecentLogins([]);
      setCtfStatus({});
      setCtfs([]);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshLoading(true);
    await fetchDashboardData();
    toast.success("Dashboard updated with real-time data!");
  };

  const calculateRealTimeStats = () => {
    if (!stats && !comprehensiveAnalytics) return null;

    const totalSubmissions = stats?.totalSubmissions || 0;
    const correctSubmissions = stats?.correctSubmissions || 0;
    const successRate =
      totalSubmissions > 0
        ? Math.round((correctSubmissions / totalSubmissions) * 100)
        : 0;

    const submissionStats = comprehensiveAnalytics?.submissions;
    const userStats = comprehensiveAnalytics?.users;

    return {
      totalUsers: stats?.totalUsers || 0,
      activeUsers: stats?.activeUsers || 0,
      newUsersToday: stats?.newUsersToday || 0,

      totalCTFs: stats?.totalCTFs || 0,
      publishedCTFs: stats?.publishedCTFs || 0,
      visibleCTFs: stats?.visibleCTFs || 0,

      totalSubmissions,
      correctSubmissions,
      pendingSubmissions: stats?.pendingSubmissions || 0,
      successRate,

      activeCTFs: ctfStatus.active?.count || 0,
      upcomingCTFs: ctfStatus.upcoming?.count || 0,
      endedCTFs: ctfStatus.ended?.count || 0,
      inactiveCTFs: ctfStatus.inactive?.count || 0,

      currentlyRunningCTFs: ctfs.filter((ctf) => {
        const now = new Date();
        const start = new Date(ctf.schedule?.startDate);
        const end = new Date(ctf.schedule?.endDate);
        return ctf.status === "active" && now >= start && now <= end;
      }).length,
    };
  };

  const realTimeStats = calculateRealTimeStats();

  const handleUsersClick = () => {
    navigate("/admin/users");
  };

  const handleCTFsClick = () => {
    navigate("/admin/ctfs");
  };

  const handleAnalyticsClick = () => {
    navigate("/admin/analytics");
  };

  const handleSubmissionsClick = () => {
    navigate("/admin/submissions");
  };

  if (loading) {
    return (
      <Layout title="Dashboard" subtitle="Overview of your CTF platform">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full border-4 border-gray-300 border-t-purple-600 h-12 w-12 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">
              Loading command center...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Dashboard"
      subtitle="Real-time overview of your CTF platform"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-12">
        {/* Hero Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <Cpu className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              COMMAND CENTER
            </h1>
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time monitoring and analytics dashboard for your CTF platform
          </p>
        </div>

        {/* Control Panel */}
        <Card className="border-0 shadow-xl mb-8 bg-white/80 backdrop-blur-sm">
          <Card.Content className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Rocket className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Mission Control
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Live platform monitoring
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-xl">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    }`}
                  ></div>
                  <input
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label
                    htmlFor="autoRefresh"
                    className="text-sm font-medium text-gray-700"
                  >
                    Live Updates
                  </label>
                </div>

                <Button
                  variant="outline"
                  onClick={refreshData}
                  loading={refreshLoading}
                  className="flex items-center space-x-2 border-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Intel</span>
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={realTimeStats?.totalUsers || 0}
            description={`${realTimeStats?.activeUsers || 0} active warriors`}
            icon={Users}
            color="blue"
            onClick={handleUsersClick}
            clickable
          />
          <StatCard
            title="Total CTFs"
            value={realTimeStats?.totalCTFs || 0}
            description={`${realTimeStats?.publishedCTFs || 0} missions live`}
            icon={Flag}
            color="green"
            onClick={handleCTFsClick}
            clickable
          />
          <StatCard
            title="Success Rate"
            value={`${realTimeStats?.successRate || 0}%`}
            description={`${realTimeStats?.correctSubmissions || 0}/${
              realTimeStats?.totalSubmissions || 0
            } victories`}
            icon={TrendingUp}
            color="yellow"
            onClick={handleAnalyticsClick}
            clickable
          />
          <StatCard
            title="Active Missions"
            value={realTimeStats?.currentlyRunningCTFs || 0}
            description={`${realTimeStats?.upcomingCTFs || 0} upcoming battles`}
            icon={Activity}
            color="purple"
            onClick={handleCTFsClick}
            clickable
          />
        </div>

        {/* CTF Status Overview */}
        <Card className="border-0 shadow-xl mb-8 bg-white/80 backdrop-blur-sm">
          <Card.Header className="pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Gamepad2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Battlefield Status
                  </h3>
                  <p className="text-sm text-gray-600">
                    Real-time CTF mission overview
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {realTimeStats?.totalCTFs || 0} Total Missions
              </span>
            </div>
          </Card.Header>
          <Card.Content className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-2xl font-black text-green-700">
                  {realTimeStats?.activeCTFs || 0}
                </div>
                <div className="text-sm font-semibold text-green-600">
                  Active Now
                </div>
                <div className="text-xs text-green-500 mt-1">Live Combat</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="text-2xl font-black text-blue-700">
                  {realTimeStats?.upcomingCTFs || 0}
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  Upcoming
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  Ready to Launch
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                <div className="text-2xl font-black text-gray-700">
                  {realTimeStats?.endedCTFs || 0}
                </div>
                <div className="text-sm font-semibold text-gray-600">
                  Completed
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Mission Accomplished
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
                <div className="text-2xl font-black text-red-700">
                  {realTimeStats?.inactiveCTFs || 0}
                </div>
                <div className="text-sm font-semibold text-red-600">
                  Inactive
                </div>
                <div className="text-xs text-red-500 mt-1">Standby Mode</div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Recent Logins */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <Card.Header className="pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <LogIn className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Recent Warriors
                    </h3>
                    <p className="text-sm text-gray-600">Latest user logins</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {recentLogins.length} Active
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2"
                    onClick={handleUsersClick}
                  >
                    View Army
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Content className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentLogins.length > 0 ? (
                  recentLogins.map((user, index) => (
                    <RecentLoginCard
                      key={user._id || index}
                      user={user}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <UserCheck className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      No Active Warriors
                    </h4>
                    <p className="text-gray-600">
                      User login activity will appear here
                    </p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <Card.Header className="pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Battle Log
                    </h3>
                    <p className="text-sm text-gray-600">
                      Recent platform activity
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {recentActivity.length} Actions
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2"
                    onClick={handleAnalyticsClick}
                  >
                    View Intel
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Content className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <RecentActivityCard
                      key={activity._id || index}
                      activity={activity}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Quiet on the Front
                    </h4>
                    <p className="text-gray-600">
                      Platform activity will appear here
                    </p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-50 to-blue-50">
          <Card.Content className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Command Operations
              </h3>
              <p className="text-gray-600">
                Quick access to platform management
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/users")}
                className="flex flex-col items-center p-4 h-auto border-2 bg-white/80 hover:bg-white"
              >
                <Users className="h-8 w-8 mb-2 text-blue-600" />
                <span className="text-sm font-bold">Manage Army</span>
                <span className="text-xs text-gray-500 mt-1">
                  User Management
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/ctfs")}
                className="flex flex-col items-center p-4 h-auto border-2 bg-white/80 hover:bg-white"
              >
                <Flag className="h-8 w-8 mb-2 text-green-600" />
                <span className="text-sm font-bold">Missions</span>
                <span className="text-xs text-gray-500 mt-1">
                  CTF Management
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/submissions")}
                className="flex flex-col items-center p-4 h-auto border-2 bg-white/80 hover:bg-white"
              >
                <CheckCircle className="h-8 w-8 mb-2 text-yellow-600" />
                <span className="text-sm font-bold">Battle Reports</span>
                <span className="text-xs text-gray-500 mt-1">Submissions</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/analytics")}
                className="flex flex-col items-center p-4 h-auto border-2 bg-white/80 hover:bg-white"
              >
                <BarChart3 className="h-8 w-8 mb-2 text-purple-600" />
                <span className="text-sm font-bold">War Room</span>
                <span className="text-xs text-gray-500 mt-1">Analytics</span>
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
