// Leaderboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { leaderboardAPI } from "../../services/admin";
import {
  Trophy,
  Crown,
  Award,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Download,
  Filter,
  Search,
  Eye,
  Calendar,
  Star,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import toast from "react-hot-toast";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAnalytics, setStudentAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [filters, setFilters] = useState({
    timeRange: "all",
    category: "all",
    search: ""
  });

  const timeRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "30d", label: "Last 30 Days" },
    { value: "7d", label: "Last 7 Days" },
    { value: "24h", label: "Last 24 Hours" }
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "Web Security", label: "Web Security" },
    { value: "Cryptography", label: "Cryptography" },
    { value: "Forensics", label: "Forensics" },
    { value: "Reverse Engineering", label: "Reverse Engineering" },
    { value: "Pwn", label: "Pwn" },
    { value: "Misc", label: "Misc" }
  ];

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await leaderboardAPI.getLeaderboard(filters);
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      toast.error("Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStudentAnalytics = useCallback(async (userId) => {
    try {
      setAnalyticsLoading(true);
      const response = await leaderboardAPI.getStudentAnalytics(userId);
      setStudentAnalytics(response.data.analytics);
    } catch (error) {
      toast.error("Failed to fetch student analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const handleStudentClick = useCallback(async (student) => {
    setSelectedStudent(student);
    await fetchStudentAnalytics(student.user._id);
  }, [fetchStudentAnalytics]);

  const exportLeaderboard = useCallback(async () => {
    try {
      const response = await leaderboardAPI.exportLeaderboard(filters);
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leaderboard-${filters.timeRange}-${filters.category}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Leaderboard exported successfully');
    } catch (error) {
      toast.error('Failed to export leaderboard');
    }
  }, [filters]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return <Crown className="h-6 w-6 text-yellow-500" />;
    } else if (rank === 2) {
      return <Award className="h-6 w-6 text-gray-400" />;
    } else if (rank === 3) {
      return <Award className="h-6 w-6 text-amber-600" />;
    }
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-400 to-gray-600";
    if (rank === 3) return "from-amber-600 to-amber-800";
    return "from-blue-500 to-purple-600";
  };

  const filteredLeaderboard = leaderboard.filter(student =>
    student.user.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
    student.user.email.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <Layout
      title="Student Leaderboard"
      subtitle="Track student performance and rankings"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-12">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="p-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 via-red-600 to-yellow-600 bg-clip-text text-transparent">
              LEADERBOARD
            </h1>
            <div className="p-4 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-2xl shadow-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time student rankings and performance analytics
          </p>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-xl mb-6 bg-white/80 backdrop-blur-sm">
          <Card.Content className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <select
                    value={filters.timeRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/50"
                  >
                    {timeRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-gray-500" />
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/50"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/50"
                  />
                </div>
              </div>

              <Button
                onClick={exportLeaderboard}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 border-0 hover:shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* Leaderboard */}
        <Card className="border-0 shadow-xl">
          <Card.Content className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider w-20">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      CTFs Solved
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Total Points
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Avg Points
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Last Activity
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
                            Loading leaderboard...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredLeaderboard.length > 0 ? (
                    filteredLeaderboard.map((student) => (
                      <tr
                        key={student.user._id}
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            {getRankBadge(student.rank)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 bg-gradient-to-r ${getRankColor(student.rank)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                              {student.user.fullName?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {student.user.fullName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {student.user.email}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Shield className="h-3 w-3 text-blue-500" />
                                <span className="text-xs text-blue-600 font-medium">
                                  {student.user.expertiseLevel}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                            {student.user.specialization || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-lg font-bold text-gray-900">
                              {student.ctfsSolved}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-lg font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                              {student.totalPoints}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-blue-500" />
                            <span className="text-lg font-bold text-gray-900">
                              {Math.round(student.avgPoints * 100) / 100}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {student.lastActivity 
                                ? new Date(student.lastActivity).toLocaleDateString()
                                : "No activity"
                              }
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleStudentClick(student)}
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
                      <td colSpan="8" className="px-4 py-12 text-center">
                        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          No Students Found
                        </h3>
                        <p className="text-gray-500">
                          {filters.search ? "Try adjusting your search" : "No students have completed CTFs yet"}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>

        {/* Student Analytics Modal */}
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          size="max-w-6xl"
        >
          {selectedStudent && (
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              {analyticsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full border-2 border-gray-300 border-t-purple-600 h-8 w-8"></div>
                  <span className="ml-3 text-gray-600">Loading analytics...</span>
                </div>
              ) : studentAnalytics ? (
                <>
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {selectedStudent.user.fullName?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          {selectedStudent.user.fullName}
                        </h2>
                        <p className="text-gray-600 text-lg">{selectedStudent.user.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                            <Shield className="h-3 w-3 mr-1" />
                            {selectedStudent.user.expertiseLevel}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                            Rank #{selectedStudent.rank}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => setSelectedStudent(null)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg"
                      >
                        Close
                      </Button>
                    </div>
                  </div>

                  {/* Overview Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg">
                      <Card.Content className="p-4 text-center">
                        <div className="text-2xl font-black text-blue-700">
                          {studentAnalytics.overview.totalPoints}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">Total Points</div>
                      </Card.Content>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
                      <Card.Content className="p-4 text-center">
                        <div className="text-2xl font-black text-green-700">
                          {studentAnalytics.overview.totalSubmissions}
                        </div>
                        <div className="text-sm text-green-600 font-medium">Submissions</div>
                      </Card.Content>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
                      <Card.Content className="p-4 text-center">
                        <div className="text-2xl font-black text-purple-700">
                          {studentAnalytics.overview.avgPoints}
                        </div>
                        <div className="text-sm text-purple-600 font-medium">Avg Points</div>
                      </Card.Content>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg">
                      <Card.Content className="p-4 text-center">
                        <div className="text-2xl font-black text-yellow-700">
                          {studentAnalytics.overview.successRate}%
                        </div>
                        <div className="text-sm text-yellow-600 font-medium">Success Rate</div>
                      </Card.Content>
                    </Card>
                  </div>

                  {/* CTF Status */}
                  <Card className="border-0 shadow-lg mb-6">
                    <Card.Content className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-purple-600" />
                        CTF Completion Status
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-black text-blue-600">{studentAnalytics.overview.ctfStatus.total}</div>
                          <div className="text-sm text-gray-600">Total Attempted</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-green-600">{studentAnalytics.overview.ctfStatus.solved}</div>
                          <div className="text-sm text-gray-600">Solved</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-yellow-600">{studentAnalytics.overview.ctfStatus.attempted}</div>
                          <div className="text-sm text-gray-600">Attempted</div>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>

                  {/* Category Performance */}
                  <Card className="border-0 shadow-lg mb-6">
                    <Card.Content className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                        Category Performance
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(studentAnalytics.categoryPerformance).map(([category, stats]) => (
                          <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-900">{category}</span>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600">{stats.count} solves</span>
                              <span className="font-bold text-purple-600">{Math.round(stats.avgPoints * 100) / 100} avg points</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card.Content>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="border-0 shadow-lg">
                    <Card.Content className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-blue-600" />
                        Recent Activity
                      </h3>
                      <div className="space-y-3">
                        {studentAnalytics.recentActivity.map((submission, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">{submission.ctf.title}</div>
                              <div className="text-sm text-gray-600">{submission.ctf.category} • {submission.ctf.difficulty}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">+{submission.points} pts</div>
                              <div className="text-sm text-gray-500">
                                {new Date(submission.submittedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card.Content>
                  </Card>
                </>
              ) : (
                <div className="text-center py-12">
                  <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load analytics</h3>
                  <p className="text-gray-500">Please try again later</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Leaderboard;