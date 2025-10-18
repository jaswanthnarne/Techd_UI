// import React, { useState, useEffect } from 'react';
// import Layout from '../../components/layout/Layout';
// import Card from '../../components/ui/Card';
// import Button from '../../components/ui/Button';
// import Modal from '../../components/ui/Modal';
// import { submissionAdminAPI } from '../../services/admin';
// import {
//   Eye,
//   CheckCircle,
//   XCircle,
//   Clock,
//   User,
//   FileText,
//   Calendar,
//   Download,
//   AlertTriangle
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// const PendingSubmissions = () => {
//   const [submissions, setSubmissions] = useState([]);
//   const [selectedSubmission, setSelectedSubmission] = useState(null);
//   const [showReviewModal, setShowReviewModal] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [pagination, setPagination] = useState({});

//   useEffect(() => {
//     fetchPendingSubmissions();
//   }, []);

//   const fetchPendingSubmissions = async (page = 1) => {
//     try {
//       setLoading(true);
//       const response = await submissionAdminAPI.getPendingSubmissions({
//         page,
//         limit: 20
//       });
//       setSubmissions(response.data.submissions);
//       setPagination(response.data.pagination);
//     } catch (error) {
//       toast.error('Failed to fetch pending submissions');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewSubmission = async (submissionId) => {
//     try {
//       const response = await submissionAdminAPI.getSubmission(submissionId);
//       setSelectedSubmission(response.data.submission);
//       setShowReviewModal(true);
//     } catch (error) {
//       toast.error('Failed to fetch submission details');
//     }
//   };

//   const handleApprove = async (feedback = '', points = null) => {
//     if (!selectedSubmission) return;

//     try {
//       setActionLoading(true);
//       const data = {};
//       if (feedback) data.feedback = feedback;
//       if (points !== null) data.points = points;

//       await submissionAdminAPI.approveSubmission(selectedSubmission._id, data);
//       toast.success('Submission approved successfully');
//       setShowReviewModal(false);
//       setSelectedSubmission(null);
//       fetchPendingSubmissions();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to approve submission');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleReject = async (feedback) => {
//     if (!selectedSubmission || !feedback.trim()) {
//       toast.error('Feedback is required for rejection');
//       return;
//     }

//     try {
//       setActionLoading(true);
//       await submissionAdminAPI.rejectSubmission(selectedSubmission._id, { feedback });
//       toast.success('Submission rejected successfully');
//       setShowReviewModal(false);
//       setSelectedSubmission(null);
//       fetchPendingSubmissions();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to reject submission');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handlePageChange = (newPage) => {
//     fetchPendingSubmissions(newPage);
//   };

//   return (
//     <Layout title="Pending Submissions" subtitle="Review and process pending CTF submissions">
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Pending Submissions</h1>
//             <p className="text-gray-600 mt-1">
//               Review and approve/reject submissions awaiting review
//             </p>
//           </div>
//           <Button onClick={() => fetchPendingSubmissions()} variant="outline">
//             Refresh
//           </Button>
//         </div>

//         {/* Alert Banner */}
//         {submissions.length > 0 && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//             <div className="flex items-center">
//               <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
//               <div>
//                 <h3 className="text-sm font-medium text-yellow-800">
//                   {submissions.length} submission(s) pending review
//                 </h3>
//                 <p className="text-sm text-yellow-700 mt-1">
//                   These submissions are waiting for your review and action.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Submissions List */}
//         <Card>
//           <Card.Header>
//             <h3 className="text-lg font-semibold text-gray-900">
//               Pending Review ({pagination.total || 0})
//             </h3>
//           </Card.Header>
//           <Card.Content>
//             {loading ? (
//               <div className="flex justify-center items-center py-12">
//                 <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8"></div>
//                 <span className="ml-3 text-gray-600">Loading pending submissions...</span>
//               </div>
//             ) : submissions.length > 0 ? (
//               <div className="space-y-4">
//                 {submissions.map((submission) => (
//                   <div
//                     key={submission._id}
//                     className="border border-yellow-200 rounded-lg p-4 hover:bg-yellow-50 transition-colors duration-150"
//                   >
//                     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-3 mb-3">
//                           <div className="flex items-center space-x-2">
//                             <User className="h-4 w-4 text-gray-400" />
//                             <span className="font-medium text-gray-900">
//                               {submission.user?.fullName}
//                             </span>
//                             <span className="text-sm text-gray-500 hidden sm:inline">
//                               ({submission.user?.email})
//                             </span>
//                           </div>
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
//                             <Clock className="h-3 w-3 mr-1" />
//                             Pending
//                           </span>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//                           <div className="flex items-center space-x-2">
//                             <FileText className="h-4 w-4 text-gray-400" />
//                             <span className="font-medium">{submission.ctf?.title}</span>
//                             {submission.ctf?.category && (
//                               <span className="text-gray-500">({submission.ctf.category})</span>
//                             )}
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <Calendar className="h-4 w-4 text-gray-400" />
//                             <span>
//                               {new Date(submission.submittedAt).toLocaleString()}
//                             </span>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border">
//                               {submission.flag}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex items-center space-x-2">
//                         <Button
//                           onClick={() => handleViewSubmission(submission._id)}
//                           className="flex items-center space-x-2"
//                         >
//                           <Eye className="h-4 w-4" />
//                           <span>Review</span>
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
//                 <p className="text-gray-500">No pending submissions to review.</p>
//               </div>
//             )}

//             {/* Pagination */}
//             {pagination.pages > 1 && (
//               <div className="flex justify-center items-center space-x-2 mt-6 pt-6 border-t border-gray-200">
//                 <Button
//                   onClick={() => handlePageChange(pagination.page - 1)}
//                   disabled={pagination.page === 1}
//                   variant="outline"
//                   size="sm"
//                 >
//                   Previous
//                 </Button>

//                 <span className="text-sm text-gray-600">
//                   Page {pagination.page} of {pagination.pages}
//                 </span>

//                 <Button
//                   onClick={() => handlePageChange(pagination.page + 1)}
//                   disabled={pagination.page === pagination.pages}
//                   variant="outline"
//                   size="sm"
//                 >
//                   Next
//                 </Button>
//               </div>
//             )}
//           </Card.Content>
//         </Card>
//       </div>

//       {/* Review Modal */}
//       <ReviewModal
//         isOpen={showReviewModal}
//         onClose={() => {
//           setShowReviewModal(false);
//           setSelectedSubmission(null);
//         }}
//         submission={selectedSubmission}
//         onApprove={handleApprove}
//         onReject={handleReject}
//         loading={actionLoading}
//       />
//     </Layout>
//   );
// };

// // Reuse the same ReviewModal component from AdminSubmissions
// const ReviewModal = ({ isOpen, onClose, submission, onApprove, onReject, loading }) => {
//   const [feedback, setFeedback] = useState('');
//   const [customPoints, setCustomPoints] = useState('');
//   const [showCustomPoints, setShowCustomPoints] = useState(false);

//   useEffect(() => {
//     if (submission) {
//       setFeedback('');
//       setCustomPoints('');
//       setShowCustomPoints(false);
//     }
//   }, [submission]);

//   const handleApprove = () => {
//     const points = showCustomPoints && customPoints ? parseInt(customPoints) : null;
//     onApprove(feedback, points);
//   };

//   const handleReject = () => {
//     onReject(feedback);
//   };

//   if (!submission) return null;

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Review Pending Submission"
//       size="3xl"
//     >
//       <div className="space-y-6">
//         {/* Submission Details */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div className="space-y-4">
//             <h4 className="font-semibold text-gray-900 border-b pb-2">Student Information</h4>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-sm font-medium text-gray-500">Name:</span>
//                 <span className="text-sm text-gray-900">{submission.user?.fullName}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-sm font-medium text-gray-500">Email:</span>
//                 <span className="text-sm text-gray-900">{submission.user?.email}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-sm font-medium text-gray-500">Submitted:</span>
//                 <span className="text-sm text-gray-900">
//                   {new Date(submission.submittedAt).toLocaleString()}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <h4 className="font-semibold text-gray-900 border-b pb-2">CTF Information</h4>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-sm font-medium text-gray-500">Challenge:</span>
//                 <span className="text-sm text-gray-900">{submission.ctf?.title}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-sm font-medium text-gray-500">Category:</span>
//                 <span className="text-sm text-gray-900">{submission.ctf?.category}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-sm font-medium text-gray-500">Points:</span>
//                 <span className="text-sm text-gray-900">{submission.ctf?.points}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-sm font-medium text-gray-500">Flag:</span>
//                 <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
//                   {submission.flag}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Screenshot */}
//         <div className="space-y-3">
//           <h4 className="font-semibold text-gray-900 border-b pb-2">Screenshot Evidence</h4>
//           {submission.screenshot?.url ? (
//             <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
//               <img
//                 src={submission.screenshot.url}
//                 alt="Submission screenshot"
//                 className="w-full max-h-96 object-contain rounded-lg mx-auto"
//               />
//               <div className="flex justify-between items-center mt-3">
//                 <span className="text-sm text-gray-500">
//                   {submission.screenshot.filename}
//                 </span>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => window.open(submission.screenshot.url, '_blank')}
//                   className="flex items-center space-x-2"
//                 >
//                   <Download className="h-4 w-4" />
//                   <span>Download</span>
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
//               <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-500 font-medium">No screenshot available</p>
//             </div>
//           )}
//         </div>

//         {/* Custom Points */}
//         <div className="space-y-3">
//           <div className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               id="customPoints"
//               checked={showCustomPoints}
//               onChange={(e) => setShowCustomPoints(e.target.checked)}
//               className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//             />
//             <label htmlFor="customPoints" className="text-sm font-medium text-gray-700">
//               Award custom points (default: {submission.ctf?.points} points)
//             </label>
//           </div>
//           {showCustomPoints && (
//             <div className="ml-6">
//               <input
//                 type="number"
//                 value={customPoints}
//                 onChange={(e) => setCustomPoints(e.target.value)}
//                 placeholder="Enter custom points"
//                 min="0"
//                 className="block w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>
//           )}
//         </div>

//         {/* Feedback */}
//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">
//             Admin Feedback
//             <span className="text-red-500 ml-1">*</span>
//             <span className="text-gray-500 font-normal ml-2">
//               (Required for rejection, optional for approval)
//             </span>
//           </label>
//           <textarea
//             value={feedback}
//             onChange={(e) => setFeedback(e.target.value)}
//             placeholder="Provide constructive feedback for the student..."
//             rows={4}
//             className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
//           />
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
//           <Button
//             onClick={onClose}
//             variant="outline"
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleReject}
//             loading={loading}
//             disabled={!feedback.trim()}
//             variant="outline"
//             className="border-red-300 text-red-700 hover:bg-red-50"
//           >
//             <XCircle className="h-4 w-4 mr-2" />
//             Reject
//           </Button>
//           <Button
//             onClick={handleApprove}
//             loading={loading}
//             className="bg-green-600 hover:bg-green-700"
//           >
//             <CheckCircle className="h-4 w-4 mr-2" />
//             Approve
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default PendingSubmissions;

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
  AlertTriangle,
  Shield,
  Zap,
  Target,
  Trophy,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const PendingSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await submissionAdminAPI.getPendingSubmissions({
        page,
        limit: 20,
      });
      setSubmissions(response.data.submissions);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch pending submissions");
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
      fetchPendingSubmissions();
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
      toast.success("Submission rejected successfully");
      setShowReviewModal(false);
      setSelectedSubmission(null);
      fetchPendingSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reject submission");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchPendingSubmissions(newPage);
  };

  // Filter submissions based on search and filters
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.user?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.user?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.ctf?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.flag?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || submission.ctf?.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [
    "all",
    ...new Set(submissions.map((sub) => sub.ctf?.category).filter(Boolean)),
  ];

  return (
    <Layout
      title="Pending Submissions"
      subtitle="Review and process pending CTF submissions"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-12">
        {/* Hero Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              BATTLEFIELD REVIEW
            </h1>
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Review and approve/reject submissions awaiting judgment
          </p>
        </div>

        {/* Control Panel */}
        <Card className="border-0 shadow-xl mb-8 bg-white/80 backdrop-blur-sm">
          <Card.Content className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Review Command Center
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Manage pending mission submissions
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  variant="outline"
                  onClick={() => fetchPendingSubmissions()}
                  className="flex items-center space-x-2 border-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Intel</span>
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Filters and Search */}
        <Card className="border-0 shadow-xl mb-6 bg-white/80 backdrop-blur-sm">
          <Card.Content className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search submissions by user, CTF, or flag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/50"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white/50"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Alert Banner */}
        {submissions.length > 0 && (
          <Card className="border-0 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 mb-6">
            <Card.Content className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-yellow-800">
                    {submissions.length} Mission Report(s) Awaiting Review
                  </h3>
                  <p className="text-yellow-700 mt-1">
                    These battlefield submissions require your immediate
                    attention and judgment.
                  </p>
                </div>
                <div className="text-2xl font-black text-yellow-600">
                  {submissions.length}
                </div>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Submissions List */}
        <Card className="border-0 shadow-xl">
          <Card.Header className="bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Pending Mission Reports
                  </h3>
                  <p className="text-purple-200 text-sm">
                    {pagination.total || 0} total submissions awaiting review
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-white font-semibold bg-white/20 px-3 py-1 rounded-full text-sm">
                  {filteredSubmissions.length} Filtered
                </span>
              </div>
            </div>
          </Card.Header>
          <Card.Content className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full border-4 border-gray-300 border-t-purple-600 h-12 w-12 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">
                    Scanning battlefield reports...
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Loading pending submissions
                  </p>
                </div>
              </div>
            ) : filteredSubmissions.length > 0 ? (
              <div className="space-y-4 p-6">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg">
                            <Clock className="h-4 w-4 mr-2" />
                            Awaiting Judgment
                          </span>
                        </div>

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
                                {new Date(
                                  submission.submittedAt
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  submission.submittedAt
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <Trophy className="h-5 w-5 text-yellow-500" />
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
                          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg min-w-[120px] justify-center"
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
              <div className="text-center py-16">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl inline-block mb-6">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                  Mission Accomplished!
                </h3>
                <p className="text-gray-600 text-lg mb-2">
                  All battlefield reports have been reviewed
                </p>
                <p className="text-gray-500">
                  No pending submissions awaiting judgment
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                  Showing page {pagination.page} of {pagination.pages} •{" "}
                  {pagination.total} total submissions
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    variant="outline"
                    className="flex items-center space-x-2 border-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from(
                      { length: Math.min(5, pagination.pages) },
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              pagination.page === pageNum
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    variant="outline"
                    className="flex items-center space-x-2 border-2"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
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

// Enhanced ReviewModal Component
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
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <div className="p-6">
        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Mission Report Review
          </h2>
        </div>

        <div className="space-y-6">
          {/* Submission Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
              <Card.Content className="p-6">
                <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4 text-lg">
                  Warrior Information
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {submission.user?.fullName?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {submission.user?.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {submission.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-500">
                        Submitted:
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <Card.Content className="p-6">
                <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4 text-lg">
                  Mission Briefing
                </h4>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="font-bold text-gray-900 text-lg">
                      {submission.ctf?.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {submission.ctf?.category}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                      <p className="text-sm font-medium text-gray-500">
                        Base Reward
                      </p>
                      <p className="text-lg font-black text-yellow-600">
                        {submission.ctf?.points} pts
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                      <p className="text-sm font-medium text-gray-500">
                        Flag Captured
                      </p>
                      <p className="text-sm font-bold text-gray-900 font-mono">
                        {submission.flag}
                      </p>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Screenshot Evidence */}
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50">
            <Card.Content className="p-6">
              <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4 text-lg">
                Battlefield Evidence
              </h4>
              {submission.screenshot?.url ? (
                <div className="space-y-4">
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
                    <img
                      src={submission.screenshot.url}
                      alt="Submission screenshot"
                      className="w-full max-h-96 object-contain rounded-lg mx-auto"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {submission.screenshot.filename}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(submission.screenshot.url, "_blank")
                      }
                      className="flex items-center space-x-2 border-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Evidence</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold text-lg">
                    No Battlefield Evidence
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    No screenshot provided for this mission
                  </p>
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Custom Points */}
          <Card className="border-0 bg-gradient-to-br from-yellow-50 to-amber-50">
            <Card.Content className="p-6">
              <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4 text-lg">
                Reward Adjustment
              </h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="customPoints"
                    checked={showCustomPoints}
                    onChange={(e) => setShowCustomPoints(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-5 w-5"
                  />
                  <label
                    htmlFor="customPoints"
                    className="text-sm font-bold text-gray-700"
                  >
                    Award custom mission points (Default:{" "}
                    {submission.ctf?.points} points)
                  </label>
                </div>
                {showCustomPoints && (
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={customPoints}
                      onChange={(e) => setCustomPoints(e.target.value)}
                      placeholder="Enter custom points"
                      min="0"
                      className="block w-32 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                    />
                    <span className="text-sm text-gray-500">
                      mission points
                    </span>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Feedback */}
          <Card className="border-0 bg-gradient-to-br from-gray-50 to-slate-50">
            <Card.Content className="p-6">
              <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4 text-lg">
                Commander's Feedback
                <span className="text-red-500 ml-1">*</span>
              </h4>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Provide constructive feedback for the warrior. Required for
                  mission rejection, optional for approval.
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter your feedback for the warrior's mission performance..."
                  rows={4}
                  className="block w-full border-2 border-gray-200 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical bg-white"
                />
              </div>
            </Card.Content>
          </Card>

          {/* Actions */}
          <Card className="border-0 bg-white">
            <Card.Content className="p-6">
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={loading}
                  className="flex items-center space-x-2 border-2 min-w-[120px] justify-center"
                >
                  <span>Cancel Review</span>
                </Button>
                <Button
                  onClick={handleReject}
                  loading={loading}
                  disabled={!feedback.trim()}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 border-0 hover:shadow-lg min-w-[120px] justify-center"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject Mission</span>
                </Button>
                <Button
                  onClick={handleApprove}
                  loading={loading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 border-0 hover:shadow-lg min-w-[120px] justify-center"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve Mission</span>
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </Modal>
  );
};

export default PendingSubmissions;
