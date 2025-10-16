// AdminScreenshotReview.jsx
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
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminScreenshotReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      setLoading(true);
      const response = await submissionAdminAPI.getPendingSubmissions();
      setSubmissions(response.data.submissions);
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

  const handleApprove = async () => {
    if (!selectedSubmission) return;

    try {
      setActionLoading(true);
      await submissionAdminAPI.approveSubmission(selectedSubmission._id, { feedback });
      toast.success('Submission approved successfully');
      setShowReviewModal(false);
      setSelectedSubmission(null);
      setFeedback('');
      fetchPendingSubmissions();
    } catch (error) {
      toast.error('Failed to approve submission');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
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
      setFeedback('');
      fetchPendingSubmissions();
    } catch (error) {
      toast.error('Failed to reject submission');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <Layout title="Screenshot Review" subtitle="Review and manage student submissions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Screenshot Review</h1>
            <p className="text-gray-600 mt-1">Review student submissions and approve/reject them</p>
          </div>
          <Button onClick={fetchPendingSubmissions} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Submissions List */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Submissions ({submissions.length})
            </h3>
          </Card.Header>
          <Card.Content>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8"></div>
                <span className="ml-3 text-gray-600">Loading submissions...</span>
              </div>
            ) : submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {submission.user?.fullName}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({submission.user?.email})
                            </span>
                          </div>
                          {getStatusBadge(submission.submissionStatus)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{submission.ctf?.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {new Date(submission.submittedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {submission.flag}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleViewSubmission(submission._id)}
                          variant="outline"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Submissions</h3>
                <p className="text-gray-500">All submissions have been reviewed.</p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedSubmission(null);
          setFeedback('');
        }}
        title="Review Submission"
        size="2xl"
      >
        {selectedSubmission && (
          <div className="space-y-6">
            {/* Submission Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="text-gray-900">{selectedSubmission.user?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-900">{selectedSubmission.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Submitted:</span>
                    <span className="text-gray-900">
                      {new Date(selectedSubmission.submittedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">CTF Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Challenge:</span>
                    <span className="text-gray-900">{selectedSubmission.ctf?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="text-gray-900">{selectedSubmission.ctf?.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Points:</span>
                    <span className="text-gray-900">{selectedSubmission.ctf?.points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Flag Submitted:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {selectedSubmission.flag}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshot */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Screenshot</h4>
              {selectedSubmission.screenshot?.url ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <img 
                    src={selectedSubmission.screenshot.url} 
                    alt="Submission screenshot"
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-gray-500">
                      {selectedSubmission.screenshot.filename}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedSubmission.screenshot.url, '_blank')}
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No screenshot available</p>
                </div>
              )}
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback for the student..."
                rows={4}
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Feedback is required for rejection and optional for approval.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedSubmission(null);
                  setFeedback('');
                }}
                variant="outline"
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                loading={actionLoading}
                disabled={!feedback.trim()}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                loading={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default AdminScreenshotReview;