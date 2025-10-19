// import React, { useState, useEffect } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import StudentLayout from "../../components/layout/StudentLayout";
// import Card from "../../components/ui/Card";
// import Button from "../../components/ui/Button";
// import Modal from "../../components/ui/Modal";
// import { userCTFAPI } from "../../services/user";
// import { submissionAPI } from "../../services/submission";
// import {
//   Upload,
//   Eye,
//   Edit3,
//   Clock,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   FileText,
//   ExternalLink,
//   BarChart3,
//   RefreshCw,
//   Calendar,
//   Shield,
//   Target,
//   Zap,
//   Crown,
//   Sparkles,
//   Sword,
// } from "lucide-react";
// import toast from "react-hot-toast";

// const CTFSubmission = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [ctf, setCtf] = useState(null);
//   const [submission, setSubmission] = useState(null);
//   const [showSubmitModal, setShowSubmitModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [flag, setFlag] = useState("");
//   const [currentTime, setCurrentTime] = useState(new Date());

//   // Update current time every minute for real-time status
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 60000);

//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     fetchCTFData();
//   }, [id]);

//   const fetchCTFData = async () => {
//     try {
//       setLoading(true);
//       const ctfResponse = await userCTFAPI.getCTF(id);
//       const ctfData = ctfResponse.data.ctf;
//       setCtf(ctfData);

//       try {
//         const submissionResponse = await userCTFAPI.getMySubmission(id);
//         if (submissionResponse.data.submission) {
//           setSubmission(submissionResponse.data.submission);
//         } else {
//           setSubmission(null);
//         }
//       } catch (error) {
//         if (error.response?.status === 404) {
//           setSubmission(null);
//         } else {
//           throw error;
//         }
//       }
//     } catch (error) {
//       console.error("Failed to fetch CTF data:", error);
//       toast.error("Failed to load mission data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isWithinActiveHours = () => {
//     if (!ctf?.activeHours) return false;

//     const now = currentTime;
//     const startTime = ctf.activeHours.startTime;
//     const endTime = ctf.activeHours.endTime;

//     const [startHours, startMinutes] = startTime.split(":").map(Number);
//     const [endHours, endMinutes] = endTime.split(":").map(Number);

//     const currentMinutes = now.getHours() * 60 + now.getMinutes();
//     const startMinutesTotal = startHours * 60 + startMinutes;
//     const endMinutesTotal = endHours * 60 + endMinutes;

//     let isActive;
//     if (endMinutesTotal < startMinutesTotal) {
//       isActive =
//         currentMinutes >= startMinutesTotal ||
//         currentMinutes <= endMinutesTotal;
//     } else {
//       isActive =
//         currentMinutes >= startMinutesTotal &&
//         currentMinutes <= endMinutesTotal;
//     }

//     return isActive;
//   };

//   const calculateCTFStatus = () => {
//     if (!ctf) return { status: "inactive", canSubmit: false };

//     const backendStatus = ctf.status?.toLowerCase();

//     if (!ctf.isVisible || !ctf.isPublished) {
//       return {
//         status: "inactive",
//         canSubmit: false,
//         reason: "CTF is not published or visible",
//       };
//     }

//     if (backendStatus !== "active") {
//       return {
//         status: backendStatus || "inactive",
//         canSubmit: false,
//         reason: `Backend status is ${backendStatus}`,
//       };
//     }

//     const withinActiveHours = isWithinActiveHours();

//     if (withinActiveHours) {
//       return {
//         status: "active",
//         canSubmit: true,
//         reason: "CTF is active and within active hours",
//       };
//     } else {
//       return {
//         status: "inactive_hours",
//         canSubmit: false,
//         reason: "Outside active hours",
//       };
//     }
//   };

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       toast.error("Please select an image file (JPEG, PNG, GIF, etc.)");
//       return;
//     }

//     if (file.size > 4 * 1024 * 1024) {
//       toast.error("File size must be less than 4MB");
//       return;
//     }

//     setSelectedFile(file);

//     const reader = new FileReader();
//     reader.onload = (e) => setPreviewUrl(e.target.result);
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const { canSubmit, reason } = calculateCTFStatus();

//     if (!canSubmit) {
//       toast.error(
//         `Submission is only allowed when CTF is active and during active hours (${ctf.activeHours.startTime} - ${ctf.activeHours.endTime}). Reason: ${reason}`
//       );
//       return;
//     }

//     if (!selectedFile || !flag.trim()) {
//       toast.error("Please provide both flag and screenshot");
//       return;
//     }

//     try {
//       setUploading(true);

//       const formData = new FormData();
//       formData.append("screenshot", selectedFile);
//       formData.append("flag", flag.trim());

//       const response = await submissionAPI.submitWithScreenshot(id, formData);

//       toast.success("Evidence submitted! Awaiting command review.");
//       setShowSubmitModal(false);
//       setSelectedFile(null);
//       setPreviewUrl(null);
//       setFlag("");
//       fetchCTFData();
//     } catch (error) {
//       console.error("Submission error:", error);

//       if (error.response) {
//         const errorMessage =
//           error.response.data?.error ||
//           error.response.data?.details?.[0]?.msg ||
//           "Transmission failed";

//         if (
//           errorMessage.includes("not active") ||
//           errorMessage.includes("active hours")
//         ) {
//           await fetchCTFData();
//           toast.error(
//             `Mission status updated: ${errorMessage}. Check current status.`
//           );
//         } else {
//           toast.error(errorMessage);
//         }
//       } else if (error.request) {
//         toast.error("Network error - check your connection");
//       } else {
//         toast.error("Submission failed: " + error.message);
//       }
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleEdit = async (e) => {
//     e.preventDefault();

//     const { canSubmit } = calculateCTFStatus();
//     if (!canSubmit) {
//       toast.error(
//         `Editing is only allowed when CTF is active and during active hours (${ctf.activeHours.startTime} - ${ctf.activeHours.endTime})`
//       );
//       return;
//     }

//     if (!selectedFile) {
//       toast.error("Please select a new screenshot");
//       return;
//     }
//     if (submission?.submissionStatus !== "pending") {
//       toast.error("Cannot edit submission that has already been reviewed");
//       return;
//     }

//     try {
//       setUploading(true);

//       const formData = new FormData();
//       formData.append("screenshot", selectedFile);

//       const response = await submissionAPI.editSubmissionScreenshot(
//         submission._id,
//         formData
//       );

//       toast.success("Evidence updated successfully!");
//       setShowEditModal(false);
//       setSelectedFile(null);
//       setPreviewUrl(null);
//       fetchCTFData();
//     } catch (error) {
//       toast.error(error.response?.data?.error || "Update failed");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Status calculation
//   const { status: ctfStatus, canSubmit } = calculateCTFStatus();
//   const hasSubmission = !!submission;
//   const canResubmit = canSubmit && submission?.submissionStatus === "rejected";
//   const canEdit = submission?.submissionStatus === "pending";

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       pending: {
//         color:
//           "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200",
//         icon: Clock,
//         label: "Under Review",
//         description: "Awaiting command approval",
//       },
//       approved: {
//         color:
//           "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200",
//         icon: CheckCircle,
//         label: "Mission Success",
//         description: "Objective completed! Points awarded",
//       },
//       rejected: {
//         color:
//           "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200",
//         icon: XCircle,
//         label: "Mission Failed",
//         description: "Evidence requires correction",
//       },
//     };

//     const config = statusConfig[status] || statusConfig.pending;
//     const Icon = config.icon;

//     return (
//       <div
//         className={`px-6 py-4 rounded-xl flex items-center space-x-4 ${config.color} backdrop-blur-sm`}
//       >
//         <Icon className="h-6 w-6" />
//         <div>
//           <div className="font-semibold text-lg">{config.label}</div>
//           <div className="text-sm opacity-90">{config.description}</div>
//         </div>
//       </div>
//     );
//   };

//   const getCTFStatusBadge = () => {
//     if (!ctf) return null;

//     const statusConfig = {
//       active: {
//         color:
//           "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200",
//         icon: Zap,
//         label: "Mission Live",
//         description: "Ready for engagement",
//       },
//       inactive_hours: {
//         color:
//           "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200",
//         icon: Clock,
//         label: "Standing By",
//         description: `Active ${ctf.activeHours.startTime} - ${ctf.activeHours.endTime}`,
//       },
//       upcoming: {
//         color:
//           "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200",
//         icon: Calendar,
//         label: "Mission Incoming",
//         description: `Deploys ${new Date(
//           ctf.schedule.startDate
//         ).toLocaleDateString()}`,
//       },
//       ended: {
//         color:
//           "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200",
//         icon: XCircle,
//         label: "Mission Complete",
//         description: "Objective timeline ended",
//       },
//       inactive: {
//         color:
//           "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200",
//         icon: AlertCircle,
//         label: "Mission Offline",
//         description: "System maintenance",
//       },
//       draft: {
//         color:
//           "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200",
//         icon: AlertCircle,
//         label: "Classified",
//         description: "Mission not published",
//       },
//     };

//     const config = statusConfig[ctfStatus] || statusConfig.inactive;
//     const Icon = config.icon;

//     return (
//       <div
//         className={`px-6 py-4 rounded-xl flex items-center space-x-4 ${config.color} backdrop-blur-sm`}
//       >
//         <Icon className="h-6 w-6" />
//         <div>
//           <div className="font-semibold text-lg">{config.label}</div>
//           <div className="text-sm opacity-90">{config.description}</div>
//         </div>
//       </div>
//     );
//   };

//   const formatTimeForDisplay = (time24) => {
//     if (!time24) return "";

//     const [hours, minutes] = time24.split(":").map(Number);
//     const period = hours >= 12 ? "PM" : "AM";
//     const displayHours = hours % 12 || 12;

//     return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
//   };

//   if (loading) {
//     return (
//       <StudentLayout title="Mission Evidence" subtitle="Loading...">
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
//           <div className="text-center space-y-4">
//             <div className="relative">
//               <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
//               <Target className="h-8 w-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
//             </div>
//             <p className="text-gray-600">Decrypting mission parameters...</p>
//           </div>
//         </div>
//       </StudentLayout>
//     );
//   }

//   if (!ctf) {
//     return (
//       <StudentLayout
//         title="Mission Not Found"
//         subtitle="Target acquisition failed"
//       >
//         <Card className="border-0 shadow-xl">
//           <Card.Content className="text-center py-16">
//             <div className="flex justify-center mb-4">
//               <div className="p-4 bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl">
//                 <AlertCircle className="h-16 w-16 text-red-400" />
//               </div>
//             </div>
//             <h3 className="text-2xl font-bold text-gray-900 mb-3">
//               Mission Coordinates Lost
//             </h3>
//             <p className="text-gray-600 text-lg mb-6">
//               The requested combat zone could not be located.
//             </p>
//             <Link to="/student/ctfs">
//               <Button className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg">
//                 Return to War Room
//               </Button>
//             </Link>
//           </Card.Content>
//         </Card>
//       </StudentLayout>
//     );
//   }

//   return (
//     <StudentLayout title={ctf.title} subtitle="Submit mission evidence">
//       <div className="max-w-6xl mx-auto space-y-8">
//         {/* Submission Guidelines - Moved to Top */}
//         <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50">
//           <Card.Header className="pb-4">
//             <div className="flex items-center space-x-3">
//               <Shield className="h-6 w-6 text-blue-600" />
//               <h3 className="text-xl font-bold text-gray-900">
//                 Mission Protocol
//               </h3>
//             </div>
//           </Card.Header>
//           <Card.Content>
//             <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
//               <li className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
//                 <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
//                 <span>Evidence must clearly show the flag or solution</span>
//               </li>
//               <li className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
//                 <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
//                 <span>File must be image (JPEG, PNG, GIF) under 4MB</span>
//               </li>
//               <li className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
//                 <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
//                 <span>Include complete flag in submission form</span>
//               </li>
//               <li className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
//                 <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
//                 <span>Command review: 1-2 hours during active periods</span>
//               </li>
//               <li className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
//                 <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
//                 <span>Edit evidence while pending review</span>
//               </li>
//               <li className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
//                 <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
//                 <span>
//                   Submissions only when status is <strong>active</strong>{" "}
//                   between{" "}
//                   <strong>
//                     {formatTimeForDisplay(ctf.activeHours.startTime)}
//                   </strong>{" "}
//                   -{" "}
//                   <strong>
//                     {formatTimeForDisplay(ctf.activeHours.endTime)}
//                   </strong>
//                 </span>
//               </li>
//             </ul>
//           </Card.Content>
//         </Card>

//         {/* Mission Header */}
//         <Card className="border-0 shadow-xl">
//           <Card.Content className="p-8">
//             <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-6 lg:space-y-0">
//               <div className="flex-1">
//                 <div className="flex items-center space-x-4 mb-6">
//                   <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl">
//                     <Target className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <h1 className="text-3xl font-bold text-gray-900">
//                     {ctf.title}
//                   </h1>
//                 </div>

//                 <p className="text-gray-600 text-lg mb-6 leading-relaxed">
//                   {ctf.description}
//                 </p>

//                 {/* CTF Status Badge */}
//                 {getCTFStatusBadge()}

//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-6">
//                   <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
//                     <FileText className="h-5 w-5 mr-3 text-blue-500" />
//                     <span className="font-semibold">{ctf.category}</span>
//                   </div>
//                   <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
//                     <BarChart3 className="h-5 w-5 mr-3 text-yellow-500" />
//                     <span>{ctf.points} mission points</span>
//                   </div>
//                   <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
//                     <Clock className="h-5 w-5 mr-3 text-green-500" />
//                     <span>
//                       {formatTimeForDisplay(ctf.activeHours.startTime)} -{" "}
//                       {formatTimeForDisplay(ctf.activeHours.endTime)}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col space-y-4 min-w-[280px]">
//                 {ctf.ctfLink && (
//                   <Button
//                     onClick={() => window.open(ctf.ctfLink, "_blank")}
//                     variant="outline"
//                     className="flex items-center space-x-2 border-2"
//                   >
//                     <ExternalLink className="h-4 w-4" />
//                     <span>Access Battlefield</span>
//                   </Button>
//                 )}

//                 {/* Submit Button - Only show when CTF backend status is active AND within active hours */}
//                 {canSubmit && !hasSubmission && (
//                   <Button
//                     onClick={() => setShowSubmitModal(true)}
//                     className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 border-0 hover:shadow-lg"
//                   >
//                     <Upload className="h-4 w-4" />
//                     <span>Submit Evidence</span>
//                   </Button>
//                 )}
//                 {canResubmit && (
//                   <Button
//                     onClick={() => setShowSubmitModal(true)}
//                     className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 border-0 hover:shadow-lg"
//                   >
//                     <RefreshCw className="h-4 w-4" />
//                     <span>Resubmit Evidence</span>
//                   </Button>
//                 )}

//                 <Link to={`/student/ctf/${id}`}>
//                   <Button variant="outline" className="w-full border-2">
//                     Back to Mission Briefing
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </Card.Content>
//         </Card>

//         {/* Current Submission Status */}
//         {hasSubmission ? (
//           <Card className="border-0 shadow-xl">
//             <Card.Header className="pb-4">
//               <div className="flex items-center space-x-3">
//                 <Sword className="h-6 w-6 text-blue-600" />
//                 <h3 className="text-xl font-bold text-gray-900">
//                   Your Mission Log
//                 </h3>
//               </div>
//             </Card.Header>
//             <Card.Content className="space-y-6">
//               {/* Status */}
//               {getStatusBadge(submission.submissionStatus)}

//               {/* Submission Details */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div>
//                   <h4 className="font-semibold text-gray-900 mb-4 text-lg">
//                     Mission Details
//                   </h4>
//                   <div className="space-y-4 text-sm">
//                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
//                       <span className="text-gray-600">Engagement Time:</span>
//                       <span className="text-gray-900 font-medium">
//                         {new Date(submission.submittedAt).toLocaleString()}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
//                       <span className="text-gray-600">Attempt Number:</span>
//                       <span className="text-gray-900 font-medium">
//                         #{submission.attemptNumber}
//                       </span>
//                     </div>
//                     {submission.reviewedAt && (
//                       <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
//                         <span className="text-gray-600">Command Review:</span>
//                         <span className="text-gray-900 font-medium">
//                           {new Date(submission.reviewedAt).toLocaleString()}
//                         </span>
//                       </div>
//                     )}
//                     {submission.points > 0 && (
//                       <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-200">
//                         <span className="text-gray-600">Points Awarded:</span>
//                         <span className="text-green-600 font-bold text-lg">
//                           +{submission.points}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Screenshot Preview */}
//                 <div>
//                   <h4 className="font-semibold text-gray-900 mb-4 text-lg">
//                     Mission Evidence
//                   </h4>
//                   <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
//                     {submission.screenshot?.url ? (
//                       <div className="space-y-4">
//                         <img
//                           src={submission.screenshot.url}
//                           alt="Mission evidence"
//                           className="w-full h-48 object-contain rounded-lg shadow-sm"
//                         />
//                         <div className="text-sm text-gray-500 text-center bg-white py-2 rounded-lg">
//                           {submission.screenshot.filename}
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="text-center text-gray-500 py-8">
//                         <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
//                         <p>No evidence available</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Admin Feedback */}
//               {submission.adminFeedback && (
//                 <div
//                   className={`p-6 rounded-xl ${
//                     submission.submissionStatus === "rejected"
//                       ? "bg-gradient-to-r from-red-50 to-pink-50 border border-red-200"
//                       : "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
//                   }`}
//                 >
//                   <h4 className="font-semibold text-gray-900 mb-3 text-lg">
//                     Command Feedback
//                   </h4>
//                   <p className="text-gray-700 leading-relaxed">
//                     {submission.adminFeedback}
//                   </p>
//                 </div>
//               )}

//               {/* Actions */}
//               <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
//                 {canEdit && (
//                   <Button
//                     onClick={() => setShowEditModal(true)}
//                     variant="outline"
//                     className="flex items-center space-x-2 border-2"
//                   >
//                     <Edit3 className="h-4 w-4" />
//                     <span>Update Evidence</span>
//                   </Button>
//                 )}

//                 {/* Resubmit button */}
//                 {canResubmit && (
//                   <Button
//                     onClick={() => setShowSubmitModal(true)}
//                     className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:shadow-lg"
//                   >
//                     <Upload className="h-4 w-4" />
//                     <span>Re-engage Mission</span>
//                   </Button>
//                 )}

//                 <Button
//                   onClick={fetchCTFData}
//                   variant="outline"
//                   className="flex items-center space-x-2 border-2"
//                 >
//                   <RefreshCw className="h-4 w-4" />
//                   <span>Refresh Status</span>
//                 </Button>
//               </div>
//             </Card.Content>
//           </Card>
//         ) : (
//           /* No Submission State */
//           <Card className="border-0 shadow-xl">
//             <Card.Content className="text-center py-16">
//               <div className="flex justify-center mb-6">
//                 <div className="p-4 bg-gradient-to-r from-gray-100 to-blue-100 rounded-2xl">
//                   <Upload className="h-16 w-16 text-gray-400" />
//                 </div>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-3">
//                 No Mission Logs
//               </h3>
//               <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
//                 {canSubmit
//                   ? "Submit your mission evidence with screenshot to earn points!"
//                   : ctfStatus === "active"
//                   ? `Engagements only accepted between ${formatTimeForDisplay(
//                       ctf.activeHours.startTime
//                     )} - ${formatTimeForDisplay(ctf.activeHours.endTime)}`
//                   : "Mission is not currently active for engagements"}
//               </p>
//               {canSubmit && (
//                 <Button
//                   onClick={() => setShowSubmitModal(true)}
//                   className="flex items-center space-x-2 mx-auto bg-gradient-to-r from-green-600 to-emerald-600 border-0 hover:shadow-lg"
//                 >
//                   <Upload className="h-4 w-4" />
//                   <span>Initiate First Engagement</span>
//                 </Button>
//               )}
//             </Card.Content>
//           </Card>
//         )}
//       </div>

//       {/* Submit Modal */}
//       <Modal
//         isOpen={showSubmitModal}
//         onClose={() => setShowSubmitModal(false)}
//         title="Submit Mission Evidence"
//         size="lg"
//       >
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* CTF Status Check */}
//           {!canSubmit && (
//             <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
//               <div className="flex items-start space-x-4">
//                 <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
//                 <div>
//                   <h3 className="text-lg font-semibold text-red-800 mb-2">
//                     Engagement Not Available
//                   </h3>
//                   <div className="text-red-700 space-y-2">
//                     <p>Mission engagements are only allowed when:</p>
//                     <ul className="list-disc list-inside space-y-1">
//                       <li>
//                         Mission status is <strong>active</strong>
//                       </li>
//                       <li>
//                         Current time is within active hours:{" "}
//                         {formatTimeForDisplay(ctf.activeHours.startTime)} -{" "}
//                         {formatTimeForDisplay(ctf.activeHours.endTime)}
//                       </li>
//                     </ul>
//                     <div className="mt-3 p-3 bg-white rounded-lg border border-red-200">
//                       <p className="text-sm">
//                         <strong>Current status:</strong> {ctf.status} |{" "}
//                         <strong>Local time:</strong>{" "}
//                         {currentTime.toLocaleTimeString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-semibold text-gray-900 mb-3">
//               Flag Authentication
//             </label>
//             <input
//               type="text"
//               value={flag}
//               onChange={(e) => setFlag(e.target.value)}
//               placeholder="CTF{...}"
//               className="block w-full border-2 border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
//               required
//               disabled={!canSubmit}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-gray-900 mb-3">
//               Mission Evidence (Screenshot) *
//             </label>

//             <div className="mb-4">
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileSelect}
//                 className="block w-full text-sm text-gray-500
//                   file:mr-4 file:py-3 file:px-6
//                   file:rounded-xl file:border-0
//                   file:text-sm file:font-semibold
//                   file:bg-gradient-to-r file:from-blue-50 file:to-blue-100 file:text-blue-700
//                   hover:file:bg-blue-200 transition-all"
//                 required
//                 disabled={!canSubmit}
//               />
//               <p className="text-xs text-gray-500 mt-2 ml-2">
//                 Supported formats: JPEG, PNG, GIF (Maximum: 4MB)
//               </p>
//             </div>

//             {/* Preview Section */}
//             {previewUrl && (
//               <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-blue-50/50">
//                 <div className="space-y-4">
//                   <img
//                     src={previewUrl}
//                     alt="Evidence preview"
//                     className="mx-auto h-48 object-contain rounded-lg shadow-sm"
//                   />
//                   <p className="text-sm text-gray-600 font-medium">
//                     {selectedFile?.name}
//                   </p>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => {
//                       setSelectedFile(null);
//                       setPreviewUrl(null);
//                     }}
//                     className="border-2"
//                   >
//                     Remove Evidence
//                   </Button>
//                 </div>
//               </div>
//             )}

//             {/* Upload Instructions when no file selected */}
//             {!previewUrl && (
//               <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50">
//                 <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
//                 <p className="text-gray-600 text-lg mb-2">
//                   No evidence selected
//                 </p>
//                 <p className="text-gray-500">
//                   Select mission evidence file above
//                 </p>
//               </div>
//             )}
//           </div>

//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
//             <div className="flex items-start space-x-4">
//               <Eye className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
//               <div>
//                 <h3 className="text-lg font-semibold text-blue-800 mb-2">
//                   Mission Protocol
//                 </h3>
//                 <div className="text-blue-700 space-y-2">
//                   <p>Your evidence will be reviewed by command center.</p>
//                   <p>
//                     You'll receive transmission once reviewed and processed.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-4 pt-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setShowSubmitModal(false)}
//               className="border-2 px-6"
//             >
//               Abort Mission
//             </Button>
//             <Button
//               type="submit"
//               loading={uploading}
//               disabled={!selectedFile || !flag.trim() || !canSubmit}
//               className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 hover:shadow-lg px-8"
//             >
//               Submit Evidence
//             </Button>
//           </div>
//         </form>
//       </Modal>

//       {/* Edit Screenshot Modal */}
//       <Modal
//         isOpen={showEditModal}
//         onClose={() => setShowEditModal(false)}
//         title="Update Mission Evidence"
//         size="lg"
//       >
//         <form onSubmit={handleEdit} className="space-y-6">
//           {/* CTF Status Check */}
//           {!canSubmit && (
//             <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
//               <div className="flex items-start space-x-4">
//                 <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
//                 <div>
//                   <h3 className="text-lg font-semibold text-red-800 mb-2">
//                     Evidence Update Not Available
//                   </h3>
//                   <div className="text-red-700">
//                     <p>Evidence updates are only allowed when:</p>
//                     <ul className="list-disc list-inside mt-1 space-y-1">
//                       <li>
//                         Mission status is <strong>active</strong>
//                       </li>
//                       <li>
//                         Current time is within active hours:{" "}
//                         {formatTimeForDisplay(ctf.activeHours.startTime)} -{" "}
//                         {formatTimeForDisplay(ctf.activeHours.endTime)}
//                       </li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-semibold text-gray-900 mb-3">
//               New Mission Evidence *
//             </label>

//             <div className="mb-4">
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileSelect}
//                 className="block w-full text-sm text-gray-500
//                   file:mr-4 file:py-3 file:px-6
//                   file:rounded-xl file:border-0
//                   file:text-sm file:font-semibold
//                   file:bg-gradient-to-r file:from-blue-50 file:to-blue-100 file:text-blue-700
//                   hover:file:bg-blue-200 transition-all"
//                 required
//                 disabled={!canSubmit}
//               />
//               <p className="text-xs text-gray-500 mt-2 ml-2">
//                 Supported formats: JPEG, PNG, GIF (Maximum: 4MB)
//               </p>
//             </div>

//             {/* Preview Section */}
//             {previewUrl && (
//               <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-blue-50/50">
//                 <div className="space-y-4">
//                   <img
//                     src={previewUrl}
//                     alt="Evidence preview"
//                     className="mx-auto h-48 object-contain rounded-lg shadow-sm"
//                   />
//                   <p className="text-sm text-gray-600 font-medium">
//                     {selectedFile?.name}
//                   </p>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => {
//                       setSelectedFile(null);
//                       setPreviewUrl(null);
//                     }}
//                     className="border-2"
//                   >
//                     Remove Evidence
//                   </Button>
//                 </div>
//               </div>
//             )}

//             {/* Upload Instructions when no file selected */}
//             {!previewUrl && (
//               <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50">
//                 <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
//                 <p className="text-gray-600 text-lg mb-2">
//                   No evidence selected
//                 </p>
//                 <p className="text-gray-500">Select new evidence file above</p>
//               </div>
//             )}
//           </div>

//           <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
//             <div className="flex items-start space-x-4">
//               <AlertCircle className="h-6 w-6 text-yellow-500 mt-0.5 flex-shrink-0" />
//               <div>
//                 <h3 className="text-lg font-semibold text-yellow-800 mb-2">
//                   Mission Note
//                 </h3>
//                 <div className="text-yellow-700">
//                   <p>
//                     Updating evidence will reset your position in the command
//                     review queue.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-4 pt-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setShowEditModal(false)}
//               className="border-2 px-6"
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               loading={uploading}
//               disabled={!selectedFile || !canSubmit}
//               className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:shadow-lg px-8"
//             >
//               Update Evidence
//             </Button>
//           </div>
//         </form>
//       </Modal>
//     </StudentLayout>
//   );
// };

// export default CTFSubmission;


import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { userCTFAPI } from "../../services/user";
import { submissionAPI } from "../../services/submission";
import {
  Upload,
  Eye,
  Edit3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  BarChart3,
  RefreshCw,
  Calendar,
  Shield,
  Target,
  Zap,
  Crown,
  Sparkles,
  Sword,
} from "lucide-react";
import toast from "react-hot-toast";

const CTFSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ctf, setCtf] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flag, setFlag] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for real-time status
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCTFData();
  }, [id]);

  const fetchCTFData = async () => {
    try {
      setLoading(true);
      const ctfResponse = await userCTFAPI.getCTF(id);
      const ctfData = ctfResponse.data.ctf;
      setCtf(ctfData);

      try {
        const submissionResponse = await userCTFAPI.getMySubmission(id);
        if (submissionResponse.data.submission) {
          setSubmission(submissionResponse.data.submission);
        } else {
          setSubmission(null);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setSubmission(null);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Failed to fetch CTF data:", error);
      toast.error("Failed to load mission data");
    } finally {
      setLoading(false);
    }
  };

  const isWithinActiveHours = () => {
    if (!ctf?.activeHours) return false;

    const now = currentTime;
    const startTime = ctf.activeHours.startTime;
    const endTime = ctf.activeHours.endTime;

    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutesTotal = startHours * 60 + startMinutes;
    const endMinutesTotal = endHours * 60 + endMinutes;

    let isActive;
    if (endMinutesTotal < startMinutesTotal) {
      isActive =
        currentMinutes >= startMinutesTotal ||
        currentMinutes <= endMinutesTotal;
    } else {
      isActive =
        currentMinutes >= startMinutesTotal &&
        currentMinutes <= endMinutesTotal;
    }

    return isActive;
  };

  const calculateCTFStatus = () => {
    if (!ctf) return { status: "inactive", canSubmit: false };

    const backendStatus = ctf.status?.toLowerCase();

    if (!ctf.isVisible || !ctf.isPublished) {
      return {
        status: "inactive",
        canSubmit: false,
        reason: "CTF is not published or visible",
      };
    }

    if (backendStatus !== "active") {
      return {
        status: backendStatus || "inactive",
        canSubmit: false,
        reason: `Backend status is ${backendStatus}`,
      };
    }

    const withinActiveHours = isWithinActiveHours();

    if (withinActiveHours) {
      return {
        status: "active",
        canSubmit: true,
        reason: "CTF is active and within active hours",
      };
    } else {
      return {
        status: "inactive_hours",
        canSubmit: false,
        reason: "Outside active hours",
      };
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, GIF, etc.)");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("File size must be less than 4MB");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { canSubmit, reason } = calculateCTFStatus();

    if (!canSubmit) {
      toast.error(
        `Submission is only allowed when CTF is active and during active hours (${ctf.activeHours.startTime} - ${ctf.activeHours.endTime}). Reason: ${reason}`
      );
      return;
    }

    if (!selectedFile || !flag.trim()) {
      toast.error("Please provide both flag and screenshot");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("screenshot", selectedFile);
      formData.append("flag", flag.trim());

      const response = await submissionAPI.submitWithScreenshot(id, formData);

      toast.success("Evidence submitted! Awaiting command review.");
      setShowSubmitModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setFlag("");
      fetchCTFData();
    } catch (error) {
      console.error("Submission error:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.error ||
          error.response.data?.details?.[0]?.msg ||
          "Transmission failed";

        if (
          errorMessage.includes("not active") ||
          errorMessage.includes("active hours")
        ) {
          await fetchCTFData();
          toast.error(
            `Mission status updated: ${errorMessage}. Check current status.`
          );
        } else {
          toast.error(errorMessage);
        }
      } else if (error.request) {
        toast.error("Network error - check your connection");
      } else {
        toast.error("Submission failed: " + error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    const { canSubmit } = calculateCTFStatus();
    if (!canSubmit) {
      toast.error(
        `Editing is only allowed when CTF is active and during active hours (${ctf.activeHours.startTime} - ${ctf.activeHours.endTime})`
      );
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a new screenshot");
      return;
    }
    if (submission?.submissionStatus !== "pending") {
      toast.error("Cannot edit submission that has already been reviewed");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("screenshot", selectedFile);

      const response = await submissionAPI.editSubmissionScreenshot(
        submission._id,
        formData
      );

      toast.success("Evidence updated successfully!");
      setShowEditModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchCTFData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Update failed");
    } finally {
      setUploading(false);
    }
  };

  // Status calculation
  const { status: ctfStatus, canSubmit } = calculateCTFStatus();
  const hasSubmission = !!submission;
  const canResubmit = canSubmit && submission?.submissionStatus === "rejected";
  const canEdit = submission?.submissionStatus === "pending";

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color:
          "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200",
        icon: Clock,
        label: "Under Review",
        description: "Awaiting command approval",
      },
      approved: {
        color:
          "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200",
        icon: CheckCircle,
        label: "Mission Success",
        description: "Objective completed! Points awarded",
      },
      rejected: {
        color:
          "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200",
        icon: XCircle,
        label: "Mission Failed",
        description: "Evidence requires correction",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div
        className={`px-6 py-4 rounded-xl flex items-center space-x-4 ${config.color} backdrop-blur-sm`}
      >
        <Icon className="h-6 w-6" />
        <div>
          <div className="font-semibold text-lg">{config.label}</div>
          <div className="text-sm opacity-90">{config.description}</div>
        </div>
      </div>
    );
  };

  const getCTFStatusBadge = () => {
    if (!ctf) return null;

    const statusConfig = {
      active: {
        color:
          "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200",
        icon: Zap,
        label: "Mission Live",
        description: "Ready for engagement",
      },
      inactive_hours: {
        color:
          "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200",
        icon: Clock,
        label: "Standing By",
        description: `Active ${ctf.activeHours.startTime} - ${ctf.activeHours.endTime}`,
      },
      upcoming: {
        color:
          "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200",
        icon: Calendar,
        label: "Mission Incoming",
        description: `Deploys ${new Date(
          ctf.schedule.startDate
        ).toLocaleDateString()}`,
      },
      ended: {
        color:
          "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200",
        icon: XCircle,
        label: "Mission Complete",
        description: "Objective timeline ended",
      },
      inactive: {
        color:
          "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200",
        icon: AlertCircle,
        label: "Mission Offline",
        description: "System maintenance",
      },
      draft: {
        color:
          "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200",
        icon: AlertCircle,
        label: "Classified",
        description: "Mission not published",
      },
    };

    const config = statusConfig[ctfStatus] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <div
        className={`px-6 py-4 rounded-xl flex items-center space-x-4 ${config.color} backdrop-blur-sm`}
      >
        <Icon className="h-6 w-6" />
        <div>
          <div className="font-semibold text-lg">{config.label}</div>
          <div className="text-sm opacity-90">{config.description}</div>
        </div>
      </div>
    );
  };

  const formatTimeForDisplay = (time24) => {
    if (!time24) return "";

    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  if (loading) {
    return (
      <StudentLayout title="Mission Evidence" subtitle="Loading...">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <Target className="h-8 w-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-600">Decrypting mission parameters...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!ctf) {
    return (
      <StudentLayout
        title="Mission Not Found"
        subtitle="Target acquisition failed"
      >
        <Card className="border-0 shadow-xl">
          <Card.Content className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl">
                <AlertCircle className="h-16 w-16 text-red-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Mission Coordinates Lost
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              The requested combat zone could not be located.
            </p>
            <Link to="/student/ctfs">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg">
                Return to War Room
              </Button>
            </Link>
          </Card.Content>
        </Card>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title={ctf.title} subtitle="Submit mission evidence">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Submission Guidelines - Moved to Top */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50">
          <Card.Header className="pb-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Mission Protocol
              </h3>
            </div>
          </Card.Header>
          <Card.Content>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <li className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Evidence must clearly show the flag or solution</span>
              </li>
              <li className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>File must be image (JPEG, PNG, GIF) under 4MB</span>
              </li>
              <li className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Include complete flag in submission form</span>
              </li>
              <li className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Command review: 1-2 hours during active periods</span>
              </li>
              <li className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Edit evidence while pending review</span>
              </li>
              <li className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>
                  Submissions only when status is <strong>active</strong>{" "}
                  between{" "}
                  <strong>
                    {formatTimeForDisplay(ctf.activeHours.startTime)}
                  </strong>{" "}
                  -{" "}
                  <strong>
                    {formatTimeForDisplay(ctf.activeHours.endTime)}
                  </strong>
                </span>
              </li>
            </ul>
          </Card.Content>
        </Card>

        {/* Mission Header */}
        <Card className="border-0 shadow-xl">
          <Card.Content className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-6 lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {ctf.title}
                  </h1>
                </div>

                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {ctf.description}
                </p>

                {/* CTF Status Badge */}
                {getCTFStatusBadge()}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-6">
                  <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    <FileText className="h-5 w-5 mr-3 text-blue-500" />
                    <span className="font-semibold">{ctf.category}</span>
                  </div>
                  <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    <BarChart3 className="h-5 w-5 mr-3 text-yellow-500" />
                    <span>{ctf.points} mission points</span>
                  </div>
                  <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    <Clock className="h-5 w-5 mr-3 text-green-500" />
                    <span>
                      {formatTimeForDisplay(ctf.activeHours.startTime)} -{" "}
                      {formatTimeForDisplay(ctf.activeHours.endTime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-4 min-w-[280px]">
                {ctf.ctfLink && (
                  <Button
                    onClick={() => window.open(ctf.ctfLink, "_blank")}
                    variant="outline"
                    className="flex items-center space-x-2 border-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Access Battlefield</span>
                  </Button>
                )}

                {/* Submit Button - Only show when CTF backend status is active AND within active hours */}
                {canSubmit && !hasSubmission && (
                  <Button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 border-0 hover:shadow-lg"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Submit Evidence</span>
                  </Button>
                )}
                {canResubmit && (
                  <Button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 border-0 hover:shadow-lg"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Resubmit Evidence</span>
                  </Button>
                )}

                <Link to={`/student/ctf/${id}`}>
                  <Button variant="outline" className="w-full border-2">
                    Back to Mission Briefing
                  </Button>
                </Link>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Current Submission Status */}
        {hasSubmission ? (
          <Card className="border-0 shadow-xl">
            <Card.Header className="pb-4">
              <div className="flex items-center space-x-3">
                <Sword className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Your Mission Log
                </h3>
              </div>
            </Card.Header>
            <Card.Content className="space-y-6">
              {/* Status */}
              {getStatusBadge(submission.submissionStatus)}

              {/* Submission Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                    Mission Details
                  </h4>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Engagement Time:</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Attempt Number:</span>
                      <span className="text-gray-900 font-medium">
                        #{submission.attemptNumber}
                      </span>
                    </div>
                    {submission.reviewedAt && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Command Review:</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(submission.reviewedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {submission.points > 0 && (
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-200">
                        <span className="text-gray-600">Points Awarded:</span>
                        <span className="text-green-600 font-bold text-lg">
                          +{submission.points}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Screenshot Preview */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                    Mission Evidence
                  </h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                    {submission.screenshot?.url ? (
                      <div className="space-y-4">
                        <img
                          src={submission.screenshot.url}
                          alt="Mission evidence"
                          className="w-full h-48 object-contain rounded-lg shadow-sm"
                        />
                        <div className="text-sm text-gray-500 text-center bg-white py-2 rounded-lg">
                          {submission.screenshot.filename}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p>No evidence available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Feedback */}
              {submission.adminFeedback && (
                <div
                  className={`p-6 rounded-xl ${
                    submission.submissionStatus === "rejected"
                      ? "bg-gradient-to-r from-red-50 to-pink-50 border border-red-200"
                      : "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                  }`}
                >
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                    Command Feedback
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {submission.adminFeedback}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                {canEdit && (
                  <Button
                    onClick={() => setShowEditModal(true)}
                    variant="outline"
                    className="flex items-center space-x-2 border-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Update Evidence</span>
                  </Button>
                )}

                {/* Resubmit button */}
                {canResubmit && (
                  <Button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:shadow-lg"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Re-engage Mission</span>
                  </Button>
                )}

                <Button
                  onClick={fetchCTFData}
                  variant="outline"
                  className="flex items-center space-x-2 border-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Status</span>
                </Button>
              </div>
            </Card.Content>
          </Card>
        ) : (
          /* No Submission State */
          <Card className="border-0 shadow-xl">
            <Card.Content className="text-center py-16">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-gray-100 to-blue-100 rounded-2xl">
                  <Upload className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Mission Logs
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                {canSubmit
                  ? "Submit your mission evidence with screenshot to earn points!"
                  : ctfStatus === "active"
                  ? `Engagements only accepted between ${formatTimeForDisplay(
                      ctf.activeHours.startTime
                    )} - ${formatTimeForDisplay(ctf.activeHours.endTime)}`
                  : "Mission is not currently active for engagements"}
              </p>
              {canSubmit && (
                <Button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center space-x-2 mx-auto bg-gradient-to-r from-green-600 to-emerald-600 border-0 hover:shadow-lg"
                >
                  <Upload className="h-4 w-4" />
                  <span>Initiate First Engagement</span>
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
      </div>

      {/* Submit Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Mission Evidence"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CTF Status Check */}
          {!canSubmit && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Engagement Not Available
                  </h3>
                  <div className="text-red-700 space-y-2">
                    <p>Mission engagements are only allowed when:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Mission status is <strong>active</strong>
                      </li>
                      <li>
                        Current time is within active hours:{" "}
                        {formatTimeForDisplay(ctf.activeHours.startTime)} -{" "}
                        {formatTimeForDisplay(ctf.activeHours.endTime)}
                      </li>
                    </ul>
                    <div className="mt-3 p-3 bg-white rounded-lg border border-red-200">
                      <p className="text-sm">
                        <strong>Current status:</strong> {ctf.status} |{" "}
                        <strong>Local time:</strong>{" "}
                        {currentTime.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Flag Authentication
            </label>
            <input
              type="text"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              placeholder="CTF{...}"
              className="block w-full border-2 border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
              required
              disabled={!canSubmit}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Mission Evidence (Screenshot) *
            </label>

            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-xl file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gradient-to-r file:from-blue-50 file:to-blue-100 file:text-blue-700
                  hover:file:bg-blue-200 transition-all"
                required
                disabled={!canSubmit}
              />
              <p className="text-xs text-gray-500 mt-2 ml-2">
                Supported formats: JPEG, PNG, GIF (Maximum: 4MB)
              </p>
            </div>

            {/* Preview Section */}
            {previewUrl && (
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-blue-50/50">
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Evidence preview"
                    className="mx-auto h-48 object-contain rounded-lg shadow-sm"
                  />
                  <p className="text-sm text-gray-600 font-medium">
                    {selectedFile?.name}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="border-2"
                  >
                    Remove Evidence
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Instructions when no file selected */}
            {!previewUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50">
                <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-2">
                  No evidence selected
                </p>
                <p className="text-gray-500">
                  Select mission evidence file above
                </p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <Eye className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Mission Protocol
                </h3>
                <div className="text-blue-700 space-y-2">
                  <p>Your evidence will be reviewed by command center.</p>
                  <p>
                    You'll receive transmission once reviewed and processed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSubmitModal(false)}
              className="border-2 px-6"
            >
              Abort Mission
            </Button>
            <Button
              type="submit"
              loading={uploading}
              disabled={!selectedFile || !flag.trim() || !canSubmit}
              className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 hover:shadow-lg px-8"
            >
              Submit Evidence
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Screenshot Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Update Mission Evidence"
        size="lg"
      >
        <form onSubmit={handleEdit} className="space-y-6">
          {/* CTF Status Check */}
          {!canSubmit && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Evidence Update Not Available
                  </h3>
                  <div className="text-red-700">
                    <p>Evidence updates are only allowed when:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>
                        Mission status is <strong>active</strong>
                      </li>
                      <li>
                        Current time is within active hours:{" "}
                        {formatTimeForDisplay(ctf.activeHours.startTime)} -{" "}
                        {formatTimeForDisplay(ctf.activeHours.endTime)}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              New Mission Evidence *
            </label>

            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-xl file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gradient-to-r file:from-blue-50 file:to-blue-100 file:text-blue-700
                  hover:file:bg-blue-200 transition-all"
                required
                disabled={!canSubmit}
              />
              <p className="text-xs text-gray-500 mt-2 ml-2">
                Supported formats: JPEG, PNG, GIF (Maximum: 4MB)
              </p>
            </div>

            {/* Preview Section */}
            {previewUrl && (
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-blue-50/50">
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Evidence preview"
                    className="mx-auto h-48 object-contain rounded-lg shadow-sm"
                  />
                  <p className="text-sm text-gray-600 font-medium">
                    {selectedFile?.name}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="border-2"
                  >
                    Remove Evidence
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Instructions when no file selected */}
            {!previewUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50">
                <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-2">
                  No evidence selected
                </p>
                <p className="text-gray-500">Select new evidence file above</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-6 w-6 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Mission Note
                </h3>
                <div className="text-yellow-700">
                  <p>
                    Updating evidence will reset your position in the command
                    review queue.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
              className="border-2 px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={uploading}
              disabled={!selectedFile || !canSubmit}
              className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:shadow-lg px-8"
            >
              Update Evidence
            </Button>
          </div>
        </form>
      </Modal>
    </StudentLayout>
  );
};

export default CTFSubmission;