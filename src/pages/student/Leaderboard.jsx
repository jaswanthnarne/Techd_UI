import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import Card from "../../components/ui/Card";
import { userCTFAPI } from "../../services/user";
import {
  Trophy,
  Crown,
  TrendingUp,
  User,
  Target,
  Award,
  Shield,
  Users,
  Star,
  Medal,
  Sparkles,
  Swords,
  Zap,
  Flame,
  Sword,
  Crosshair,
  Target as TargetIcon,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Clock,
  Calendar,
} from "lucide-react";
import Loader from "../../components/ui/Loader";

const Leaderboard = () => {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(id ? "ctf" : "global");

  useEffect(() => {
    fetchLeaderboard();
  }, [view, id]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let response;

      if (view === "global") {
        response = await userCTFAPI.getGlobalLeaderboard({ limit: 100 });
        setGlobalLeaderboard(response.data.leaderboard);
      } else if (id) {
        response = await userCTFAPI.getLeaderboard(id);
        setLeaderboard(response.data.leaderboard);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return <Crown className="h-6 w-6 text-yellow-500" />;
    } else if (rank === 2) {
      return <Medal className="h-5 w-5 text-gray-400" />;
    } else if (rank === 3) {
      return <Award className="h-5 w-5 text-orange-500" />;
    }
    return <span className="text-sm font-semibold text-gray-500">{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1)
      return "bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-l-yellow-400 shadow-lg";
    if (rank === 2)
      return "bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-l-gray-400 shadow-md";
    if (rank === 3)
      return "bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-l-orange-400 shadow-md";
    return "bg-white hover:bg-gray-50 border-l-4 border-l-gray-200";
  };

  const getCompetitiveTitle = () => {
    const titles = [
      "Where Champions Are Forged",
      "The Ultimate Cybersecurity Proving Ground",
      "Excellence in Digital Defense",
      "Mastering the Art of Security",
      "The Path to Cybersecurity Mastery",
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const getRankDescription = (rank) => {
    if (rank === 1) return "Leading the pack with exceptional skill";
    if (rank === 2) return "Strong contender for the top position";
    if (rank === 3) return "Consistent performance and dedication";
    if (rank <= 10) return "Proving exceptional capabilities";
    if (rank <= 50) return "Demonstrating solid technical prowess";
    return "Building momentum and gaining experience";
  };

  const currentData = view === "global" ? globalLeaderboard : leaderboard;

  return (
    <StudentLayout
      title={view === "global" ? "Global Leaderboard" : "CTF Leaderboard"}
      subtitle={getCompetitiveTitle()}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-xl rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200">
          <Card.Content className="p-8 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 left-4">
                <Shield className="h-20 w-20 text-blue-600" />
              </div>
              <div className="absolute bottom-4 right-4">
                <Star className="h-20 w-20 text-green-600" />
              </div>
            </div>

            {/* Main Content - Centered */}
            <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
              {/* Collaboration Row */}
              <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-12">
                {/* TechDefence Labs */}
                <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-200 shadow-lg">
                  <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center shadow-xl border border-blue-100">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Shield className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      TechDefence Labs
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Cybersecurity Excellence Since 2009
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <p className="text-blue-600 text-xs font-medium">
                        Industry Leading Security
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collaboration Separator */}
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <GitBranch className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-gray-700 font-bold text-sm mt-2 uppercase tracking-wider">
                    Collaboration
                  </span>
                </div>

                {/* Parul University */}
                <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-green-200 shadow-lg">
                  <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center shadow-xl border border-green-100">
                    <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Star className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Parul University
                    </h3>
                    <p className="text-gray-600 text-sm">NACC A++</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <p className="text-green-600 text-xs font-medium">
                        Academic Excellence
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mission Statement - Centered */}
              <div className="flex justify-center">
                <div className="inline-flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl border border-purple-200 shadow-md">
                  <TargetIcon className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-800 font-semibold text-sm">
                    Advancing Cybersecurity Education Through Industry-Academia
                    Partnership
                  </span>
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* View Toggle */}
        {!id && (
          <Card className="shadow-lg rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
            <Card.Content className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center justify-center space-x-2">
                  <Crosshair className="h-5 w-5 text-purple-500" />
                  <span>Select Competition Scope</span>
                  <Crosshair className="h-5 w-5 text-purple-500" />
                </h3>
                <p className="text-sm text-gray-600">
                  Choose your competitive arena
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setView("global")}
                  className={`flex items-center space-x-4 p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    view === "global"
                      ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-2xl ring-4 ring-purple-200"
                      : "bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl border-2 border-gray-200"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      view === "global" ? "bg-white/20" : "bg-purple-100"
                    }`}
                  >
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg">Global Leaderboard</div>
                    <div className="text-sm opacity-90">
                      {view === "global"
                        ? "Comprehensive performance ranking"
                        : "All-time performance across all challenges"}
                    </div>
                  </div>
                  {view === "global" && (
                    <Sparkles className="h-5 w-5 ml-auto text-white" />
                  )}
                </button>

                {id && (
                  <button
                    onClick={() => setView("ctf")}
                    className={`flex items-center space-x-4 p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      view === "ctf"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-2xl ring-4 ring-blue-200"
                        : "bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl border-2 border-gray-200"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        view === "ctf" ? "bg-white/20" : "bg-blue-100"
                      }`}
                    >
                      <Target className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg">CTF Leaderboard</div>
                      <div className="text-sm opacity-90">
                        {view === "ctf"
                          ? "Current challenge performance"
                          : "Rankings for this specific competition"}
                      </div>
                    </div>
                    {view === "ctf" && (
                      <Sparkles className="h-5 w-5 ml-auto text-white" />
                    )}
                  </button>
                )}
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Leaderboard */}
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <Card.Header className="bg-gradient-to-r from-slate-800 to-gray-900 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-2xl">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {view === "global" ? "Global Rankings" : "CTF Rankings"}
                  </h3>
                  <p className="text-gray-300 text-sm flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {currentData.length > 0
                        ? `${currentData.length} participants demonstrating excellence`
                        : "Awaiting first submissions to establish rankings"}
                    </span>
                  </p>
                </div>
              </div>

              {currentData.length > 0 && (
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                  <GitPullRequest className="h-5 w-5 text-white" />
                  <span className="text-white font-semibold">
                    {currentData.length}
                  </span>
                  <span className="text-gray-300 text-sm">competitors</span>
                </div>
              )}
            </div>
          </Card.Header>

          <Card.Content className="p-0 bg-gradient-to-br from-gray-50 to-blue-50">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader size="lg" />
                  <p className="text-gray-500 mt-4 flex items-center justify-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Loading competition data</span>
                  </p>
                </div>
              </div>
            ) : currentData.length > 0 ? (
              <div className="divide-y divide-gray-200/60">
                {/* Top 3 Performers */}
                {currentData.slice(0, 3).length > 0 && (
                  <div className="p-8 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 border-b border-amber-200/30">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                        <Crown className="h-5 w-5 text-amber-600" />
                        <span>Top Performers</span>
                        <Crown className="h-5 w-5 text-amber-600" />
                      </h4>
                      <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-amber-200 flex items-center space-x-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span>Exceptional cybersecurity talent</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {currentData.slice(0, 3).map((entry, index) => (
                        <div
                          key={entry._id}
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${getRankColor(
                            index + 1
                          )}`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            {getRankBadge(index + 1)}
                            <div className="text-2xl font-black text-primary-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                              {entry.totalPoints || entry.points}
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mb-4">
                            <div className="h-16 w-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                              {entry.user.fullName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-gray-900 text-lg truncate">
                                {entry.user.fullName}
                              </h5>
                              <p className="text-sm text-gray-600 mt-1">
                                {getRankDescription(index + 1)}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center space-x-1">
                                  <Sword className="h-3 w-3" />
                                  <span>{entry.user.specialization}</span>
                                </span>
                                {entry.user.collegeName && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {entry.user.collegeName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {entry.solveCount && (
                            <div className="text-center">
                              <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-200">
                                <GitCommit className="h-3 w-3" />
                                <span>
                                  {entry.solveCount} challenges completed
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remaining Competitors */}
                <div className="p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Competitive Rankings</span>
                    <span className="text-sm text-gray-500 font-normal">
                      Demonstrating growing expertise
                    </span>
                  </h4>

                  <div className="space-y-3">
                    {currentData.slice(3).map((entry, index) => (
                      <div
                        key={entry._id}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-transparent hover:border-primary-200 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 text-center">
                            <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-2 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                              {index + 4}
                            </span>
                          </div>

                          <div className="h-12 w-12 bg-gradient-to-br from-primary-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                            <User className="h-6 w-6 text-primary-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                              {entry.user.fullName}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-500">
                                {entry.user.specialization}
                              </span>
                              {entry.user.collegeName && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-sm text-gray-500">
                                    {entry.user.collegeName}
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
                              <Target className="h-3 w-3" />
                              <span>{getRankDescription(index + 4)}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-black text-primary-600 bg-primary-50 px-4 py-2 rounded-lg border border-primary-200">
                            {entry.totalPoints || entry.points}
                          </div>
                          <div className="text-sm text-gray-500 mt-1 font-semibold flex items-center space-x-1 justify-end">
                            <Star className="h-3 w-3" />
                            <span>POINTS</span>
                          </div>
                          {entry.solveCount && (
                            <div className="text-xs text-gray-400 mt-1 bg-gray-100 px-2 py-1 rounded flex items-center space-x-1">
                              <GitPullRequest className="h-3 w-3" />
                              <span>
                                {entry.solveCount} successful submissions
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="h-24 w-24 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Trophy className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Competition Awaits
                </h3>
                <p className="text-gray-500 max-w-md mx-auto text-lg mb-6">
                  The leaderboard is ready for the first participants to
                  showcase their skills and begin their journey to the top.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 max-w-sm mx-auto">
                  <p className="text-blue-800 text-sm flex items-center justify-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>
                      Be the first to make your mark on the scoreboard
                    </span>
                  </p>
                </div>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Statistics */}
        {currentData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white overflow-hidden">
              <Card.Content className="p-6 text-center relative">
                <div className="absolute top-4 right-4 opacity-20">
                  <Users className="h-12 w-12" />
                </div>
                <Users className="h-10 w-10 mx-auto mb-3" />
                <div className="text-4xl font-black mb-1">
                  {currentData.length}
                </div>
                <div className="font-bold">Active Participants</div>
                <div className="text-blue-100 text-sm mt-2 flex items-center justify-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Building cybersecurity expertise</span>
                </div>
              </Card.Content>
            </Card>

            <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden">
              <Card.Content className="p-6 text-center relative">
                <div className="absolute top-4 right-4 opacity-20">
                  <Trophy className="h-12 w-12" />
                </div>
                <Trophy className="h-10 w-10 mx-auto mb-3" />
                <div className="text-4xl font-black mb-1">
                  {Math.max(
                    ...currentData.map((e) => e.totalPoints || e.points)
                  )}
                </div>
                <div className="font-bold">Leading Score</div>
                <div className="text-green-100 text-sm mt-2 flex items-center justify-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Setting the performance standard</span>
                </div>
              </Card.Content>
            </Card>

            <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden">
              <Card.Content className="p-6 text-center relative">
                <div className="absolute top-4 right-4 opacity-20">
                  <Sparkles className="h-12 w-12" />
                </div>
                <Sparkles className="h-10 w-10 mx-auto mb-3" />
                <div className="text-4xl font-black mb-1">
                  {Math.round(
                    currentData.reduce(
                      (sum, e) => sum + (e.totalPoints || e.points),
                      0
                    ) / currentData.length
                  )}
                </div>
                <div className="font-bold">Average Performance</div>
                <div className="text-purple-100 text-sm mt-2 flex items-center justify-center space-x-1">
                  <GitBranch className="h-3 w-3" />
                  <span>Collective skill level</span>
                </div>
              </Card.Content>
            </Card>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default Leaderboard;
