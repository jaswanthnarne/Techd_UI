import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { userCTFAPI } from "../../services/user";
import {
  Clock,
  Users,
  Trophy,
  Calendar,
  Play,
  Eye,
  Filter,
  Search,
  Award,
  ExternalLink,
  Zap,
  Target,
  Shield,
  Lock,
  Code,
  Binary,
  Key,
  ScanEye,
  Brain,
  Sparkles,
  AlertTriangle,
  Crown,
} from "lucide-react";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";

const CTFs = () => {
  const [ctfs, setCtfs] = useState([]);
  const [joinedCTFs, setJoinedCTFs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for real-time status changes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCTFs();
  }, [filter, search, category]);

  const fetchCTFs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== "all") params.status = filter;
      if (search) params.search = search;
      if (category !== "all") params.category = category;

      const response = await userCTFAPI.getAllCTFs(params);
      setCtfs(response.data.ctfs);

      const joined = new Set();
      for (const ctf of response.data.ctfs) {
        try {
          const joinedResponse = await userCTFAPI.checkJoined(ctf._id);
          if (joinedResponse.data.joined) {
            joined.add(ctf._id);
          }
        } catch (error) {
          console.error(
            `Failed to check joined status for CTF ${ctf._id}:`,
            error
          );
        }
      }
      setJoinedCTFs(joined);
    } catch (error) {
      console.error("Failed to fetch CTFs:", error);
      toast.error("Failed to load CTFs");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCTF = async (ctfId) => {
    try {
      await userCTFAPI.joinCTF(ctfId);
      setJoinedCTFs((prev) => new Set([...prev, ctfId]));
      toast.success("Welcome to the challenge! Time to show off your skills.");
      fetchCTFs();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to join CTF");
    }
  };

  const handleVisitCTF = (ctfLink, ctfTitle) => {
    if (!ctfLink) {
      toast.error("No challenge link available - even we are confused");
      return;
    }

    let url = ctfLink;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const isWithinActiveHours = (ctf) => {
    if (
      !ctf.activeHours ||
      !ctf.activeHours.startTime ||
      !ctf.activeHours.endTime
    ) {
      return true;
    }

    const now = currentTime;

    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const currentMinutes = timeToMinutes(now.toTimeString().slice(0, 8));
    const startMinutes = timeToMinutes(ctf.activeHours.startTime);
    const endMinutes = timeToMinutes(ctf.activeHours.endTime);

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  const calculateCurrentStatus = (ctf) => {
    if (!ctf.isVisible || !ctf.isPublished) {
      return { status: "inactive", isCurrentlyActive: false };
    }

    const withinActiveHours = isWithinActiveHours(ctf);

    if (withinActiveHours) {
      return { status: "active", isCurrentlyActive: true };
    } else {
      return { status: "inactive", isCurrentlyActive: false };
    }
  };

  const isJoinButtonEnabled = (ctf) => {
    const { status, isCurrentlyActive } = calculateCurrentStatus(ctf);
    return status === "active" && isCurrentlyActive && !joinedCTFs.has(ctf._id);
  };

  const shouldShowContinueButton = (ctf) => {
    return joinedCTFs.has(ctf._id);
  };

  const isExternalLinkEnabled = (ctf) => {
    const { status, isCurrentlyActive } = calculateCurrentStatus(ctf);
    const hasCTFLink = ctf.ctfLink && ctf.ctfLink.trim() !== "";
    return hasCTFLink && status === "active" && isCurrentlyActive;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Web Security": Shield,
      Cryptography: Key,
      Forensics: ScanEye,
      "Reverse Engineering": Binary,
      Pwn: Zap,
      Misc: Brain,
    };
    return icons[category] || Target;
  };

  const getStatusBadge = (ctf) => {
    const { status, isCurrentlyActive } = calculateCurrentStatus(ctf);

    const statusConfig = {
      active: {
        color: isCurrentlyActive
          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
          : "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200",
        label: isCurrentlyActive ? "Live & Kicking" : "Taking a Nap",
        description: isCurrentlyActive
          ? "Go break things (legally)"
          : `Wakes up at ${ctf.activeHours.startTime}`,
        icon: isCurrentlyActive ? Zap : Clock,
      },
      upcoming: {
        color:
          "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200",
        label: "Coming Soon",
        description: `Starts ${new Date(
          ctf.schedule.startDate
        ).toLocaleDateString()}`,
        icon: Calendar,
      },
      ended: {
        color:
          "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200",
        label: "Game Over",
        description: "Challenge has ended",
        icon: Award,
      },
      inactive: {
        color:
          "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200",
        label: "Taking a Break",
        description: "CTF is not currently available",
        icon: AlertTriangle,
      },
    };

    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <div
        className={`px-4 py-3 rounded-xl text-sm flex items-center space-x-3 ${config.color} backdrop-blur-sm`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{config.label}</div>
          <div className="text-xs opacity-90 truncate">
            {config.description}
          </div>
        </div>
      </div>
    );
  };

  const getCategoryBadge = (category) => {
    const Icon = getCategoryIcon(category);
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
        <Icon className="h-3 w-3 mr-1.5" />
        {category}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      Easy: {
        color:
          "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200",
        label: "Warm Up",
      },
      Medium: {
        color:
          "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border border-yellow-200",
        label: "Brain Teaser",
      },
      Hard: {
        color:
          "bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 border border-orange-200",
        label: "Mind Bender",
      },
      Expert: {
        color:
          "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200",
        label: "Insanity Mode",
      },
    };

    const config = difficultyConfig[difficulty] || difficultyConfig.Easy;
    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${config.color}`}
      >
        <Target className="h-3 w-3 mr-1.5" />
        {config.label}
      </span>
    );
  };

  const categories = [
    "all",
    "Web Security",
    "Cryptography",
    "Forensics",
    "Reverse Engineering",
    "Pwn",
    "Misc",
  ];

  const filteredCTFs = ctfs.filter((ctf) => {
    const { status } = calculateCurrentStatus(ctf);

    if (filter !== "all" && status !== filter) return false;
    if (
      search &&
      !ctf.title.toLowerCase().includes(search.toLowerCase()) &&
      !ctf.description.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (category !== "all" && ctf.category !== category) return false;
    return true;
  });

  return (
    <StudentLayout
      title="CTF Arena"
      subtitle="Where legends are born and firewalls cry"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-12">
        {/* Header Section */}
        <div className="text-center mb-12 pt-8">
          {/* Collaboration Banner */}
          <div className="mb-6">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 rounded-2xl px-6 py-3 backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                {/* TD Logo/Icon */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 text-sm">
                    TECH DEFENSE
                  </span>
                </div>

                {/* X Symbol */}
                <div className="flex items-center">
                  <div className="w-6 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                  <Sparkles className="h-4 w-4 text-purple-500 mx-2" />
                  <div className="w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>

                {/* PU Logo/Icon */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 text-sm">
                    PARUL UNIVERSITY
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Title Section */}
          <div className="relative">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="relative z-10">
              {/* Main Title with Icons */}
              <div className="flex items-center justify-center space-x-6 mb-4">
                {/* Left Icon */}
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                  <Shield className="h-10 w-10 text-white" />
                </div>

                {/* Center Title */}
                <div className="text-center">
                  <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    CTF CHALLENGE ARENA
                  </h1>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 font-medium">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span>OFFICIAL COMPETITION PLATFORM</span>
                    <Target className="h-4 w-4 text-red-500" />
                  </div>
                </div>

                {/* Right Icon */}
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                  <Zap className="h-10 w-10 text-white" />
                </div>
              </div>

              {/* Subtitle with decorative elements */}
              <div className="max-w-3xl mx-auto">
                <p className="text-xl text-gray-600 mb-2 leading-relaxed">
                  Making cybersecurity warriors… because someone has to panic
                  when things break.
                </p>

                {/* Stats Bar */}
                <div className="flex items-center justify-center space-x-8 mt-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span>200+ Participants</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span>80+ Challenges</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-2 shadow-lg animate-pulse">
                    <Zap className="h-5 w-5 text-green-600 animate-bounce" />
                    <span className="text-sm font-bold text-green-800">
                      {
                        ctfs.filter((ctf) => {
                          const { status, isCurrentlyActive } =
                            calculateCurrentStatus(ctf);
                          return status === "active" && isCurrentlyActive;
                        }).length
                      }
                      <span className="ml-1 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        LIVE BATTLES
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-purple-500" />
                    <span>1000+ Points Awarded</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Bottom Border */}
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
          </div>
        </div>
        {/* Filters Section */}
        <Card className="border-0 shadow-xl mb-8 bg-white/80 backdrop-blur-sm">
          <Card.Content className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for challenges that will hurt your brain..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-4 py-3 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white w-full transition-all shadow-sm"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Live Now</option>
                  <option value="upcoming">Coming Soon</option>
                  <option value="ended">Game Over</option>
                  <option value="inactive">Taking Break</option>
                </select>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>

                <Button
                  onClick={fetchCTFs}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg transition-all px-6"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Refresh Challenges
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* CTF Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <Brain className="h-8 w-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-600">
              Loading challenges... and your future glory
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCTFs.map((ctf) => {
              const { status, isCurrentlyActive } = calculateCurrentStatus(ctf);
              const hasCTFLink = ctf.ctfLink && ctf.ctfLink.trim() !== "";
              const joinEnabled = isJoinButtonEnabled(ctf);
              const externalLinkEnabled = isExternalLinkEnabled(ctf);
              const showContinueButton = shouldShowContinueButton(ctf);
              const CategoryIcon = getCategoryIcon(ctf.category);

              return (
                <Card
                  key={ctf._id}
                  className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>

                  <Card.Content className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
                            <CategoryIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {ctf.title}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getCategoryBadge(ctf.category)}
                          {getDifficultyBadge(ctf.difficulty)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-yellow-600 font-bold text-lg bg-yellow-50 px-3 py-1.5 rounded-full">
                          <Trophy className="h-4 w-4 mr-1.5" />
                          {ctf.points}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {ctf.description}
                    </p>

                    {/* Schedule Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                        <Calendar className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(
                            ctf.schedule.startDate
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(ctf.schedule.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                        <Clock className="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
                        <span className="truncate">
                          {ctf.activeHours.startTime} -{" "}
                          {ctf.activeHours.endTime}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                        <Users className="h-4 w-4 mr-3 text-purple-500 flex-shrink-0" />
                        <span>
                          {ctf.participants?.length || 0} brave souls attempting
                        </span>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      {getStatusBadge(ctf)}

                      <div className="flex flex-col space-y-3">
                        {/* External CTF Link Button */}
                        {hasCTFLink && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleVisitCTF(ctf.ctfLink, ctf.title)
                            }
                            disabled={!externalLinkEnabled}
                            className="flex items-center space-x-2 w-full border-2 transition-all"
                            title={
                              externalLinkEnabled
                                ? `Visit ${ctf.title} challenge`
                                : "Challenge is sleeping right now"
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>
                              {externalLinkEnabled
                                ? "Enter Battlefield"
                                : "Field Closed"}
                            </span>
                          </Button>
                        )}

                        {/* Continue Button (for joined CTFs) */}
                        {showContinueButton ? (
                          <Link
                            to={`/student/ctf/${ctf._id}`}
                            className="w-full"
                          >
                            <Button
                              size="sm"
                              className="flex items-center space-x-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 border-0 hover:shadow-lg transition-all"
                            >
                              <Play className="h-4 w-4" />
                              <span>Continue the Fight</span>
                            </Button>
                          </Link>
                        ) : (
                          /* Join Button (for non-joined CTFs) */
                          <Button
                            size="sm"
                            onClick={() => handleJoinCTF(ctf._id)}
                            disabled={!joinEnabled}
                            className={`flex items-center space-x-2 w-full border-0 transition-all ${
                              joinEnabled
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            title={
                              joinEnabled
                                ? "Join the challenge and become legendary"
                                : status !== "active"
                                ? `CTF is ${status.toLowerCase()}`
                                : !isCurrentlyActive
                                ? "CTF is currently napping"
                                : "Already in the arena"
                            }
                          >
                            <Zap className="h-4 w-4" />
                            <span>
                              {joinEnabled
                                ? "Accept Challenge"
                                : "Challenge Locked"}
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCTFs.length === 0 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <Card.Content className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-r from-gray-100 to-slate-100 rounded-2xl">
                  <Award className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Challenges Found
              </h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                {search || filter !== "all" || category !== "all"
                  ? "Our challenges are hiding from your search. Try different keywords or stop being so picky."
                  : "The arena is empty! Check back later for new challenges to conquer."}
              </p>
              {(search || filter !== "all" || category !== "all") && (
                <Button
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                    setCategory("all");
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Show Me Everything
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
};

export default CTFs;
