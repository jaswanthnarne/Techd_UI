// components/admin/MarkedSubmissions.js
import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { markedSubmissionsAPI, submissionAdminAPI } from "../../services/admin";
import {
  Search,
  Eye,
  Flag,
  Clock,
  User,
  FileText,
  Calendar,
  Download,
  RefreshCw,
  Shield,
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  XCircle,
  BarChart3,
  Users,
  Target,
  Zap,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const MarkedSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 20,
  });

  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    fetchMarkedSubmissions();
    fetchMarkedStats();
  }, [filters.page]);

  useEffect(() => {
    filterSubmissions();
  }, [filters.search, submissions]);

  const fetchMarkedSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching marked submissions with params:", {
        page: filters.page,
        limit: filters.limit,
      });

      const response = await markedSubmissionsAPI.getMarkedSubmissions({
        page: filters.page,
        limit: filters.limit,
      });


      // Handle the response format consistently
      if (response.data && response.data.success) {
        // New format with success flag
        setSubmissions(response.data.data.submissions || []);
        setPagination(response.data.data.pagination || {});
      } else if (response.data && response.data.submissions) {
        // Old format without success flag
        setSubmissions(response.data.submissions);
        setPagination(response.data.pagination || {});
      } else if (response.data) {
        // Direct data structure
        setSubmissions(response.data || []);
        setPagination({});
      } else {
        setSubmissions([]);
        setPagination({});
      }
    } catch (error) {
      console.error("Failed to fetch marked submissions:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to load marked submissions";
      setError(errorMessage);
      toast.error(errorMessage);
      setSubmissions([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const fetchMarkedStats = async () => {
    try {
      const response = await markedSubmissionsAPI.getMarkedStats();
      if (response.data && response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch marked stats:", error);
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
        submission.reviewReason?.toLowerCase().includes(searchTerm)
    );

    setFilteredSubmissions(filtered);
  };

  const handleViewSubmission = async (submissionId) => {
    try {
      const response = await submissionAdminAPI.getSubmission(submissionId);
      setSelectedSubmission(response.data.submission);
      setShowDetailModal(true);
    } catch (error) {
      toast.error("Failed to fetch submission details");
    }
  };

  const handleUnmark = async (submissionId) => {
    if (
      !confirm("Are you sure you want to unmark this submission from review?")
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await markedSubmissionsAPI.unmarkReview(submissionId);

      // Remove from marked submissions list immediately
      setSubmissions((prevSubmissions) =>
        prevSubmissions.filter((sub) => sub._id !== submissionId)
      );

      // Update pagination
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));

      toast.success("Submission unmarked from review");
      fetchMarkedStats(); // Refresh stats
    } catch (error) {
      toast.error("Failed to unmark submission");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error("Please enter a note");
      return;
    }

    try {
      setActionLoading(true);
      await markedSubmissionsAPI.addReviewNote(selectedSubmission._id, {
        note: newNote,
      });
      toast.success("Review note added successfully");
      setNewNote("");
      setShowNoteModal(false);
      fetchMarkedSubmissions();

      // Refresh the selected submission
      const response = await submissionAdminAPI.getSubmission(
        selectedSubmission._id
      );
      setSelectedSubmission(response.data.submission);
    } catch (error) {
      toast.error("Failed to add review note");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        icon: Clock,
        label: "Under Review",
      },
      approved: {
        color: "bg-green-100 text-green-800 border border-green-200",
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: XCircle,
        label: "Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
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
      title="Security Review"
      subtitle="Manage suspicious submissions marked for security review"
    >
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50/30 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-8">
          <div className="text-center sm:text-left">
            <div className="flex items-center space-x-4 mb-3">
              <div className="p-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Security Review
                </h1>
                <p className="text-gray-600 text-lg mt-2">
                  Monitor and manage suspicious submissions
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={fetchMarkedSubmissions}
              variant="outline"
              className="flex items-center space-x-2 border-2 hover:shadow-lg transition-all"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <Card className="border-0 bg-red-50 border-red-200 mb-6">
            <Card.Content className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-800">
                    Failed to Load Data
                  </h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
                <Button
                  onClick={fetchMarkedSubmissions}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Retry
                </Button>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Stats Overview */}
        {stats && !error && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 bg-gradient-to-br from-red-50 to-pink-50">
              <Card.Content className="p-6 text-center">
                <div className="p-3 bg-red-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {stats.totalMarked}
                </div>
                <div className="text-sm text-red-600 font-medium">
                  Total Marked
                </div>
              </Card.Content>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-yellow-50 to-amber-50">
              <Card.Content className="p-6 text-center">
                <div className="p-3 bg-yellow-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-yellow-700">
                  {stats.byStatus?.find((s) => s._id === "pending")?.count || 0}
                </div>
                <div className="text-sm text-yellow-600 font-medium">
                  Pending Review
                </div>
              </Card.Content>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
              <Card.Content className="p-6 text-center">
                <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {stats.byCategory?.length || 0}
                </div>
                <div className="text-sm text-blue-600 font-medium">
                  Categories
                </div>
              </Card.Content>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <Card.Content className="p-6 text-center">
                <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {stats.recent?.length || 0}
                </div>
                <div className="text-sm text-green-600 font-medium">Recent</div>
              </Card.Content>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        {!error && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6">
            <Card.Content className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search marked submissions by user, CTF, or reason..."
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      className="block w-full pl-12 pr-4 py-3 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Submissions List */}
        {!error && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <Card.Header className="pb-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <Flag className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Marked Submissions{" "}
                    {pagination.total !== undefined && (
                      <span className="text-red-600">({pagination.total})</span>
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
                    <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                    <Shield className="h-8 w-8 text-red-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-gray-600">Loading security reviews...</p>
                </div>
              ) : displaySubmissions.length > 0 ? (
                <div className="space-y-6">
                  {displaySubmissions.map((submission) => (
                    <div
                      key={submission._id}
                      className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-2 border-red-200"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1">
                          {/* Header with user info and status */}
                          <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-white rounded-lg border border-red-200">
                                <User className="h-4 w-4 text-red-600" />
                              </div>
                              <div>
                                <span className="font-bold text-gray-900">
                                  {submission.user?.fullName || "Unknown User"}
                                </span>
                                <span className="text-sm text-gray-500 block sm:inline sm:ml-2">
                                  {submission.user?.email || "No email"}
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(submission.submissionStatus)}
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Security Flagged
                            </span>
                          </div>

                          {/* Submission Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-red-100">
                              <FileText className="h-4 w-4 text-red-500" />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {submission.ctf?.title || "Unknown CTF"}
                                </div>
                                {submission.ctf?.category && (
                                  <div className="text-xs text-gray-500">
                                    {submission.ctf.category}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-red-100">
                              <Calendar className="h-4 w-4 text-red-500" />
                              <div className="text-sm text-gray-600">
                                Marked:{" "}
                                {new Date(submission.markedAt).toLocaleString()}
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-red-100">
                              <Zap className="h-4 w-4 text-red-500" />
                              <span className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg border">
                                {submission.flag}
                              </span>
                            </div>

                            {submission.points > 0 && (
                              <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-red-100">
                                <Target className="h-4 w-4 text-red-500" />
                                <span className="font-bold text-green-600">
                                  {submission.points} pts
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Review Reason */}
                          <div className="mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="font-semibold text-red-700">
                                Review Reason:
                              </span>
                            </div>
                            <p className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                              {submission.reviewReason}
                            </p>
                          </div>

                          {/* Review Notes Preview */}
                          {submission.reviewNotes &&
                            submission.reviewNotes.length > 0 && (
                              <div className="mb-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <MessageSquare className="h-4 w-4 text-blue-500" />
                                  <span className="font-semibold text-blue-700">
                                    Review Notes (
                                    {submission.reviewNotes.length})
                                  </span>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <p className="text-blue-700 text-sm">
                                    {
                                      submission.reviewNotes[
                                        submission.reviewNotes.length - 1
                                      ].note
                                    }
                                  </p>
                                  <p className="text-blue-500 text-xs mt-1">
                                    By{" "}
                                    {
                                      submission.reviewNotes[
                                        submission.reviewNotes.length - 1
                                      ].addedBy?.fullName
                                    }{" "}
                                    •{" "}
                                    {new Date(
                                      submission.reviewNotes[
                                        submission.reviewNotes.length - 1
                                      ].addedAt
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-3 flex-shrink-0">
                          <Button
                            onClick={() => handleViewSubmission(submission._id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2 border-2 hover:shadow-lg transition-all"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Review Details</span>
                          </Button>
                          <Button
                            onClick={() => handleUnmark(submission._id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2 border-2 border-green-300 text-green-700 hover:bg-green-50 transition-all"
                            disabled={actionLoading}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Unmark</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
                      <CheckCircle className="h-16 w-16 text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Security Flags
                  </h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    {filters.search
                      ? "No marked submissions match your search criteria."
                      : "No submissions are currently marked for security review."}
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
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
        onAddNote={() => setShowNoteModal(true)}
        onUnmark={handleUnmark}
      />

      {/* Add Note Modal */}
      <NoteModal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setNewNote("");
        }}
        note={newNote}
        setNote={setNewNote}
        onAdd={handleAddNote}
        loading={actionLoading}
      />
    </Layout>
  );
};

// Detail Modal Component
const DetailModal = ({ isOpen, onClose, submission, onAddNote, onUnmark }) => {
  if (!submission) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      title="Security Review Details"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Content className="p-6">
              <h4 className="font-bold text-gray-900 mb-4">User Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name:</span>
                  <span className="text-sm font-medium">
                    {submission.user?.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Email:</span>
                  <span className="text-sm font-medium">
                    {submission.user?.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Submitted:</span>
                  <span className="text-sm font-medium">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content className="p-6">
              <h4 className="font-bold text-gray-900 mb-4">CTF Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Challenge:</span>
                  <span className="text-sm font-medium">
                    {submission.ctf?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="text-sm font-medium">
                    {submission.ctf?.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Points:</span>
                  <span className="text-sm font-medium text-green-600">
                    {submission.ctf?.points || submission.points || 0}
                  </span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Review Information */}
        <Card>
          <Card.Content className="p-6">
            <h4 className="font-bold text-gray-900 mb-4">Security Review</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Review Reason
                </label>
                <p className="mt-1 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  {submission.reviewReason}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Marked By
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {submission.markedBy?.fullName} on{" "}
                  {new Date(submission.markedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Review Notes */}
        <Card>
          <Card.Content className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-900">Review Notes</h4>
              <Button
                onClick={onAddNote}
                size="sm"
                className="flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Add Note</span>
              </Button>
            </div>
            <div className="space-y-4">
              {submission.reviewNotes && submission.reviewNotes.length > 0 ? (
                submission.reviewNotes
                  .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
                  .map((note, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg"
                    >
                      <p className="text-sm text-gray-900">{note.note}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        By {note.addedBy?.fullName} •{" "}
                        {new Date(note.addedAt).toLocaleString()}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No review notes yet.
                </p>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          <Button
            onClick={() => onUnmark(submission._id)}
            className="bg-green-600 hover:bg-green-700 border-0"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Unmark from Review
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Note Modal Component
const NoteModal = ({ isOpen, onClose, note, setNote, onAdd, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Review Note">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="block w-full border border-gray-300 rounded-lg shadow-sm px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-vertical"
            placeholder="Enter additional notes or observations about this submission..."
          />
        </div>
        <div className="flex justify-end space-x-3">
          <Button onClick={onClose} variant="outline" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onAdd} disabled={!note.trim() || loading}>
            <MessageSquare className="h-4 w-4 mr-2" />
            {loading ? "Adding..." : "Add Note"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MarkedSubmissions;