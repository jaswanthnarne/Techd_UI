import React, { useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { CheckCircle, AlertCircle, Download, Users } from "lucide-react";

const BulkApprovalModal = ({
  isOpen,
  onClose,
  selectedSubmissions,
  onBulkApprove,
  loading = false,
}) => {
  const [feedback, setFeedback] = useState("");
  const [points, setPoints] = useState("");
  const [includeFeedback, setIncludeFeedback] = useState(false);
  const [customPoints, setCustomPoints] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const approvalData = {
      submissionIds: selectedSubmissions.map((sub) => sub._id),
    };

    if (includeFeedback && feedback.trim()) {
      approvalData.feedback = feedback.trim();
    }

    if (customPoints && points) {
      approvalData.points = parseInt(points);
    }

    onBulkApprove(approvalData);
  };

  const handleClose = () => {
    setFeedback("");
    setPoints("");
    setIncludeFeedback(false);
    setCustomPoints(false);
    onClose();
  };

  const totalPoints = selectedSubmissions.reduce((sum, sub) => {
    return sum + (sub.ctf?.points || 0);
  }, 0);

  const averagePoints =
    selectedSubmissions.length > 0
      ? Math.round(totalPoints / selectedSubmissions.length)
      : 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="max-w-2xl">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Bulk Approval
            </h2>
            <p className="text-gray-600">
              Approve {selectedSubmissions.length} selected submissions
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="text-2xl font-bold text-blue-700 text-center">
              {selectedSubmissions.length}
            </div>
            <div className="text-sm text-blue-600 text-center font-medium">
              Submissions
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="text-2xl font-bold text-green-700 text-center">
              {totalPoints}
            </div>
            <div className="text-sm text-green-600 text-center font-medium">
              Total Points
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="text-2xl font-bold text-purple-700 text-center">
              {averagePoints}
            </div>
            <div className="text-sm text-purple-600 text-center font-medium">
              Avg Points
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Custom Points Option */}
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={customPoints}
                onChange={(e) => setCustomPoints(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Set custom points for all submissions
              </span>
            </label>

            {customPoints && (
              <div className="ml-7">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points for all submissions
                </label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  min="0"
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Leave empty to use CTF default points"
                />
              </div>
            )}
          </div>

          {/* Feedback Option */}
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeFeedback}
                onChange={(e) => setIncludeFeedback(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Include feedback for all submissions
              </span>
            </label>

            {includeFeedback && (
              <div className="ml-7">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Message
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="3"
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Optional feedback message for all approved submissions..."
                />
              </div>
            )}
          </div>

          {/* Selected Submissions Preview */}
          <div className="border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">
                Selected Submissions ({selectedSubmissions.length})
              </h3>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {selectedSubmissions.slice(0, 10).map((submission, index) => (
                <div
                  key={submission._id}
                  className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {submission.user?.fullName || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {submission.ctf?.title || "Unknown CTF"}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {customPoints
                        ? points || "Custom"
                        : submission.ctf?.points || 0}{" "}
                      pts
                    </div>
                  </div>
                </div>
              ))}
              {selectedSubmissions.length > 10 && (
                <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200">
                  <p className="text-sm text-yellow-700 text-center">
                    +{selectedSubmissions.length - 10} more submissions
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Important Notice
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This action will approve all {selectedSubmissions.length}{" "}
                  selected submissions. Each user will receive an email
                  notification. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 hover:shadow-lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve {selectedSubmissions.length} Submissions
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BulkApprovalModal;