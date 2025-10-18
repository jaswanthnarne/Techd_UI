import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { submissionAdminAPI } from "../../services/admin";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Calendar,
  Download,
  RefreshCw,
  Shield,
  Target,
  Zap,
  Crown,
  Sparkles,
  Award,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    fetchSubmissions();
  }, [filters.status, filters.page]);

  useEffect(() => {
    filterSubmissions();
  }, [filters.search, submissions]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: filters.limit,
        status: filters.status !== "all" ? filters.status : undefined,
      };

      const response = await submissionAdminAPI.getAllSubmissions(params);
      setSubmissions(response.data.submissions);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    if (!filters.search.trim()) {
      setFilteredSubmissions(submissions);
      return;
    }

    const searchTerm = filters.search.toLowerCase();
    const filtered = submissions.filter(
      (submission) =>
        submission.user?.fullName?.toLowerCase().includes(searchTerm) ||
        submission.user?.email?.toLowerCase().includes(searchTerm) ||
        submission.ctf?.title?.toLowerCase().includes(searchTerm) ||
        submission.flag?.toLowerCase().includes(searchTerm)
    );

    setFilteredSubmissions(filtered);
  };

  const handleViewSubmission = async (submissionId) => {
    try {
      const response = await submissionAdminAPI.getSubmission(submissionId);
      setSelectedSubmission(response.data.submission);
      setShowReviewModal(true);
    } catch (error) {
      toast.error("Failed to fetch submission details");
    }
  };

  const handleApprove = async (feedback = "", points = null) => {
    if (!selectedSubmission) return;

    try {
      setActionLoading(true);
      const data = {};
      if (feedback) data.feedback = feedback;
      if (points !== null) data.points = points;

      await submissionAdminAPI.approveSubmission(selectedSubmission._id, data);
      toast.success("✅ Mission evidence approved successfully");
      setShowReviewModal(false);
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to approve submission"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (feedback) => {
    if (!selectedSubmission || !feedback.trim()) {
      toast.error("Feedback is required for rejection");
      return;
    }

    try {
      setActionLoading(true);
      await submissionAdminAPI.rejectSubmission(selectedSubmission._id, {
        feedback,
      });
      toast.success("❌ Mission evidence rejected");
      setShowReviewModal(false);
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reject submission");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color:
          "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200",
        icon: Clock,
        label: "Under Review",
      },
      approved: {
        color:
          "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200",
        icon: CheckCircle,
        label: "Mission Success",
      },
      rejected: {
        color:
          "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200",
        icon: XCircle,
        label: "Mission Failed",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1.5" />
        {config.label}
      </span>
    );
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const displaySubmissions = filters.search ? filteredSubmissions : submissions;

  return (
    <Layout
      title="Command Center"
      subtitle="Review and manage mission evidence"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-8">
            <div className="text-center sm:text-left">
              <div className="flex items-center space-x-4 mb-3">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Command Center
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Review and manage mission evidence submissions
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={fetchSubmissions}
                variant="outline"
                className="flex items-center space-x-2 border-2 hover:shadow-lg transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Intel</span>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <Card.Content className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search by agent name, email, mission title, or flag..."
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      className="block w-full pl-12 pr-4 py-3 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-sm text-lg"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="w-full sm:w-48">
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                        page: 1,
                      }))
                    }
                    className="block w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-sm"
                  >
                    <option value="all">All Missions</option>
                    <option value="pending">Under Review</option>
                    <option value="approved">Mission Success</option>
                    <option value="rejected">Mission Failed</option>
                  </select>
                </div>

                {/* Show/Hide Filters */}
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="flex items-center space-x-2 border-2 hover:shadow-lg transition-all px-6"
                >
                  <Filter className="h-4 w-4" />
                  <span>Advanced Filters</span>
                </Button>
              </div>

              {/* Additional Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Items Per Page
                    </label>
                    <select
                      value={filters.limit}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          limit: parseInt(e.target.value),
                          page: 1,
                        }))
                      }
                      className="block w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option value={10}>10 missions</option>
                      <option value={20}>20 missions</option>
                      <option value={50}>50 missions</option>
                      <option value={100}>100 missions</option>
                    </select>
                  </div>
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Submissions List */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <Card.Header className="pb-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Mission Evidence{" "}
                    {pagination.total !== undefined && (
                      <span className="text-blue-600">
                        ({pagination.total})
                      </span>
                    )}
                  </h3>
                </div>
                {filters.search && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                    Showing {filteredSubmissions.length} of {submissions.length}{" "}
                    results
                  </span>
                )}
              </div>
            </Card.Header>
            <Card.Content className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <Shield className="h-8 w-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-gray-600 text-lg">
                    Decrypting mission logs...
                  </p>
                </div>
              ) : displaySubmissions.length > 0 ? (
                <div className="space-y-6">
                  {displaySubmissions.map((submission) => (
                    <div
                      key={submission._id}
                      className="border-0 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1">
                          {/* User Info & Status */}
                          <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 text-lg">
                                  {submission.user?.fullName || "Unknown Agent"}
                                </span>
                                <span className="text-sm text-gray-500 block sm:inline sm:ml-2">
                                  {submission.user?.email ||
                                    "No communication channel"}
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(submission.submissionStatus)}
                          </div>

                          {/* Submission Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-blue-100">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {submission.ctf?.title ||
                                    "Classified Mission"}
                                </div>
                                {submission.ctf?.category && (
                                  <div className="text-xs text-gray-500">
                                    {submission.ctf.category}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-green-100">
                              <Calendar className="h-4 w-4 text-green-500" />
                              <div className="text-sm text-gray-600">
                                {new Date(
                                  submission.submittedAt
                                ).toLocaleString()}
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-purple-100">
                              <Zap className="h-4 w-4 text-purple-500" />
                              <span className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg border">
                                {submission.flag}
                              </span>
                            </div>

                            {submission.points > 0 && (
                              <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-yellow-100">
                                <Award className="h-4 w-4 text-yellow-500" />
                                <span className="font-bold text-green-600 text-lg">
                                  {submission.points} pts
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Admin Feedback */}
                          {submission.adminFeedback && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                              <span className="font-semibold text-blue-800">
                                Command Feedback:
                              </span>
                              <span className="text-blue-700 ml-2">
                                {submission.adminFeedback}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <Button
                            onClick={() => handleViewSubmission(submission._id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2 border-2 hover:shadow-lg transition-all group-hover:bg-blue-600 group-hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Review Evidence</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-gray-100 to-blue-100 rounded-2xl">
                      <FileText className="h-16 w-16 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Mission Logs Found
                  </h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    {filters.status !== "all" || filters.search
                      ? "No mission evidence matches your current filters."
                      : "No mission evidence has been submitted yet."}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8 pt-8 border-t border-gray-200">
                  <Button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    variant="outline"
                    size="sm"
                    className="border-2 px-6"
                  >
                    Previous
                  </Button>

                  <span className="text-sm text-gray-600 font-medium bg-gray-100 px-4 py-2 rounded-full">
                    Page {pagination.page} of {pagination.pages}
                  </span>

                  <Button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    variant="outline"
                    size="sm"
                    className="border-2 px-6"
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />
    </Layout>
  );
};

// Review Modal Component
const ReviewModal = ({
  isOpen,
  onClose,
  submission,
  onApprove,
  onReject,
  loading,
}) => {
  const [feedback, setFeedback] = useState("");
  const [customPoints, setCustomPoints] = useState("");
  const [showCustomPoints, setShowCustomPoints] = useState(false);

  useEffect(() => {
    if (submission) {
      setFeedback("");
      setCustomPoints("");
      setShowCustomPoints(false);
    }
  }, [submission]);

  const handleApprove = () => {
    const points =
      showCustomPoints && customPoints ? parseInt(customPoints) : null;
    onApprove(feedback, points);
  };

  const handleReject = () => {
    onReject(feedback);
  };

  if (!submission) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Mission Evidence"
      size="4xl"
    >
      <div className="space-y-8">
        {/* Submission Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agent Information */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <Card.Content className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h4 className="font-bold text-gray-900 text-lg">
                  User Information
                </h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-blue-100">
                  <span className="text-sm font-semibold text-gray-600">
                    User Name:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {submission.user?.fullName}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-blue-100">
                  <span className="text-sm font-semibold text-gray-600">
                    Communication:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {submission.user?.email}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-blue-100">
                  <span className="text-sm font-semibold text-gray-600">
                    Engagement Time:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </span>
                </div>
                {submission.attemptNumber && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-blue-100">
                    <span className="text-sm font-semibold text-gray-600">
                      Mission Attempt:
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      #{submission.attemptNumber}
                    </span>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Mission Information */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <Card.Content className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="h-5 w-5 text-green-600" />
                <h4 className="font-bold text-gray-900 text-lg">
                  Mission Information
                </h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-green-100">
                  <span className="text-sm font-semibold text-gray-600">
                    Mission:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {submission.ctf?.title}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-green-100">
                  <span className="text-sm font-semibold text-gray-600">
                    Category:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {submission.ctf?.category}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-green-100">
                  <span className="text-sm font-semibold text-gray-600">
                    Mission Value:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {submission.ctf?.points} pts
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-green-100">
                  <span className="text-sm font-semibold text-gray-600">
                    Flag Captured:
                  </span>
                  <span className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg border font-bold">
                    {submission.flag}
                  </span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Screenshot Evidence */}
        <Card className="border-0 shadow-lg">
          <Card.Content className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="h-5 w-5 text-purple-600" />
              <h4 className="font-bold text-gray-900 text-lg">
                Mission Evidence
              </h4>
            </div>
            {submission.screenshot?.url ? (
              <div className="border-2 border-dashed border-purple-200 rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <img
                  src={submission.screenshot.url}
                  alt="Mission evidence"
                  className="w-full max-h-96 object-contain rounded-xl mx-auto shadow-lg"
                />
                <div className="flex justify-between items-center mt-6">
                  <span className="text-sm text-gray-600 font-medium">
                    {submission.screenshot.filename}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(submission.screenshot.url, "_blank")
                    }
                    className="flex items-center space-x-2 border-2 hover:shadow-lg"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Evidence</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-gray-50">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-bold text-lg">
                  No Evidence Available
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Agent did not provide visual evidence
                </p>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Custom Points Option */}
        {submission.submissionStatus === "pending" && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50">
            <Card.Content className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Award className="h-5 w-5 text-yellow-600" />
                <h4 className="font-bold text-gray-900 text-lg">
                  Mission Rewards
                </h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="customPoints"
                    checked={showCustomPoints}
                    onChange={(e) => setShowCustomPoints(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                  />
                  <label
                    htmlFor="customPoints"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Award custom mission points (Default:{" "}
                    {submission.ctf?.points} points)
                  </label>
                </div>
                {showCustomPoints && (
                  <div className="ml-8">
                    <input
                      type="number"
                      value={customPoints}
                      onChange={(e) => setCustomPoints(e.target.value)}
                      placeholder="Enter custom points"
                      min="0"
                      className="block w-40 px-4 py-3 border-0 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                    />
                    <p className="text-xs text-gray-500 mt-2 ml-1">
                      Override default mission point value
                    </p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Command Feedback */}
        <Card className="border-0 shadow-lg">
          <Card.Content className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h4 className="font-bold text-gray-900 text-lg">
                Command Feedback
              </h4>
              <span className="text-red-500 text-sm font-semibold">*</span>
              <span className="text-gray-500 text-sm">
                (Required for mission failure, optional for success)
              </span>
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback for the agent's mission performance..."
              rows={4}
              className="block w-full border-2 border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical text-lg bg-white"
            />
          </Card.Content>
        </Card>

        {/* Review History */}
        {submission.reviewedBy && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50">
            <Card.Content className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="h-5 w-5 text-gray-600" />
                <h4 className="font-bold text-gray-900 text-lg">
                  Review History
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200">
                  <span className="text-sm font-semibold text-gray-600">
                    Reviewed by:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {submission.reviewedBy?.fullName} (
                    {submission.reviewedBy?.email})
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200">
                  <span className="text-sm font-semibold text-gray-600">
                    Review time:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {new Date(submission.reviewedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading}
            className="border-2 px-8 py-3 text-lg"
          >
            Cancel Review
          </Button>

          {submission.submissionStatus === "pending" && (
            <>
              <Button
                onClick={handleReject}
                loading={loading}
                disabled={!feedback.trim()}
                variant="outline"
                className="border-2 border-red-300 text-red-700 hover:bg-red-50 px-8 py-3 text-lg"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Mission Failed
              </Button>
              <Button
                onClick={handleApprove}
                loading={loading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 hover:shadow-lg px-8 py-3 text-lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Mission Success
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AdminSubmissions;
