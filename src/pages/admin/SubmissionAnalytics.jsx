import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { submissionAdminAPI, analyticsAPI } from "../../services/admin";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  RefreshCw,
  Activity,
  AlertCircle,
  BarChart3,
  Info,
  Target,
  Award,
} from "lucide-react";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";

const SubmissionAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [averageType, setAverageType] = useState("overall");

  useEffect(() => {
    fetchAnalytics();

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

      const [analyticsResponse, allSubmissionsResponse, submissionsResponse] =
        await Promise.all([
          analyticsAPI.getComprehensiveAnalytics({ timeRange }),
          submissionAdminAPI.getAllSubmissions({
            limit: 1000,
            page: 1,
            sort: "submittedAt:desc",
          }),
          submissionAdminAPI.getAllSubmissions({
            limit: 10,
            page: 1,
            sort: "submittedAt:desc",
          }),
        ]);

      const { analytics } = analyticsResponse.data;
      const allSubmissions = allSubmissionsResponse.data?.submissions || [];
      const recentSubs = submissionsResponse.data?.submissions || [];

      const dailyTrends = generateDailyTrendsFromSubmissions(
        allSubmissions,
        timeRange
      );

      // Calculate different types of averages
      const approvedSubmissions = allSubmissions.filter(
        (sub) => sub.submissionStatus === "approved"
      );
      const totalPoints = allSubmissions.reduce(
        (sum, sub) => sum + (sub.points || 0),
        0
      );
      const approvedPoints = approvedSubmissions.reduce(
        (sum, sub) => sum + (sub.points || 0),
        0
      );

      // Category-based average (from analytics)
      const categoryAverage =
        analytics?.submissions?.categoryPerformance?.length > 0
          ? analytics.submissions.categoryPerformance.reduce(
              (sum, cat) => sum + (cat.averagePoints || 0),
              0
            ) / analytics.submissions.categoryPerformance.length
          : 0;

      const transformedStats = {
        totals: {
          totalSubmissions:
            analytics?.submissions?.total || allSubmissions.length,
          approvedSubmissions:
            analytics?.submissions?.correctSubmissions ||
            approvedSubmissions.length,
          pendingSubmissions: await getPendingSubmissionsCount(),
          rejectedSubmissions:
            analytics?.submissions?.total -
              analytics?.submissions?.correctSubmissions ||
            allSubmissions.filter((s) => s.submissionStatus === "rejected")
              .length,
          totalPoints: totalPoints,

          // Multiple average calculations
          averages: {
            overall:
              allSubmissions.length > 0
                ? totalPoints / allSubmissions.length
                : 0,
            approvedOnly:
              approvedSubmissions.length > 0
                ? approvedPoints / approvedSubmissions.length
                : 0,
            categoryBased: categoryAverage,
          },

          // Additional metrics for context
          totalApprovedPoints: approvedPoints,
          approvedSubmissionCount: approvedSubmissions.length,
          totalSubmissionCount: allSubmissions.length,
        },
        statusDistribution: [
          {
            _id: "approved",
            count:
              analytics?.submissions?.correctSubmissions ||
              approvedSubmissions.length,
          },
          { _id: "pending", count: await getPendingSubmissionsCount() },
          {
            _id: "rejected",
            count:
              analytics?.submissions?.total -
                analytics?.submissions?.correctSubmissions ||
              allSubmissions.filter((s) => s.submissionStatus === "rejected")
                .length,
          },
        ],
        dailyTrends: dailyTrends,
      };

      setStats(transformedStats);
      setChartData(dailyTrends);
      setRecentSubmissions(recentSubs.slice(0, 10));
    } catch (error) {
      console.error("❌ Failed to fetch submission analytics:", error);
      await fetchBasicStats([], []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateDailyTrendsFromSubmissions = (submissions, range = "7d") => {
    const now = new Date();
    let daysToShow = 7;

    switch (range) {
      case "24h":
        daysToShow = 1;
        break;
      case "7d":
        daysToShow = 7;
        break;
      case "30d":
        daysToShow = 30;
        break;
      case "all":
        const firstSubmission =
          submissions.length > 0
            ? new Date(
                Math.min(
                  ...submissions.map((s) => new Date(s.submittedAt).getTime())
                )
              )
            : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const diffTime = Math.abs(now - firstSubmission);
        daysToShow = Math.min(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 90);
        break;
    }

    const dailyData = [];

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dateStr = date.toISOString().split("T")[0];
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySubmissions = submissions.filter((sub) => {
        const subDate = new Date(sub.submittedAt);
        return subDate >= date && subDate < nextDate;
      });

      const approved = daySubmissions.filter(
        (s) => s.submissionStatus === "approved"
      ).length;
      const rejected = daySubmissions.filter(
        (s) => s.submissionStatus === "rejected"
      ).length;
      const pending = daySubmissions.filter(
        (s) => s.submissionStatus === "pending"
      ).length;

      dailyData.push({
        _id: dateStr,
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          ...(daysToShow > 7 ? { year: "2-digit" } : {}),
        }),
        fullDate: dateStr,
        count: daySubmissions.length,
        approved: approved,
        rejected: rejected,
        pending: pending,
        total: daySubmissions.length,
      });
    }

    return dailyData;
  };

  const fetchBasicStats = async (submissions = [], dailyTrends = []) => {
    try {
      if (submissions.length === 0) {
        const [allSubmissions, pendingSubmissions] = await Promise.all([
          submissionAdminAPI.getAllSubmissions({ limit: 1000 }),
          submissionAdminAPI.getPendingSubmissions({ limit: 1000 }),
        ]);

        submissions = allSubmissions.data.submissions || [];
        const pending = pendingSubmissions.data.submissions || [];

        if (dailyTrends.length === 0) {
          dailyTrends = generateDailyTrendsFromSubmissions(
            submissions,
            timeRange
          );
        }
      }

      const approvedSubmissions = submissions.filter(
        (sub) => sub.submissionStatus === "approved"
      );
      const totalPoints = submissions.reduce(
        (sum, sub) => sum + (sub.points || 0),
        0
      );
      const approvedPoints = approvedSubmissions.reduce(
        (sum, sub) => sum + (sub.points || 0),
        0
      );
      const pendingCount = await getPendingSubmissionsCount();

      const basicStats = {
        totals: {
          totalSubmissions: submissions.length,
          approvedSubmissions: approvedSubmissions.length,
          pendingSubmissions: pendingCount,
          rejectedSubmissions: submissions.filter(
            (s) => s.submissionStatus === "rejected"
          ).length,
          totalPoints: totalPoints,
          averages: {
            overall:
              submissions.length > 0 ? totalPoints / submissions.length : 0,
            approvedOnly:
              approvedSubmissions.length > 0
                ? approvedPoints / approvedSubmissions.length
                : 0,
            categoryBased: 0,
          },
          totalApprovedPoints: approvedPoints,
          approvedSubmissionCount: approvedSubmissions.length,
          totalSubmissionCount: submissions.length,
        },
        statusDistribution: [
          { _id: "approved", count: approvedSubmissions.length },
          { _id: "pending", count: pendingCount },
          {
            _id: "rejected",
            count: submissions.filter((s) => s.submissionStatus === "rejected")
              .length,
          },
        ],
        dailyTrends: dailyTrends,
      };

      setStats(basicStats);
      setChartData(dailyTrends);
    } catch (error) {
      console.error("❌ Fallback stats also failed:", error);
      const emptyStats = {
        totals: {
          totalSubmissions: 0,
          approvedSubmissions: 0,
          pendingSubmissions: 0,
          rejectedSubmissions: 0,
          totalPoints: 0,
          averages: {
            overall: 0,
            approvedOnly: 0,
            categoryBased: 0,
          },
          totalApprovedPoints: 0,
          approvedSubmissionCount: 0,
          totalSubmissionCount: 0,
        },
        statusDistribution: [],
        dailyTrends: generateDailyTrendsFromSubmissions([], timeRange),
      };
      setStats(emptyStats);
      setChartData(emptyStats.dailyTrends);
    }
  };

  const getPendingSubmissionsCount = async () => {
    try {
      const response = await submissionAdminAPI.getPendingSubmissions({
        limit: 1,
      });
      return response.data.pagination?.total || 0;
    } catch (error) {
      return 0;
    }
  };

  const refreshData = async () => {
    await fetchAnalytics();
    toast.success("Submission analytics updated!");
  };
  // Update the handleExport function in SubmissionAnalytics.jsx

  const handleExport = async (type) => {
    try {
      let response;

      switch (type) {
        case "analytics-summary":
          response = await analyticsAPI.exportSubmissionAnalytics({
            timeRange,
            format: "summary",
          });
          break;
        case "analytics-detailed":
          response = await analyticsAPI.exportSubmissionAnalytics({
            timeRange,
            format: "detailed",
          });
          break;
        case "status-distribution":
          response = await analyticsAPI.exportSubmissionStatusDistribution({
            timeRange,
          });
          break;
        default:
          toast.error("Unknown export type");
          return;
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from content-disposition header or generate one
      const contentDisposition = response.headers["content-disposition"];
      let filename = `submission-analytics-${timeRange}-${
        new Date().toISOString().split("T")[0]
      }.csv`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) filename = filenameMatch[1];
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${type} data successfully!`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed");
    }
  };
  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    color = "blue",
    tooltip = "",
  }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-100",
      green: "text-green-600 bg-green-100",
      yellow: "text-yellow-600 bg-yellow-100",
      red: "text-red-600 bg-red-100",
      purple: "text-purple-600 bg-purple-100",
    };

    return (
      <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 relative">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-lg ${colors[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              {tooltip && (
                <div className="group relative">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    {tooltip}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
            <dd className="text-lg sm:text-xl font-bold text-gray-900">
              {value}
            </dd>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const AveragePointsCard = () => {
    if (!stats?.totals?.averages) return null;

    const {
      averages,
      approvedSubmissionCount,
      totalSubmissionCount,
      totalPoints,
      totalApprovedPoints,
    } = stats.totals;
    const currentAverage = averages[averageType] || averages.overall;

    const averageConfigs = {
      overall: {
        title: "Average Points (All Submissions)",
        description: "Across all submission attempts",
        icon: Activity,
        color: "blue",
        tooltip:
          "Includes approved, rejected, and pending submissions. Shows average points per submission attempt.",
        formula: `Total Points (${totalPoints}) ÷ Total Submissions (${totalSubmissionCount})`,
      },
      approvedOnly: {
        title: "Average Points (Approved Only)",
        description: "Successful submissions only",
        icon: Award,
        color: "green",
        tooltip:
          "Only includes approved submissions. Shows average points earned per successful solve.",
        formula: `Approved Points (${totalApprovedPoints}) ÷ Approved Submissions (${approvedSubmissionCount})`,
      },
      categoryBased: {
        title: "Average Points (Category-Based)",
        description: "Average of category averages",
        icon: Target,
        color: "purple",
        tooltip:
          "Calculated by averaging the mean points from each CTF category. May differ from overall average.",
        formula: "Average of each category's mean points",
      },
    };

    const config = averageConfigs[averageType];

    return (
      <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded-lg ${
                config.color === "blue"
                  ? "bg-blue-100 text-blue-600"
                  : config.color === "green"
                  ? "bg-green-100 text-green-600"
                  : "bg-purple-100 text-purple-600"
              }`}
            >
              <config.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {config.title}
                </h3>
                <div className="group relative">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-64 z-10">
                    <div className="font-semibold mb-1">
                      Calculation Method:
                    </div>
                    <div className="mb-2">{config.tooltip}</div>
                    <div className="font-mono text-xs bg-gray-800 p-2 rounded">
                      {config.formula}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">{config.description}</p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <select
              value={averageType}
              onChange={(e) => setAverageType(e.target.value)}
              className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="overall">All Submissions</option>
              <option value="approvedOnly">Approved Only</option>
              <option value="categoryBased">Category-Based</option>
            </select>
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {currentAverage ? Math.round(currentAverage) : 0}
            <span className="text-lg text-gray-500 ml-1">points</span>
          </div>

          <div className="flex justify-center space-x-4 text-xs text-gray-500 mt-3">
            <div className="text-center">
              <div className="font-semibold">{totalSubmissionCount}</div>
              <div>Total Submissions</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">
                {approvedSubmissionCount}
              </div>
              <div>Approved</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{totalPoints}</div>
              <div>Total Points</div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Prepare data for charts
  const statusData =
    stats?.statusDistribution?.map((item) => ({
      name: item._id
        ? item._id.charAt(0).toUpperCase() + item._id.slice(1)
        : "Unknown",
      value: item.count || 0,
      count: item.count || 0,
    })) || [];

  const dailyChartData = chartData.map((day) => ({
    date: day.date,
    submissions: day.count || 0,
    approved: day.approved || 0,
    rejected: day.rejected || 0,
    pending: day.pending || 0,
    total: day.total || 0,
  }));

  // Chart colors
  const STATUS_COLORS = {
    Approved: "#10B981",
    Pending: "#F59E0B",
    Rejected: "#EF4444",
    Unknown: "#6B7280",
  };

  const DAILY_TREND_COLORS = {
    submissions: "#3B82F6",
    approved: "#10B981",
    rejected: "#EF4444",
    pending: "#F59E0B",
  };

  if (loading) {
    return (
      <Layout
        title="Submission Analytics"
        subtitle="Detailed submission insights"
      >
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  const { totals = {} } = stats || {};

  return (
    <Layout
      title="Submission Analytics"
      subtitle="Real-time submission insights and statistics"
    >
      {/* Header */}
      {/* Header with Dropdown Export */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Submission Analytics
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Comprehensive insights into CTF submissions with detailed metrics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
            <input
              type="checkbox"
              id="submissionAutoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor="submissionAutoRefresh"
              className="text-xs sm:text-sm text-gray-600"
            >
              Auto-refresh (30s)
            </label>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <Button
            variant="outline"
            onClick={refreshData}
            loading={refreshing}
            className="flex items-center space-x-2 text-xs sm:text-sm px-3 py-2"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Refresh</span>
          </Button>

          {/* Export Dropdown for Better Mobile Experience */}
          <div className="relative group">
            <Button
              variant="outline"
              className="flex items-center space-x-2 text-xs sm:text-sm px-3 py-2 w-full sm:w-auto"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Export</span>
              <svg
                className="h-3 w-3 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExport("analytics-summary")}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Summary</span>
                </button>
                <button
                  onClick={() => handleExport("analytics-detailed")}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Detailed</span>
                </button>
                <button
                  onClick={() => handleExport("status-distribution")}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Submissions"
          value={totals.totalSubmissions || 0}
          description="All submission attempts"
          icon={FileText}
          color="blue"
          tooltip="Includes approved, rejected, and pending submissions"
        />
        <StatCard
          title="Approved"
          value={totals.approvedSubmissions || 0}
          description="Successfully solved"
          icon={CheckCircle}
          color="green"
          tooltip="Submissions that were correct and awarded points"
        />
        <StatCard
          title="Pending"
          value={totals.pendingSubmissions || 0}
          description="Awaiting review"
          icon={Clock}
          color="yellow"
          tooltip="Submissions waiting for admin review and approval"
        />
        <StatCard
          title="Rejected"
          value={totals.rejectedSubmissions || 0}
          description="Incorrect submissions"
          icon={XCircle}
          color="red"
          tooltip="Submissions that were incorrect or didn't meet requirements"
        />
      </div>

      {/* Average Points Card with Detailed Explanation */}
      <div className="mb-6 sm:mb-8">
        <AveragePointsCard />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mx-auto mb-2" />
          <div className="text-xl sm:text-2xl font-bold text-blue-700">
            {totals.totalPoints || 0}
          </div>
          <div className="text-xs sm:text-sm text-blue-600 font-medium">
            Total Points Awarded
          </div>
          <div className="text-xs text-blue-500 mt-1">
            Across all approved submissions
          </div>
        </Card>

        <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <Award className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 mx-auto mb-2" />
          <div className="text-xl sm:text-2xl font-bold text-green-700">
            {totals.approvedSubmissionCount || 0}
          </div>
          <div className="text-xs sm:text-sm text-green-600 font-medium">
            Successful Solves
          </div>
          <div className="text-xs text-green-500 mt-1">
            Correct submissions with points awarded
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        {/* Submission Status Distribution */}
        <Card className="h-full">
          <Card.Header className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Submission Status Distribution
              </h3>
              <span className="text-xs sm:text-sm text-gray-500">
                {totals.totalSubmissions || 0} total
              </span>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || "#6B7280"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} submissions`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {statusData.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[entry.name] }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {entry.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {entry.count}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      (
                      {Math.round(
                        (entry.count / (totals.totalSubmissions || 1)) * 100
                      )}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Daily Submission Trend */}
        <Card className="h-full">
          <Card.Header className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Daily Submission Trend
              </h3>
              <span className="text-xs sm:text-sm text-gray-500">
                {timeRange === "24h"
                  ? "Last 24 Hours"
                  : timeRange === "7d"
                  ? "Last 7 Days"
                  : timeRange === "30d"
                  ? "Last 30 Days"
                  : "All Time"}
              </span>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      const labels = {
                        submissions: "Total Submissions",
                        approved: "Approved",
                        rejected: "Rejected",
                        pending: "Pending",
                      };
                      return [value, labels[name] || name];
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="submissions"
                    fill={DAILY_TREND_COLORS.submissions}
                    name="Total Submissions"
                  />
                  <Bar
                    dataKey="approved"
                    fill={DAILY_TREND_COLORS.approved}
                    name="Approved"
                  />
                  <Bar
                    dataKey="pending"
                    fill={DAILY_TREND_COLORS.pending}
                    name="Pending"
                  />
                  <Bar
                    dataKey="rejected"
                    fill={DAILY_TREND_COLORS.rejected}
                    name="Rejected"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {dailyChartData.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>
                  No submission data available for the selected time period.
                </p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <Card.Header className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              Recent Submissions
            </h3>
            <span className="text-xs sm:text-sm text-gray-500">
              Latest 10 submissions
            </span>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((submission) => {
                const submissionTime = new Date(submission.submittedAt);
                const now = new Date();
                const timeDiff = Math.floor(
                  (now - submissionTime) / (1000 * 60)
                );

                let timeText = "";
                if (timeDiff < 1) timeText = "Just now";
                else if (timeDiff < 60) timeText = `${timeDiff}m ago`;
                else if (timeDiff < 1440)
                  timeText = `${Math.floor(timeDiff / 60)}h ago`;
                else timeText = submissionTime.toLocaleDateString();

                const status = submission.submissionStatus;

                return (
                  <div
                    key={submission._id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className={`flex-shrink-0 w-2 h-2 rounded-full ${
                        status === "approved"
                          ? "bg-green-500"
                          : status === "rejected"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {submission.user?.fullName || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {submission.ctf?.title || "Unknown CTF"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{timeText}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          status === "approved"
                            ? "bg-green-100 text-green-800"
                            : status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                <p className="mt-2 text-sm sm:text-base">
                  No recent submissions
                </p>
                <p className="text-xs sm:text-sm mt-1">
                  Submissions will appear here as users submit solutions
                </p>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>
    </Layout>
  );
};

export default SubmissionAnalytics;
