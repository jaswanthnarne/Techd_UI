// MarkedSubmissions.jsx
import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { submissionAdminAPI } from "../../services/admin";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Calendar,
  Download,
  Bookmark,
  BookmarkCheck,
  Filter,
  Search,
  RefreshCw,
  Shield,
  Target,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";

const MarkedSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchMarkedSubmissions();
  }, []);

  const fetchMarkedSubmissions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await submissionAdminAPI.getMarkedForReview({
        page,
        limit: 20
      });
      setSubmissions(response.data.submissions);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch marked submissions");
    } finally {
      setLoading(false);
    }
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

  const handleUnmark = async (submissionId) => {
    try {
      setActionLoading(true);
      await submissionAdminAPI.unmarkFromReview(submissionId);
      toast.success("Submission unmarked from review");
      fetchMarkedSubmissions();
    } catch (error) {
      toast.error("Failed to unmark submission");
    } finally {
      setActionLoading(false);
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
      toast.success("Submission approved successfully");
      setShowReviewModal(false);
      setSelectedSubmission(null);
      fetchMarkedSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to approve submission");
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
      toast.success("Submission rejected successfully");
      setShowReviewModal(false);
      setSelectedSubmission(null);
      fetchMarkedSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reject submission");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchMarkedSubmissions(newPage);
  };

  return (
    <Layout
      title="Marked for Review"
      subtitle="Review submissions marked for detailed analysis"
    >
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50/30 pb-12">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <BookmarkCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              MARKED FOR REVIEW
            </h1>
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Detailed analysis of submissions requiring special attention
          </p>
        </div>

        {/* Control Panel */}
        <Card className="border-0 shadow-xl mb-8 bg-white/80 backdrop-blur-sm">
          <Card.Content className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bookmark className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Marked Submissions Hub
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Manage submissions flagged for detailed review
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  variant="outline"
                  onClick={() => fetchMarkedSubmissions()}
                  className="flex items-center space-x-2 border-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Submissions List */}
        <Card className="border-0 shadow-xl">
          <Card.Header className="bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <BookmarkCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Marked Mission Reports
                  </h3>
                  <p className="text-purple-200 text-sm">
                    {pagination.total || 0} submissions marked for detailed review
                  </p>
                </div>
              </div>
            </div>
          </Card.Header>
          <Card.Content className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full border-4 border-gray-300 border-t-purple-600 h-12 w-12 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">
                    Loading marked submissions...
                  </p>
                </div>
              </div>
            ) : submissions.length > 0 ? (
              <div className="space-y-4 p-6">
                {submissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {submission.user?.fullName
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">
                                {submission.user?.fullName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {submission.user?.email}
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg">
                            <BookmarkCheck className="h-4 w-4 mr-2" />
                            Marked for Review
                          </span>
                        </div>

                        {/* Review Notes */}
                        {submission.reviewNotes && (
                          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800 font-semibold">
                              Review Notes: {submission.reviewNotes}
                            </p>
                            {submission.markedAt && (
                              <p className="text-xs text-yellow-600 mt-1">
                                Marked on: {new Date(submission.markedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {submission.ctf?.title}
                              </p>
                              {submission.ctf?.category && (
                                <p className="text-xs text-gray-500">
                                  {submission.ctf.category}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <Calendar className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(submission.submittedAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(submission.submittedAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {submission.ctf?.points} pts
                              </p>
                              <p className="text-xs text-gray-500">
                                Potential Reward
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <Target className="h-5 w-5 text-purple-500" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900 font-mono">
                                {submission.flag}
                              </p>
                              <p className="text-xs text-gray-500">
                                Submitted Flag
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3">
                        <Button
                          onClick={() => handleViewSubmission(submission._id)}
                          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:shadow-lg min-w-[120px] justify-center"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Review</span>
                        </Button>
                        <Button
                          onClick={() => handleUnmark(submission._id)}
                          loading={actionLoading}
                          variant="outline"
                          className="flex items-center space-x-2 border-2 border-gray-300 hover:border-gray-400 min-w-[120px] justify-center"
                        >
                          <Bookmark className="h-4 w-4" />
                          <span>Unmark</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl inline-block mb-6">
                  <Bookmark className="h-16 w-16 text-green-500" />
                </div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                  No Marked Submissions
                </h3>
                <p className="text-gray-600 text-lg mb-2">
                  No submissions are currently marked for review
                </p>
                <p className="text-gray-500">
                  Mark submissions from the pending submissions page to see them here
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                  Showing page {pagination.page} of {pagination.pages} •{" "}
                  {pagination.total} total marked submissions
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    variant="outline"
                    className="flex items-center space-x-2 border-2"
                  >
                    <span>Previous</span>
                  </Button>

                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>

                  <Button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    variant="outline"
                    className="flex items-center space-x-2 border-2"
                  >
                    <span>Next</span>
                  </Button>
                </div>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Review Modal - Reuse the same modal from PendingSubmissions */}
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

// Reuse the ReviewModal component from PendingSubmissions
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
    const points = showCustomPoints && customPoints ? parseInt(customPoints) : null;
    onApprove(feedback, points);
  };

  const handleReject = () => {
    onReject(feedback);
  };

  if (!submission) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <div className="p-6">
        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
            <BookmarkCheck className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Review Marked Submission
          </h2>
        </div>

        {/* Rest of the modal content - same as PendingSubmissions */}
        {/* ... */}
      </div>
    </Modal>
  );
};

export default MarkedSubmissions;