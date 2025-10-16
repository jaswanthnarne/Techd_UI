import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { submissionAdminAPI } from '../../services/admin';
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
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

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
    status: 'all',
    search: '',
    page: 1,
    limit: 20
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
        status: filters.status !== 'all' ? filters.status : undefined
      };
      
      const response = await submissionAdminAPI.getAllSubmissions(params);
      setSubmissions(response.data.submissions);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch submissions');
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
    const filtered = submissions.filter(submission => 
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
      toast.error('Failed to fetch submission details');
    }
  };

  const handleApprove = async (feedback = '', points = null) => {
    if (!selectedSubmission) return;

    try {
      setActionLoading(true);
      const data = {};
      if (feedback) data.feedback = feedback;
      if (points !== null) data.points = points;
      
      await submissionAdminAPI.approveSubmission(selectedSubmission._id, data);
      toast.success('Submission approved successfully');
      setShowReviewModal(false);
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve submission');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (feedback) => {
    if (!selectedSubmission || !feedback.trim()) {
      toast.error('Feedback is required for rejection');
      return;
    }

    try {
      setActionLoading(true);
      await submissionAdminAPI.rejectSubmission(selectedSubmission._id, { feedback });
      toast.success('Submission rejected successfully');
      setShowReviewModal(false);
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject submission');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock, 
        label: 'Pending' 
      },
      approved: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle, 
        label: 'Approved' 
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle, 
        label: 'Rejected' 
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const displaySubmissions = filters.search ? filteredSubmissions : submissions;

  return (
    <Layout title="Submissions Management" subtitle="Review and manage all CTF submissions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Submissions Management</h1>
            <p className="text-gray-600 mt-1">
              Review, approve, or reject student CTF submissions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={fetchSubmissions} 
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <Card.Content className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by name, email, CTF title, or flag..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-48">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Show/Hide Filters */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </div>

            {/* Additional Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Items per page
                  </label>
                  <select
                    value={filters.limit}
                    onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Submissions List */}
        <Card>
          <Card.Header>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Submissions {pagination.total !== undefined && `(${pagination.total})`}
              </h3>
              {filters.search && (
                <span className="text-sm text-gray-500">
                  Showing {filteredSubmissions.length} of {submissions.length} results
                </span>
              )}
            </div>
          </Card.Header>
          <Card.Content>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8"></div>
                <span className="ml-3 text-gray-600">Loading submissions...</span>
              </div>
            ) : displaySubmissions.length > 0 ? (
              <div className="space-y-4">
                {displaySubmissions.map((submission) => (
                  <div 
                    key={submission._id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        {/* User Info & Status */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {submission.user?.fullName || 'Unknown User'}
                            </span>
                            <span className="text-sm text-gray-500 hidden sm:inline">
                              ({submission.user?.email || 'No email'})
                            </span>
                          </div>
                          {getStatusBadge(submission.submissionStatus)}
                        </div>
                        
                        {/* Submission Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <span className="font-medium text-gray-900">
                                {submission.ctf?.title || 'Unknown CTF'}
                              </span>
                              {submission.ctf?.category && (
                                <span className="text-gray-500 ml-2">
                                  ({submission.ctf.category})
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {new Date(submission.submittedAt).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border">
                              {submission.flag}
                            </span>
                          </div>

                          {submission.points > 0 && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-green-600">
                                {submission.points} pts
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Admin Feedback */}
                        {submission.adminFeedback && (
                          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                            <span className="font-medium text-blue-800">Admin Feedback:</span>
                            <span className="text-blue-700 ml-2">{submission.adminFeedback}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                          onClick={() => handleViewSubmission(submission._id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Review</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Found</h3>
                <p className="text-gray-500">
                  {filters.status !== 'all' || filters.search 
                    ? 'No submissions match your current filters.' 
                    : 'No submissions have been made yet.'
                  }
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </Card.Content>
        </Card>
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
const ReviewModal = ({ isOpen, onClose, submission, onApprove, onReject, loading }) => {
  const [feedback, setFeedback] = useState('');
  const [customPoints, setCustomPoints] = useState('');
  const [showCustomPoints, setShowCustomPoints] = useState(false);

  useEffect(() => {
    if (submission) {
      setFeedback('');
      setCustomPoints('');
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Submission"
      size="3xl"
    >
      <div className="space-y-6">
        {/* Submission Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">Student Information</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <span className="text-sm text-gray-900">{submission.user?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <span className="text-sm text-gray-900">{submission.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Submitted:</span>
                <span className="text-sm text-gray-900">
                  {new Date(submission.submittedAt).toLocaleString()}
                </span>
              </div>
              {submission.attemptNumber && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Attempt:</span>
                  <span className="text-sm text-gray-900">#{submission.attemptNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* CTF Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">CTF Information</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Challenge:</span>
                <span className="text-sm text-gray-900">{submission.ctf?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Category:</span>
                <span className="text-sm text-gray-900">{submission.ctf?.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Points:</span>
                <span className="text-sm text-gray-900">{submission.ctf?.points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Flag Submitted:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {submission.flag}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 border-b pb-2">Screenshot Evidence</h4>
          {submission.screenshot?.url ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <img 
                src={submission.screenshot.url} 
                alt="Submission screenshot"
                className="w-full max-h-96 object-contain rounded-lg mx-auto"
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-500">
                  {submission.screenshot.filename}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(submission.screenshot.url, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No screenshot available</p>
              <p className="text-sm text-gray-400 mt-1">
                Student did not provide screenshot evidence
              </p>
            </div>
          )}
        </div>

        {/* Custom Points Option */}
        {submission.submissionStatus === 'pending' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="customPoints"
                checked={showCustomPoints}
                onChange={(e) => setShowCustomPoints(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="customPoints" className="text-sm font-medium text-gray-700">
                Award custom points (default: {submission.ctf?.points} points)
              </label>
            </div>
            {showCustomPoints && (
              <div className="ml-6">
                <input
                  type="number"
                  value={customPoints}
                  onChange={(e) => setCustomPoints(e.target.value)}
                  placeholder="Enter custom points"
                  min="0"
                  className="block w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Override the default CTF points value
                </p>
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Admin Feedback
            <span className="text-red-500 ml-1">*</span>
            <span className="text-gray-500 font-normal ml-2">
              (Required for rejection, optional for approval)
            </span>
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide constructive feedback for the student..."
            rows={4}
            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          />
        </div>

        {/* Review History */}
        {submission.reviewedBy && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900">Review History</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Reviewed by:</span>
                <span className="ml-2 text-gray-900">
                  {submission.reviewedBy?.fullName} ({submission.reviewedBy?.email})
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Reviewed at:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(submission.reviewedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
          
          {submission.submissionStatus === 'pending' && (
            <>
              <Button
                onClick={handleReject}
                loading={loading}
                disabled={!feedback.trim()}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                loading={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AdminSubmissions;