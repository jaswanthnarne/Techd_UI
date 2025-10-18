import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../../components/layout/StudentLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { userCTFAPI } from "../../services/user";
import {
  Clock,
  Users,
  Trophy,
  Calendar,
  Flag,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  BarChart3,
  Upload,
  ExternalLink,
  Zap,
  Target,
  Shield,
  Sword,
  Crown,
  Sparkles,
} from "lucide-react";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";

const CTFDetail = () => {
  const { id } = useParams();
  const [ctf, setCtf] = useState(null);
  const [progress, setProgress] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [flag, setFlag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (id) {
      fetchCTFData();
    }
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchCTFData = async () => {
    try {
      setLoading(true);
      const [ctfResponse, progressResponse, submissionsResponse] =
        await Promise.all([
          userCTFAPI.getCTF(id),
          userCTFAPI.getProgress(id),
          userCTFAPI.getMySubmissions({ ctfId: id }),
        ]);

      setCtf(ctfResponse.data.ctf);
      setProgress(progressResponse.data.progress);
      setSubmissions(submissionsResponse.data.submissions || []);
    } catch (error) {
      console.error("Failed to fetch CTF data:", error);
      toast.error("Failed to load mission details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFlag = async (e) => {
    e.preventDefault();
    if (!flag.trim()) return;

    try {
      setSubmitting(true);
      const response = await userCTFAPI.submitFlag(id, { flag: flag.trim() });

      if (response.data.solved) {
        toast.success(
          `Flag captured! +${response.data.points} points added to your arsenal!`
        );
        setShowSubmitModal(false);
        setFlag("");
        fetchCTFData();
      } else {
        toast.error("Invalid flag. The system remains secure... for now.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Transmission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVisitCTF = (ctfLink, ctfTitle) => {
    if (!ctfLink) {
      toast.error("No battlefield coordinates available");
      return;
    }

    let url = ctfLink;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const calculateCurrentStatus = (ctf) => {
    const now = currentTime;
    const startDate = new Date(ctf.schedule.startDate);
    const endDate = new Date(ctf.schedule.endDate);

    if (!ctf.isVisible || !ctf.isPublished) {
      return { status: "inactive", isCurrentlyActive: false };
    }

    if (now < startDate) {
      return { status: "upcoming", isCurrentlyActive: false };
    }

    if (now > endDate) {
      return { status: "ended", isCurrentlyActive: false };
    }

    if (
      ctf.activeHours &&
      ctf.activeHours.startTime &&
      ctf.activeHours.endTime
    ) {
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const currentMinutes = timeToMinutes(now.toTimeString().slice(0, 8));
      const startMinutes = timeToMinutes(ctf.activeHours.startTime);
      const endMinutes = timeToMinutes(ctf.activeHours.endTime);

      if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
        return { status: "inactive", isCurrentlyActive: false };
      }
    }

    return { status: "active", isCurrentlyActive: true };
  };

  const getStatusBadge = () => {
    const realTimeStatus = ctf
      ? calculateCurrentStatus(ctf)
      : { status: "inactive", isCurrentlyActive: false };

    const statusConfig = {
      active: {
        color: realTimeStatus.isCurrentlyActive
          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
          : "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200",
        label: realTimeStatus.isCurrentlyActive
          ? "Mission Live"
          : "Standing By",
        icon: realTimeStatus.isCurrentlyActive ? Zap : Clock,
        description: realTimeStatus.isCurrentlyActive
          ? "Systems engaged"
          : `Active ${ctf.activeHours.startTime}-${ctf.activeHours.endTime}`,
      },
      upcoming: {
        color:
          "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200",
        label: "Mission Incoming",
        icon: Calendar,
        description: `Deploys ${new Date(
          ctf.schedule.startDate
        ).toLocaleDateString()}`,
      },
      ended: {
        color:
          "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200",
        label: "Mission Complete",
        icon: CheckCircle,
        description: "Objective completed",
      },
      inactive: {
        color:
          "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200",
        label: "Mission Offline",
        icon: EyeOff,
        description: "System maintenance",
      },
    };

    const config = statusConfig[realTimeStatus.status] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <div
        className={`px-4 py-3 rounded-xl flex items-center space-x-3 ${config.color} backdrop-blur-sm`}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div>
          <div className="font-semibold text-sm">{config.label}</div>
          <div className="text-xs opacity-90">{config.description}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout title="Mission Briefing" subtitle="Loading combat data...">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <Target className="h-10 w-10 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-lg">
              Decrypting mission parameters...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!ctf) {
    return (
      <Layout title="Mission Not Found" subtitle="Target acquisition failed">
        <Card className="border-0 shadow-xl">
          <Card.Content className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl">
                <XCircle className="h-16 w-16 text-red-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Mission Coordinates Lost
            </h3>
            <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
              The requested combat zone could not be located in our database.
            </p>
            <Link to="/student/ctfs">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg">
                <Shield className="h-4 w-4 mr-2" />
                Return to War Room
              </Button>
            </Link>
          </Card.Content>
        </Card>
      </Layout>
    );
  }

  const canSubmit = progress?.canSubmit && !progress?.isSolved;
  const hasCTFLink = ctf.ctfLink && ctf.ctfLink.trim() !== "";

  return (
    <Layout title={ctf.title} subtitle={`${ctf.category} - Mission Briefing`}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-12">
        {/* Mission Header */}
        <Card className="border-0 shadow-xl mb-8">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    <Trophy className="h-5 w-5 mr-3 text-yellow-500" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {ctf.points} pts
                      </div>
                      <div className="text-sm text-gray-500">Mission Value</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {new Date(ctf.schedule.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Deployment Date
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    <Clock className="h-5 w-5 mr-3 text-green-500" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {ctf.activeHours.startTime} - {ctf.activeHours.endTime}
                      </div>
                      <div className="text-sm text-gray-500">Active Hours</div>
                    </div>
                  </div>
                </div>

                {getStatusBadge()}
              </div>

              <div className="flex flex-col space-y-4 min-w-[280px]">
                {progress?.isSolved && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <div>
                        <div className="text-green-800 font-semibold">
                          Objective Secured!
                        </div>
                        <div className="text-green-700 text-sm">
                          Mission reward: {progress.pointsEarned} points
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {hasCTFLink && (
                  <Button
                    onClick={() => handleVisitCTF(ctf.ctfLink, ctf.title)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Access Battlefield</span>
                  </Button>
                )}

                {canSubmit && (
                  <Button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 border-0 hover:shadow-lg transition-all"
                  >
                    <Flag className="h-4 w-4" />
                    <span>Submit Flag</span>
                  </Button>
                )}

                <Link to={`/student/ctf/${id}/leaderboard`}>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 w-full border-2"
                  >
                    <Crown className="h-4 w-4" />
                    <span>View Rankings</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Mission Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="text-3xl font-black text-gray-900 mb-2">
              {progress?.attempts || 0}
            </div>
            <div className="text-sm font-semibold text-blue-700">
              Engagement Attempts
            </div>
          </Card>

          <Card className="border-0 shadow-lg text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50">
            <div className="text-3xl font-black text-gray-900 mb-2">
              {ctf.maxAttempts}
            </div>
            <div className="text-sm font-semibold text-yellow-700">
              Maximum Attempts
            </div>
          </Card>

          <Card className="border-0 shadow-lg text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-3xl font-black text-gray-900 mb-2">
              {progress?.isSolved ? progress.pointsEarned : 0}
            </div>
            <div className="text-sm font-semibold text-green-700">
              Points Secured
            </div>
          </Card>
        </div>

        {/* Battlefield Access */}
        {hasCTFLink && (
          <Card className="border-0 shadow-xl mb-8">
            <Card.Header className="pb-4">
              <div className="flex items-center space-x-3">
                <ExternalLink className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Battlefield Coordinates
                </h3>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                <div className="flex-1">
                  <p className="text-gray-600 mb-3">
                    Primary target environment and mission resources:
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="px-4 py-2 bg-white rounded-lg border border-purple-200">
                      <code className="text-sm font-mono text-purple-600">
                        {ctf.ctfLink}
                      </code>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleVisitCTF(ctf.ctfLink, ctf.title)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg whitespace-nowrap"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Launch Mission</span>
                </Button>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Mission Log */}
        <Card className="border-0 shadow-xl">
          <Card.Header className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sword className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Mission Log</h3>
              </div>
              <Link to={`/student/ctf/${ctf._id}/submit`}>
                <Button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:shadow-lg">
                  <Upload className="h-4 w-4" />
                  <span>Submit Evidence</span>
                </Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Content>
            {submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.map((submission, index) => (
                  <div
                    key={submission._id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-xl ${
                          submission.isCorrect
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-600"
                            : "bg-gradient-to-r from-red-100 to-pink-100 text-red-600"
                        }`}
                      >
                        {submission.isCorrect ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          Engagement #{submissions.length - index}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(submission.submittedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${
                          submission.isCorrect
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                        }`}
                      >
                        {submission.isCorrect ? (
                          <>
                            <Sparkles className="h-3 w-3 mr-1" />+
                            {submission.points}
                          </>
                        ) : (
                          "Failed"
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-r from-gray-100 to-slate-100 rounded-2xl">
                    <Flag className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  No Mission Logs
                </h4>
                <p className="text-gray-600 mb-6">
                  Your engagement history will appear here
                </p>
                {canSubmit && (
                  <Button
                    onClick={() => setShowSubmitModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Initiate First Engagement
                  </Button>
                )}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Submit Flag Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Flag"
        size="md"
      >
        <form onSubmit={handleSubmitFlag} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Enter Flag Authentication
            </label>
            <input
              type="text"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              placeholder="CTF{...}"
              className="block w-full border-2 border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg font-mono"
              required
            />
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Eye className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800">
                  Remaining Attempts
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  You have {ctf.maxAttempts - (progress?.attempts || 0)}{" "}
                  authentication attempts remaining
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSubmitModal(false)}
              className="border-2"
            >
              Abort Mission
            </Button>
            <Button
              type="submit"
              loading={submitting}
              disabled={!flag.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 hover:shadow-lg"
            >
              Authenticate Flag
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default CTFDetail;
