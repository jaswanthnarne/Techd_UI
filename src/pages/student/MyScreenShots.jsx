import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { userCTFAPI } from "../../services/user";
import {
  Image,
  Eye,
  Download,
  Calendar,
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  Hourglass,
  Filter,
  Search,
  ExternalLink,
  Shield,
  Zap,
  Clock,
  Users,
  Award,
  AlertCircle,
} from "lucide-react";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";

const MyScreenshots = () => {
  const [screenshots, setScreenshots] = useState([]);
  const [ctfs, setCtfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCTF, setSelectedCTF] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [screenshotsResponse, ctfsResponse] = await Promise.all([
        userCTFAPI.getMyScreenshots(),
        userCTFAPI.getMyCTFsWithSubmissions(),
      ]);

      // Filter out submissions with invalid or missing CTF data
      const validSubmissions = (
        screenshotsResponse.data?.submissions || []
      ).filter((submission) => submission.ctf && submission.ctf._id);

      setScreenshots(validSubmissions);
      setCtfs(ctfsResponse.data?.ctfs || []);
    } catch (error) {
      console.error("Failed to fetch screenshots:", error);
      toast.error("Failed to load your mission evidence");
    } finally {
      setLoading(false);
    }
  };

  const handleViewScreenshot = (submission) => {
    setSelectedScreenshot(submission);
    setShowModal(true);
  };

  const handleDownloadScreenshot = async (submission) => {
    try {
      if (!submission.screenshot?.url) {
        toast.error("No screenshot available for download");
        return;
      }

      const response = await fetch(submission.screenshot.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Safe filename generation
      const ctfTitle = submission.ctf?.title || "UnknownCTF";
      const date = new Date(submission.submittedAt).toISOString().split("T")[0];
      link.download = `evidence-${ctfTitle.replace(
        /[^a-zA-Z0-9]/g,
        "-"
      )}-${date}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Evidence downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download evidence");
    }
  };

  const getStatusBadge = (submission) => {
    const statusConfig = {
      approved: {
        color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        color: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
        icon: XCircle,
        label: "Rejected",
      },
      pending: {
        color: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white",
        icon: Hourglass,
        label: "Pending Review",
      },
    };

    const status = submission.submissionStatus || "pending";
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getStatusIcon = (submission) => {
    const statusConfig = {
      approved: {
        color: "text-green-500 bg-green-100",
        icon: CheckCircle,
      },
      rejected: {
        color: "text-red-500 bg-red-100",
        icon: XCircle,
      },
      pending: {
        color: "text-yellow-500 bg-yellow-100",
        icon: Hourglass,
      },
    };

    const status = submission.submissionStatus || "pending";
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return <Icon className={`h-5 w-5 ${config.color} rounded-full p-1`} />;
  };

  // Safe filtering function
  const filteredScreenshots = screenshots.filter((submission) => {
    // Check if CTF data exists
    if (!submission.ctf || !submission.ctf._id) {
      return false;
    }

    // Filter by status
    if (filter !== "all" && submission.submissionStatus !== filter) {
      return false;
    }

    // Filter by CTF
    if (selectedCTF !== "all" && submission.ctf._id !== selectedCTF) {
      return false;
    }

    // Filter by search
    if (
      search &&
      submission.ctf.title &&
      !submission.ctf.title.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Safe unique CTFs extraction
  const uniqueCTFs = [
    ...new Map(
      screenshots
        .filter((submission) => submission.ctf && submission.ctf._id)
        .map((item) => [item.ctf._id, item.ctf])
    ).values(),
  ];

  if (loading) {
    return (
      <StudentLayout
        title="Mission Evidence"
        subtitle="Loading your evidence gallery..."
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <Image className="h-8 w-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-600">Gathering your mission evidence...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout
      title="Mission Evidence Gallery"
      subtitle="Your collection of captured flags and battle evidence"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-12">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
            <Image className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-black text-gray-900">
              {screenshots.length}
            </div>
            <div className="text-sm font-semibold text-blue-700">
              Total Evidence
            </div>
          </Card>

          <Card className="border-0 shadow-lg text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-black text-gray-900">
              {
                screenshots.filter((s) => s.submissionStatus === "approved")
                  .length
              }
            </div>
            <div className="text-sm font-semibold text-green-700">
              Approved Missions
            </div>
          </Card>

          <Card className="border-0 shadow-lg text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50">
            <Hourglass className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
            <div className="text-2xl font-black text-gray-900">
              {
                screenshots.filter((s) => s.submissionStatus === "pending")
                  .length
              }
            </div>
            <div className="text-sm font-semibold text-yellow-700">
              Pending Review
            </div>
          </Card>

          <Card className="border-0 shadow-lg text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-black text-gray-900">
              {uniqueCTFs.length}
            </div>
            <div className="text-sm font-semibold text-purple-700">
              Different CTFs
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-xl mb-8">
          <Card.Content className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mission evidence..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-3 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white w-full transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={selectedCTF}
                  onChange={(e) => setSelectedCTF(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                >
                  <option value="all">All CTFs</option>
                  {uniqueCTFs.map((ctf) => (
                    <option key={ctf._id} value={ctf._id}>
                      {ctf.title}
                    </option>
                  ))}
                </select>

                <Button
                  onClick={fetchData}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Screenshots Grid */}
        {filteredScreenshots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScreenshots.map((submission) => (
              <Card
                key={submission._id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Card.Content className="p-0 overflow-hidden">
                  {/* Screenshot Thumbnail */}
                  <div
                    className="relative h-48 bg-gray-100 cursor-pointer group"
                    onClick={() => handleViewScreenshot(submission)}
                  >
                    {submission.screenshot?.url ? (
                      <>
                        <img
                          src={submission.screenshot.url}
                          alt={`Evidence for ${
                            submission.ctf?.title || "Unknown CTF"
                          }`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <AlertCircle className="h-12 w-12 text-gray-400" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(submission)}
                    </div>
                  </div>

                  {/* Submission Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                        {submission.ctf?.title || "Unknown CTF"}
                      </h3>
                      {getStatusIcon(submission)}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Category:</span>
                        <span className="font-semibold text-gray-900">
                          {submission.ctf?.category || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Points:</span>
                        <span className="font-bold text-yellow-600">
                          {submission.ctf?.points || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Submitted:</span>
                        <span className="font-medium">
                          {new Date(
                            submission.submittedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {submission.points > 0 && (
                        <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
                          <span className="text-green-700 font-semibold">
                            Points Earned:
                          </span>
                          <span className="text-green-700 font-bold">
                            +{submission.points}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewScreenshot(submission)}
                        className="flex-1 flex items-center space-x-2 border-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadScreenshot(submission)}
                        disabled={!submission.screenshot?.url}
                        className="flex-1 flex items-center space-x-2 border-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                    </div>

                    {/* CTF Link - Only show if CTF ID exists */}
                    {submission.ctf?._id && (
                      <Link
                        to={`/student/ctf/${submission.ctf._id}`}
                        className="block mt-3 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Mission Details →
                      </Link>
                    )}
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-xl">
            <Card.Content className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-r from-gray-100 to-blue-100 rounded-2xl">
                  <Image className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Evidence Found
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                {search || filter !== "all" || selectedCTF !== "all"
                  ? "No mission evidence matches your search criteria."
                  : "You haven't submitted any mission evidence yet."}
              </p>
              {search || filter !== "all" || selectedCTF !== "all" ? (
                <Button
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                    setSelectedCTF("all");
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg"
                >
                  Clear Filters
                </Button>
              ) : (
                <Link to="/student/ctfs">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 hover:shadow-lg">
                    <Target className="h-4 w-4 mr-2" />
                    Explore Challenges
                  </Button>
                </Link>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Screenshot Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            selectedScreenshot
              ? `Evidence - ${selectedScreenshot.ctf?.title || "Unknown CTF"}`
              : ""
          }
          size="xl"
        >
          {selectedScreenshot && (
            <div className="space-y-6">
              {/* Screenshot */}
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                {selectedScreenshot.screenshot?.url ? (
                  <img
                    src={selectedScreenshot.screenshot.url}
                    alt={`Evidence for ${
                      selectedScreenshot.ctf?.title || "Unknown CTF"
                    }`}
                    className="w-full h-auto max-h-96 object-contain"
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                    <AlertCircle className="h-16 w-16 text-gray-400" />
                    <p className="ml-4 text-gray-500">
                      No screenshot available
                    </p>
                  </div>
                )}
              </div>

              {/* Submission Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg">
                    Mission Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">CTF Challenge:</span>
                      <span className="font-semibold">
                        {selectedScreenshot.ctf?.title || "Unknown CTF"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-semibold">
                        {selectedScreenshot.ctf?.category || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Points Value:</span>
                      <span className="font-bold text-yellow-600">
                        {selectedScreenshot.ctf?.points || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">CTF Flag</span>
                      <span className="font-semibold">
                        {selectedScreenshot.flag || "Unknown Flag"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg">
                    Submission Info
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(selectedScreenshot)}
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-medium">
                        {new Date(
                          selectedScreenshot.submittedAt
                        ).toLocaleString()}
                      </span>
                    </div>
                    {selectedScreenshot.reviewedAt && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Reviewed:</span>
                        <span className="font-medium">
                          {new Date(
                            selectedScreenshot.reviewedAt
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedScreenshot.points > 0 && (
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-green-700 font-semibold">
                          Points Awarded:
                        </span>
                        <span className="text-green-700 font-bold text-lg">
                          +{selectedScreenshot.points}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Feedback */}
              {selectedScreenshot.adminFeedback && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Command Feedback
                  </h4>
                  <p className="text-gray-700">
                    {selectedScreenshot.adminFeedback}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadScreenshot(selectedScreenshot)}
                  disabled={!selectedScreenshot.screenshot?.url}
                  className="border-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Evidence
                </Button>
                {selectedScreenshot.ctf?._id && (
                  <Link to={`/student/ctf/${selectedScreenshot.ctf._id}`}>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Mission
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </StudentLayout>
  );
};

export default MyScreenshots;