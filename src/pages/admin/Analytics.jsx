import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { analyticsAPI, ctfAPI } from "../../services/admin";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Users,
  Flag,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  Activity,
  Target,
  Award,
  BarChart3,
  Clock,
  Shield,
  Zap,
  Database,
  Cpu,
} from "lucide-react";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [realtimeStats, setRealtimeStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAnalytics();

    // Set up auto-refresh every 30 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchAnalytics, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange, autoRefresh]);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);

      const [analyticsResponse, statsResponse, ctfsResponse] =
        await Promise.all([
          analyticsAPI.getComprehensiveAnalytics({ timeRange }),
          analyticsAPI.getDashboardStats(),
          ctfAPI.getAllCTFs({ limit: 100 }),
        ]);

      const { analytics } = analyticsResponse.data;
      const { stats } = statsResponse.data;
      const ctfs = ctfsResponse.data.ctfs || [];

      const currentTime = new Date();
      const ctfStatusStats = {
        active: 0,
        upcoming: 0,
        ended: 0,
        inactive: 0,
      };

      ctfs.forEach((ctf) => {
        const startDate = new Date(ctf.schedule?.startDate);
        const endDate = new Date(ctf.schedule?.endDate);

        if (ctf.status === "active") {
          if (currentTime >= startDate && currentTime <= endDate) {
            ctfStatusStats.active++;
          } else if (currentTime < startDate) {
            ctfStatusStats.upcoming++;
          } else {
            ctfStatusStats.ended++;
          }
        } else {
          ctfStatusStats.inactive++;
        }
      });

      const ctfStatusData = Object.entries(ctfStatusStats).map(
        ([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          count: value,
        })
      );

      const userRoleData =
        analytics?.users?.roleStats?.map((stat) => ({
          name: stat._id === "admin" ? "Administrators" : "Students",
          value: stat.count,
          count: stat.count,
        })) || [];

      setAnalytics({
        ...analytics,
        ctfStatusData,
        userRoleData,
        realtimeStats: stats,
      });

      setRealtimeStats(stats);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    await fetchAnalytics();
    toast.success("Analytics updated!");
  };

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    color = "blue",
  }) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      yellow: "from-yellow-500 to-yellow-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
      indigo: "from-indigo-500 to-indigo-600",
    };

    const bgColors = {
      blue: "bg-blue-50 border-blue-200",
      green: "bg-green-50 border-green-200",
      yellow: "bg-yellow-50 border-yellow-200",
      purple: "bg-purple-50 border-purple-200",
      orange: "bg-orange-50 border-orange-200",
      indigo: "bg-indigo-50 border-indigo-200",
    };

    return (
      <Card
        className={`p-6 border-2 transition-all duration-300 hover:shadow-lg ${bgColors[color]}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-2 font-medium">
                {description}
              </p>
            )}
          </div>
          <div
            className={`p-4 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>
    );
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CTF_STATUS_COLORS = {
    Active: "#10B981",
    Upcoming: "#3B82F6",
    Ended: "#6B7280",
    Inactive: "#F59E0B",
  };

  const USER_ROLE_COLORS = {
    Administrators: "#8B5CF6",
    Students: "#3B82F6",
  };

  if (loading) {
    return (
      <Layout
        title="Analytics"
        subtitle="Comprehensive platform insights and performance metrics"
      >
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="animate-spin rounded-full border-4 border-gray-300 border-t-primary-600 h-12 w-12"></div>
          <p className="text-gray-500 text-lg">
            Loading analytics dashboard...
          </p>
        </div>
      </Layout>
    );
  }

  const {
    users,
    ctfs,
    submissions,
    ctfStatusData = [],
    userRoleData = [],
  } = analytics || {};
  const totalSubmissions = submissions?.total || 0;
  const correctSubmissions = submissions?.correctSubmissions || 0;
  const successRate =
    totalSubmissions > 0
      ? Math.round((correctSubmissions / totalSubmissions) * 100)
      : 0;

  return (
    <Layout
      title="Analytics Dashboard"
      subtitle="Real-time insights and comprehensive platform metrics"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary-600 to-blue-700 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
              <p className="text-blue-100 text-lg">
                Comprehensive insights and performance metrics in real-time
              </p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <Card className="border-0 shadow-xl rounded-2xl">
          <Card.Content className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gray-100 px-4 py-3 rounded-xl">
                  <input
                    type="checkbox"
                    id="analyticsAutoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                  />
                  <label
                    htmlFor="analyticsAutoRefresh"
                    className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Auto-refresh (30s)</span>
                  </label>
                </div>

                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>

              <Button
                variant="primary"
                onClick={refreshData}
                loading={refreshing}
                className="bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 px-6 py-3 rounded-xl"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="font-semibold">Refresh Data</span>
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={users?.total || 0}
            description={`${users?.activeUsers || 0} active users`}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Total CTFs"
            value={ctfs?.total || 0}
            description={`${
              ctfStatusData.find((d) => d.name === "Active")?.value || 0
            } active challenges`}
            icon={Flag}
            color="green"
          />
          <StatCard
            title="Total Submissions"
            value={totalSubmissions.toLocaleString()}
            description={`${correctSubmissions.toLocaleString()} correct answers`}
            icon={TrendingUp}
            color="orange"
          />
          <StatCard
            title="Success Rate"
            value={`${successRate}%`}
            description="Overall platform accuracy"
            icon={CheckCircle}
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* CTF Status Distribution */}
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            <Card.Header className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <span>CTF Status Distribution</span>
                </h3>
                <span className="text-sm font-semibold text-gray-600 bg-white px-3 py-1 rounded-full border">
                  {ctfStatusData.reduce((sum, item) => sum + item.value, 0)}{" "}
                  total
                </span>
              </div>
            </Card.Header>
            <Card.Content className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ctfStatusData}
                      cx="50%"
                      cy="50%"
                      label={renderCustomizedLabel}
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {ctfStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CTF_STATUS_COLORS[entry.name] || "#6B7280"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} CTFs`, "Count"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {ctfStatusData.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: CTF_STATUS_COLORS[entry.name] }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {entry.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900 ml-auto">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>

          {/* User Role Distribution */}
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            <Card.Header className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <span>User Role Distribution</span>
                </h3>
                <span className="text-sm font-semibold text-gray-600 bg-white px-3 py-1 rounded-full border">
                  {userRoleData.reduce((sum, item) => sum + item.value, 0)}{" "}
                  total
                </span>
              </div>
            </Card.Header>
            <Card.Content className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      label={renderCustomizedLabel}
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={USER_ROLE_COLORS[entry.name] || "#6B7280"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} Users`, "Count"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {userRoleData.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: USER_ROLE_COLORS[entry.name] }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {entry.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900 ml-auto">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Real-time Activity Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 text-center p-8 transition-all duration-300 hover:scale-105">
            <div className="p-4 bg-blue-600 rounded-2xl inline-flex mb-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div className="text-4xl font-black text-blue-700 mb-2">
              {realtimeStats?.activeUsers || 0}
            </div>
            <div className="text-lg font-semibold text-blue-800 mb-1">
              Active Users
            </div>
            <div className="text-sm text-blue-600">
              Currently engaged in platform
            </div>
          </Card>

          <Card className="shadow-lg rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 text-center p-8 transition-all duration-300 hover:scale-105">
            <div className="p-4 bg-green-600 rounded-2xl inline-flex mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div className="text-4xl font-black text-green-700 mb-2">
              {realtimeStats?.newUsersToday || 0}
            </div>
            <div className="text-lg font-semibold text-green-800 mb-1">
              New Users Today
            </div>
            <div className="text-sm text-green-600">
              Recent platform registrations
            </div>
          </Card>

          <Card className="shadow-lg rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 text-center p-8 transition-all duration-300 hover:scale-105">
            <div className="p-4 bg-purple-600 rounded-2xl inline-flex mb-4">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div className="text-4xl font-black text-purple-700 mb-2">
              {realtimeStats?.pendingSubmissions || 0}
            </div>
            <div className="text-lg font-semibold text-purple-800 mb-1">
              Pending Submissions
            </div>
            <div className="text-sm text-purple-600">Awaiting evaluation</div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
