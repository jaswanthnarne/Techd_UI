import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { userAPI, userCTFAPI } from "../../services/user";
import {
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Flag,
  Users,
  Award,
  Calendar,
  BarChart3,
  RefreshCw,
  Zap,
  Crown,
  TrendingDown,
  CheckCircle,
  XCircle,
  Activity,
  Shield,
  Sparkles,
  Brain,
  Sword,
  Medal,
  TargetIcon,
  LineChart,
  Rocket,
  Star,
  Gamepad2,
} from "lucide-react";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [activeCTFs, setActiveCTFs] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userRanking, setUserRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  // const fetchDashboardData = async () => {
  //   try {
  //     setLoading(true);

  //     const [
  //       dashboardResponse,
  //       ctfsResponse,
  //       submissionsResponse,
  //       statsResponse,
  //       rankingResponse,
  //     ] = await Promise.all([
  //       userAPI.getDashboard(),
  //       userCTFAPI.getJoinedCTFs({ status: "active", limit: 3 }),
  //       userCTFAPI.getMySubmissions({ limit: 5 }),
  //       userAPI.getStats(),
  //       userAPI.getRanking(),
  //     ]);

  //     setDashboardData(dashboardResponse.data);
  //     setActiveCTFs(ctfsResponse.data.ctfs || []);
  //     setRecentSubmissions(submissionsResponse.data.submissions || []);
  //     setUserStats(statsResponse.data.stats);
  //     setUserRanking(rankingResponse.data);
  //   } catch (error) {
  //     console.error("Failed to fetch dashboard data:", error);
  //     toast.error("Failed to load your digital battlefield stats");
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        dashboardResponse,
        submissionsResponse,
        statsResponse,
        rankingResponse,
      ] = await Promise.all([
        userAPI.getDashboard(),
        userCTFAPI.getMySubmissions({ limit: 5 }),
        userAPI.getStats(),
        userAPI.getRanking(),
      ]);

      // Use activeCTFs from dashboard response instead of separate API call
      setDashboardData(dashboardResponse.data);
      setActiveCTFs(dashboardResponse.data.activeCTFs || []);
      setRecentSubmissions(submissionsResponse.data.submissions || []);
      setUserStats(statsResponse.data.stats);
      setUserRanking(rankingResponse.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load your digital battlefield stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    toast.success("Stats refreshed! Keep hacking!");
  };

  // Enhanced StatCard with modern design
  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    color = "blue",
    trend,
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
        className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${colorClasses.bg}`}
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

            {trend && (
              <div
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  trend > 0
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : trend < 0
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }`}
              >
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Zap className="h-3 w-3" />
                )}
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>
    );
  };

  const calculateRealTimeStats = () => {
    if (!userStats) return null;

    const stats = userStats;

    return {
      totalPoints: stats.submissions?.totalPoints || 0,
      ctfsJoined: stats.ctfs?.totalCTFs || 0,
      challengesSolved: stats.ctfs?.solvedCTFs || 0,
      successRate: stats.accuracy || 0,
      totalSubmissions: stats.submissions?.totalSubmissions || 0,
      correctSubmissions: stats.submissions?.correctSubmissions || 0,
      globalRank: userRanking?.userRanking?.position || "N/A",
      totalParticipants: userRanking?.userRanking?.totalParticipants || 0,
    };
  };

  const realTimeStats = calculateRealTimeStats();

  if (loading || !dashboardData || !userStats) {
    return (
      <StudentLayout
        title="War Room"
        subtitle="Your cybersecurity command center"
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <Shield className="h-10 w-10 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-2">
              Loading your digital battlefield...
            </p>
            <p className="text-gray-500 text-sm">
              Preparing your stats for world domination
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const { user } = dashboardData;

  return (
    <StudentLayout
      title="War Room"
      subtitle="Your cybersecurity command center"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-12">
        {/* Hero Header */}
        <div className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              COMMAND CENTER
            </h1>
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <TargetIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome back, <strong>{user?.fullName}</strong>! Ready to break some
            systems{" "}
            <span className="line-through text-red-600">accidentally</span>{" "}
            today?
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
                    Real-time battle statistics
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
                    id="studentAutoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label
                    htmlFor="studentAutoRefresh"
                    className="text-sm font-medium text-gray-700"
                  >
                    Live Updates
                  </label>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    loading={refreshing}
                    className="flex items-center space-x-2 border-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh Intel</span>
                  </Button>

                  <Link to="/student/leaderboard">
                    <Button className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg">
                      <Crown className="h-4 w-4" />
                      <span>View Rankings</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Points"
            value={realTimeStats.totalPoints}
            description="Your digital treasure chest"
            icon={Trophy}
            color="yellow"
          />
          <StatCard
            title="Battles Joined"
            value={realTimeStats.ctfsJoined}
            description="CTF campaigns engaged"
            icon={Sword}
            color="blue"
          />
          <StatCard
            title="Victories"
            value={realTimeStats.challengesSolved}
            description="Systems successfully pwned"
            icon={Target}
            color="green"
          />
          <StatCard
            title="Accuracy"
            value={`${realTimeStats.successRate}%`}
            description="Precision strike rate"
            icon={LineChart}
            color="purple"
          />
        </div>

        {/* Global Ranking Card */}
        {userRanking && (
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <Card.Content className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Crown className="h-6 w-6 text-yellow-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Global Ranking</h3>
                      <p className="text-indigo-100">
                        Outmaneuvering{" "}
                        {realTimeStats.totalParticipants.toLocaleString()} other
                        hackers
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-black text-yellow-300 drop-shadow-lg">
                    #{realTimeStats.globalRank}
                  </div>
                  <p className="text-indigo-100 font-medium">
                    Your Battle Position
                  </p>
                </div>

                <div className="flex space-x-2">
                  {realTimeStats.globalRank <= 10 && (
                    <div className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold">
                      TOP 10 ELITE
                    </div>
                  )}
                  {realTimeStats.globalRank <= 3 && (
                    <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-bold">
                      LEGENDARY
                    </div>
                  )}
                </div>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Active Missions */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <Card.Header className="pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Active Missions
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ongoing CTF campaigns
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {activeCTFs.length} Live
                  </span>
                  <Link to="/student/ctfs">
                    <Button variant="outline" size="sm" className="border-2">
                      View War Room
                    </Button>
                  </Link>
                </div>
              </div>
            </Card.Header>
            <Card.Content className="p-6">
              <div className="space-y-4">
                {activeCTFs.length > 0 ? (
                  activeCTFs.map((ctf) => {
                    const isCurrentlyActive = () => {
                      const now = new Date();
                      const start = new Date(ctf.schedule?.startDate);
                      const end = new Date(ctf.schedule?.endDate);
                      return now >= start && now <= end;
                    };

                    return (
                      <div
                        key={ctf._id}
                        className="p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {ctf.title}
                              </h4>
                              {isCurrentlyActive() && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                  <Zap className="h-3 w-3 mr-1" />
                                  LIVE COMBAT
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span className="font-semibold">
                                  {ctf.points} pts
                                </span>
                              </span>
                              <span className="capitalize bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                                {ctf.difficulty?.toLowerCase()} mode
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span>
                                  {ctf.activeHours?.startTime} -{" "}
                                  {ctf.activeHours?.endTime}
                                </span>
                              </span>
                            </div>
                          </div>
                          <Link to={`/student/ctf/${ctf._id}`}>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:shadow-lg"
                            >
                              {isCurrentlyActive()
                                ? "Continue Mission"
                                : "Review Intel"}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Gamepad2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      No Active Missions
                    </h4>
                    <p className="text-gray-600 mb-4">
                      The battlefield is quiet... for now
                    </p>
                    <Link to="/student/ctfs">
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 border-0">
                        <Sword className="h-4 w-4 mr-2" />
                        Find Challenges
                      </Button>
                    </Link>
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
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Battle Log
                    </h3>
                    <p className="text-sm text-gray-600">
                      Recent mission attempts
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {recentSubmissions.length} Actions
                </span>
              </div>
            </Card.Header>
            <Card.Content className="p-6">
              <div className="space-y-4">
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

                    return (
                      <div
                        key={submission._id}
                        className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:border-blue-200 transition-all group"
                      >
                        <div
                          className={`flex-shrink-0 w-3 h-3 rounded-full ${
                            submission.isCorrect
                              ? "bg-green-500 animate-pulse"
                              : "bg-red-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {submission.ctf?.title}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{timeText}</span>
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${
                              submission.isCorrect
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                            }`}
                          >
                            {submission.isCorrect ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />+
                                {submission.points}
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Failed
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Brain className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      No Battle Logs
                    </h4>
                    <p className="text-gray-600">
                      Your mission history will appear here
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Go break something!
                    </p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <Award className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <div className="text-3xl font-black text-gray-900">
              {realTimeStats.challengesSolved}
            </div>
            <div className="text-sm font-semibold text-green-700">
              Systems Conquered
            </div>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
            <Target className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-black text-gray-900">
              {realTimeStats.correctSubmissions}
            </div>
            <div className="text-sm font-semibold text-blue-700">
              Precision Strikes
            </div>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50">
            <Medal className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <div className="text-3xl font-black text-gray-900">
              {realTimeStats.successRate}%
            </div>
            <div className="text-sm font-semibold text-purple-700">
              Mission Success Rate
            </div>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
