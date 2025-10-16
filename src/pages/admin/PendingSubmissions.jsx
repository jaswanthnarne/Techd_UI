import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { submissionAdminAPI } from '../../services/admin';
import { 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Calendar,
  Download,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const PendingSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await submissionAdminAPI.getPendingSubmissions({ 
        page, 
        limit: 20 
      });
      setSubmissions(response.data.submissions);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch pending submissions');
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
      fetchPendingSubmissions();
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
      fetchPendingSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject submission');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchPendingSubmissions(newPage);
  };

  return (
    <Layout title="Pending Submissions" subtitle="Review and process pending CTF submissions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Submissions</h1>
            <p className="text-gray-600 mt-1">
              Review and approve/reject submissions awaiting review
            </p>
          </div>
          <Button onClick={() => fetchPendingSubmissions()} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Alert Banner */}
        {submissions.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  {submissions.length} submission(s) pending review
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  These submissions are waiting for your review and action.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submissions List */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Review ({pagination.total || 0})
            </h3>
          </Card.Header>
          <Card.Content>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8"></div>
                <span className="ml-3 text-gray-600">Loading pending submissions...</span>
              </div>
            ) : submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div 
                    key={submission._id} 
                    className="border border-yellow-200 rounded-lg p-4 hover:bg-yellow-50 transition-colors duration-150"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {submission.user?.fullName}
                            </span>
                            <span className="text-sm text-gray-500 hidden sm:inline">
                              ({submission.user?.email})
                            </span>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{submission.ctf?.title}</span>
                            {submission.ctf?.category && (
                              <span className="text-gray-500">({submission.ctf.category})</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {new Date(submission.submittedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border">
                              {submission.flag}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleViewSubmission(submission._id)}
                          className="flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Review</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-500">No pending submissions to review.</p>
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

// Reuse the same ReviewModal component from AdminSubmissions
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
      title="Review Pending Submission"
      size="3xl"
    >
      <div className="space-y-6">
        {/* Submission Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            </div>
          </div>

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
                <span className="text-sm font-medium text-gray-500">Flag:</span>
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
            </div>
          )}
        </div>

        {/* Custom Points */}
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
            </div>
          )}
        </div>

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

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
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
        </div>
      </div>
    </Modal>
  );
};

export default PendingSubmissions;