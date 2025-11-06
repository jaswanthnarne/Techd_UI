import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import CTFForm from "../../components/forms/CTFFrom";
import { ctfAPI } from "../../services/admin";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Users,
  MoreVertical,
  Search,
  Filter,
  Download,
  Upload,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  Activity,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  FileText,
  UserCheck,
  RefreshCw,
  BarChart3,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  Target,
  Trophy,
  Crown,
  Brain,
  Sword,
} from "lucide-react";
import toast from "react-hot-toast";

const CTFManagement = () => {
  const [ctfs, setCtfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCTF, setEditingCTF] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const [viewCTF, setViewCTF] = useState(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(null);
  const [analyticsCTF, setAnalyticsCTF] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [bulkExportMenuOpen, setBulkExportMenuOpen] = useState(false);

  // Update current time every minute for real-time status changes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCTFs();
  }, []);

  const fetchCTFs = async () => {
    try {
      setLoading(true);
      const response = await ctfAPI.getAllCTFs();
      // console.log("Fetched CTFs:", response.data.ctfs);
      setCtfs(response.data.ctfs);
    } catch (error) {
      toast.error("Failed to fetch CTFs");
    } finally {
      setLoading(false);
    }
  };

  const refreshCTFs = () => {
    fetchCTFs();
  };

  // Check if current time is within active hours for today
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

    const withinHours =
      currentMinutes >= startMinutes && currentMinutes <= endMinutes;

    return withinHours;
  };

  // Add this useEffect to handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bulkExportMenuOpen &&
        !event.target.closest(".export-dropdown-container")
      ) {
        setBulkExportMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [bulkExportMenuOpen]);
  // Real-time status calculation considering both schedule and active hours
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

  const handleCreateCTF = async (data) => {
    try {
      setActionLoading(true);
      await ctfAPI.createCTF(data);
      toast.success("CTF created successfully");
      setShowModal(false);
      fetchCTFs();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create CTF");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCTF = async (data) => {
    try {
      setActionLoading(true);
      await ctfAPI.updateCTF(editingCTF._id, data);
      toast.success("CTF updated successfully");
      setShowModal(false);
      setEditingCTF(null);
      fetchCTFs();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update CTF");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCTF = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this CTF? This action cannot be undone."
      )
    )
      return;

    try {
      await ctfAPI.deleteCTF(id);
      toast.success("CTF deleted successfully");
      fetchCTFs();
    } catch (error) {
      toast.error("Failed to delete CTF");
    }
  };

  const handleToggleActivation = async (ctf) => {
    try {
      await ctfAPI.toggleActivation(ctf._id);
      toast.success(
        `CTF ${ctf.isVisible ? "deactivated" : "activated"} successfully`
      );
      fetchCTFs();
    } catch (error) {
      toast.error("Failed to toggle CTF activation");
    }
  };

  const handlePublish = async (ctf) => {
    try {
      if (ctf.isPublished) {
        await ctfAPI.unpublishCTF(ctf._id);
        toast.success("CTF unpublished successfully");
      } else {
        await ctfAPI.publishCTF(ctf._id);
        toast.success("CTF published successfully");
      }
      fetchCTFs();
    } catch (error) {
      toast.error(`Failed to ${ctf.isPublished ? "unpublish" : "publish"} CTF`);
    }
  };

  const handleForceStatus = async (ctfId, newStatus) => {
    try {
      await ctfAPI.forceStatus(ctfId, newStatus);
      toast.success(`CTF status updated to ${newStatus}`);
      fetchCTFs();
    } catch (error) {
      toast.error("Failed to update CTF status");
    }
  };

  // Export functionality
  const handleExportCTFs = async () => {
    try {
      const response = await ctfAPI.exportCTFs();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `ctfs-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CTFs exported successfully");
      setExportMenuOpen(null);
    } catch (error) {
      toast.error("Failed to export CTFs");
    }
  };

  const handleExportCTFSubmissions = async (ctfId, ctfTitle) => {
    try {
      const response = await ctfAPI.exportCTFSubmissions(ctfId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = `submissions-${ctfTitle
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Submissions exported successfully");
      setExportMenuOpen(null);
    } catch (error) {
      toast.error("Failed to export submissions");
    }
  };

  const handleExportCTFParticipants = async (ctfId, ctfTitle) => {
    try {
      const response = await ctfAPI.exportCTFParticipants(ctfId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = `participants-${ctfTitle
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Participants exported successfully");
      setExportMenuOpen(null);
    } catch (error) {
      toast.error("Failed to export participants");
    }
  };

  const handleViewAnalytics = async (ctf) => {
    try {
      const response = await ctfAPI.getCTFAnalytics(ctf._id);
      setAnalyticsCTF({
        ...ctf,
        analytics: response.data.analytics,
      });
    } catch (error) {
      toast.error("Failed to fetch CTF analytics");
    }
  };

  const openEditModal = (ctf) => {
    setEditingCTF(ctf);
    setShowModal(true);
    setMobileMenuOpen(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCTF(null);
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success("CTF link copied to clipboard!");
  };

  const handleViewCTF = (ctf) => {
    setViewCTF(ctf);
  };

  const closeViewModal = () => {
    setViewCTF(null);
  };

  const closeAnalyticsModal = () => {
    setAnalyticsCTF(null);
  };

  const toggleRowExpansion = (ctfId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(ctfId)) {
      newExpanded.delete(ctfId);
    } else {
      newExpanded.add(ctfId);
    }
    setExpandedRows(newExpanded);
  };

  // Enhanced StatCard component matching Student Dashboard style
  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    color = "blue",
  }) => {
    const getColorClasses = (color) => {
      const colors = {
        blue: {
          gradient: "from-blue-500 to-cyan-500",
          bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
          iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
          text: "text-blue-700",
        },
        green: {
          gradient: "from-green-500 to-emerald-500",
          bg: "bg-gradient-to-br from-green-50 to-emerald-50",
          iconBg: "bg-gradient-to-br from-green-500 to-emerald-500",
          text: "text-green-700",
        },
        yellow: {
          gradient: "from-yellow-500 to-amber-500",
          bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
          iconBg: "bg-gradient-to-br from-yellow-500 to-amber-500",
          text: "text-yellow-700",
        },
        purple: {
          gradient: "from-purple-500 to-pink-500",
          bg: "bg-gradient-to-br from-purple-50 to-pink-50",
          iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
          text: "text-purple-700",
        },
      };
      return colors[color] || colors.blue;
    };

    const colorClasses = getColorClasses(color);

    return (
      <Card
        className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${colorClasses.bg}`}
      >
        <Card.Content className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-3">
                <div
                  className={`p-3 rounded-2xl ${colorClasses.iconBg} shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {title}
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900 mt-1">
                    {value}
                  </dd>
                </div>
              </div>
              {description && (
                <p className={`text-sm ${colorClasses.text} font-medium`}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  };

  // Enhanced status badge with modern design
  const getStatusBadge = (ctf) => {
    const { status, isCurrentlyActive } = calculateCurrentStatus(ctf);

    const statusConfig = {
      active: {
        color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
        label: "Active Now",
        icon: CheckCircle,
      },
      upcoming: {
        color: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
        label: "Upcoming",
        icon: Clock,
      },
      ended: {
        color: "bg-gradient-to-r from-gray-500 to-slate-500 text-white",
        label: "Ended",
        icon: AlertCircle,
      },
      inactive: {
        color: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
        label: !ctf.isVisible
          ? "Hidden"
          : !ctf.isPublished
          ? "Draft"
          : "Inactive Hours",
        icon: !ctf.isVisible ? EyeOff : !ctf.isPublished ? FileText : XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.inactive;
    const IconComponent = config.icon;

    return (
      <div
        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-2 ${config.color} shadow-sm`}
      >
        <IconComponent className="h-4 w-4" />
        <span className="font-medium">{config.label}</span>
      </div>
    );
  };

  // Enhanced visibility badge
  const getVisibilityBadge = (ctf) => {
    const { status } = calculateCurrentStatus(ctf);

    if (!ctf.isVisible) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm">
          <EyeOff className="h-3 w-3 mr-1" />
          Hidden
        </span>
      );
    } else if (!ctf.isPublished) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-sm">
          <FileText className="h-3 w-3 mr-1" />
          Draft
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
          <Eye className="h-3 w-3 mr-1" />
          Published
        </span>
      );
    }
  };

  // Enhanced difficulty badge
  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      Easy: {
        color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
        label: "Easy",
      },
      Medium: {
        color: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white",
        label: "Medium",
      },
      Hard: {
        color: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
        label: "Hard",
      },
      Expert: {
        color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
        label: "Expert",
      },
    };

    const config = difficultyConfig[difficulty] || difficultyConfig.Easy;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} shadow-sm`}
      >
        {config.label}
      </span>
    );
  };

  // Enhanced RealTimeStatusControls component
  const RealTimeStatusControls = ({ ctf, onStatusChange }) => {
    const { status, isCurrentlyActive } = calculateCurrentStatus(ctf);
    const [loading, setLoading] = useState(false);

    const handleForceStatus = async (newStatus) => {
      try {
        setLoading(true);
        await ctfAPI.forceStatus(ctf._id, newStatus);
        toast.success(`CTF status updated to ${newStatus}`);
        setStatusMenuOpen(false);
        if (onStatusChange) onStatusChange();
      } catch (error) {
        toast.error("Failed to update CTF status");
      } finally {
        setLoading(false);
      }
    };

    const handleToggleActivation = async () => {
      try {
        setLoading(true);
        await ctfAPI.toggleActivation(ctf._id);
        toast.success(
          `CTF ${ctf.isVisible ? "deactivated" : "activated"} successfully`
        );
        setStatusMenuOpen(false);
        if (onStatusChange) onStatusChange();
      } catch (error) {
        toast.error("Failed to toggle CTF activation");
      } finally {
        setLoading(false);
      }
    };

    const handlePublishToggle = async () => {
      try {
        setLoading(true);
        if (ctf.isPublished) {
          await ctfAPI.unpublishCTF(ctf._id);
          toast.success("CTF unpublished successfully");
        } else {
          await ctfAPI.publishCTF(ctf._id);
          toast.success("CTF published successfully");
        }
        setStatusMenuOpen(false);
        if (onStatusChange) onStatusChange();
      } catch (error) {
        toast.error(
          `Failed to ${ctf.isPublished ? "unpublish" : "publish"} CTF`
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="relative">
        <button
          onClick={() =>
            setStatusMenuOpen(statusMenuOpen === ctf._id ? null : ctf._id)
          }
          className={`p-2 rounded-lg transition-all duration-200 border border-gray-200 hover:shadow-sm ${
            loading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
          title="Manage CTF Status"
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-4 w-4"></div>
          ) : (
            <Activity className="h-4 w-4" />
          )}
        </button>

        {statusMenuOpen === ctf._id && (
          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-64 backdrop-blur-sm bg-white/95">
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-xl">
              <p className="text-sm font-semibold text-gray-700">
                Status Controls
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Current:{" "}
                <span className="font-medium capitalize">{status}</span>
              </p>
            </div>

            <div className="p-2 space-y-1">
              <button
                onClick={handleToggleActivation}
                disabled={loading}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  ctf.isVisible
                    ? "text-orange-700 hover:bg-orange-50 border border-orange-100"
                    : "text-green-700 hover:bg-green-50 border border-green-100"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {ctf.isVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span>
                  {ctf.isVisible ? "Hide from Users" : "Show to Users"}
                </span>
              </button>

              <button
                onClick={handlePublishToggle}
                disabled={loading}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  ctf.isPublished
                    ? "text-yellow-700 hover:bg-yellow-50 border border-yellow-100"
                    : "text-purple-700 hover:bg-purple-50 border border-purple-100"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {ctf.isPublished ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span>{ctf.isPublished ? "Unpublish" : "Publish"}</span>
              </button>
            </div>

            {/* <div className="p-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2 px-2">
                Force Status
              </p>

              <button
                onClick={() => handleForceStatus("active")}
                disabled={loading}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 border border-green-100 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <PlayCircle className="h-4 w-4" />
                <span>Set Active</span>
                {status === "active" && (
                  <CheckCircle className="h-3 w-3 ml-auto text-green-500" />
                )}
              </button>

              <button
                onClick={() => handleForceStatus("upcoming")}
                disabled={loading}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-100 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Set Upcoming</span>
                {status === "upcoming" && (
                  <CheckCircle className="h-3 w-3 ml-auto text-blue-500" />
                )}
              </button>

              <button
                onClick={() => handleForceStatus("ended")}
                disabled={loading}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-100 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <span>Set Ended</span>
                {status === "ended" && (
                  <CheckCircle className="h-3 w-3 ml-auto text-gray-500" />
                )}
              </button>
            </div> */}
          </div>
        )}
      </div>
    );
  };

  // Export controls component
  const ExportControls = ({ ctf }) => {
    return (
      <div className="relative">
        <button
          onClick={() =>
            setExportMenuOpen(exportMenuOpen === ctf._id ? null : ctf._id)
          }
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200 hover:shadow-sm"
          title="Export Data"
        >
          <Download className="h-4 w-4" />
        </button>

        {exportMenuOpen === ctf._id && (
          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-48 backdrop-blur-sm bg-white/95">
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-xl">
              <p className="text-sm font-semibold text-gray-700">Export Data</p>
            </div>
            <button
              onClick={() => {
                handleExportCTFSubmissions(ctf._id, ctf.title);
                setExportMenuOpen(false);
              }}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-all duration-200 border-b border-gray-100"
            >
              <FileText className="h-4 w-4" />
              <span>Submissions</span>
            </button>
            <button
              onClick={() => {
                handleExportCTFParticipants(ctf._id, ctf.title);
                setExportMenuOpen(false);
              }}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50 transition-all duration-200 rounded-b-xl"
            >
              <UserCheck className="h-4 w-4" />
              <span>Participants</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Action buttons component for consistent styling
  const ActionButton = ({ onClick, icon: Icon, color = "gray", title }) => {
    const colorClasses = {
      gray: "text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-gray-200",
      blue: "text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200",
      green:
        "text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200",
      red: "text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200",
      purple:
        "text-purple-600 hover:text-purple-800 hover:bg-purple-50 border-purple-200",
    };

    return (
      <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-all duration-200 border hover:shadow-sm ${colorClasses[color]}`}
        title={title}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  };

  // Filter CTFs based on search and filters
  const filteredCTFs = ctfs.filter((ctf) => {
    const { status } = calculateCurrentStatus(ctf);
    const matchesSearch =
      ctf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ctf.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || ctf.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(ctfs.map((ctf) => ctf.category))];
  const statuses = ["all", "active", "upcoming", "ended", "inactive"];

  // Calculate stats for summary with real-time status
  const stats = {
    total: ctfs.length,
    active: ctfs.filter((ctf) => {
      const { status, isCurrentlyActive } = calculateCurrentStatus(ctf);
      return status === "active" && isCurrentlyActive;
    }).length,
    upcoming: ctfs.filter((ctf) => {
      const { status } = calculateCurrentStatus(ctf);
      return status === "upcoming";
    }).length,
    ended: ctfs.filter((ctf) => {
      const { status } = calculateCurrentStatus(ctf);
      return status === "ended";
    }).length,
    inactive: ctfs.filter((ctf) => {
      const { status } = calculateCurrentStatus(ctf);
      return status === "inactive";
    }).length,
    published: ctfs.filter((ctf) => ctf.isPublished).length,
    visible: ctfs.filter((ctf) => ctf.isVisible).length,
    totalParticipants: ctfs.reduce(
      (total, ctf) => total + (ctf.participants?.length || 0),
      0
    ),
  };

  // Enhanced Analytics Modal
  const AnalyticsModal = ({ ctf, onClose }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchAnalytics = async () => {
        try {
          setLoading(true);
          const response = await ctfAPI.getCTFAnalytics(ctf._id);
          setAnalytics(response.data.analytics);
        } catch (error) {
          toast.error("Failed to fetch CTF analytics");
        } finally {
          setLoading(false);
        }
      };

      if (ctf) {
        fetchAnalytics();
      }
    }, [ctf]);

    if (!ctf) return null;

    return (
      <Modal
        isOpen={!!ctf}
        onClose={onClose}
        title={`${ctf.title} - Analytics`}
        size="2xl"
      >
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8"></div>
            <span className="ml-3 text-gray-600">Loading analytics...</span>
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                <Card.Content className="p-4 text-center">
                  <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.basic.totalParticipants}
                  </p>
                  <p className="text-sm text-gray-600">Participants</p>
                </Card.Content>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <Card.Content className="p-4 text-center">
                  <FileText className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.basic.totalSubmissions}
                  </p>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                </Card.Content>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                <Card.Content className="p-4 text-center">
                  <CheckCircle className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.basic.correctSubmissions}
                  </p>
                  <p className="text-sm text-gray-600">Correct</p>
                </Card.Content>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50">
                <Card.Content className="p-4 text-center">
                  <BarChart3 className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.basic.successRate}%
                  </p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </Card.Content>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <Card.Content className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>CTF Information</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {analytics.basic.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Difficulty:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {analytics.basic.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Points:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {analytics.basic.points}
                      </span>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              <Card className="border-0 shadow-lg">
                <Card.Content className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    <span>Performance Metrics</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Completion Rate:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {analytics.performance?.completionRate || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Average Attempts:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {analytics.basic.averageAttempts}
                      </span>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  handleExportCTFSubmissions(ctf._id, ctf.title);
                }}
                variant="outline"
                className="flex items-center space-x-2 border-gray-300"
              >
                <Download className="h-4 w-4" />
                <span>Export Submissions</span>
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-300"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load analytics
            </h3>
            <p className="text-gray-500">Please try again later</p>
          </div>
        )}
      </Modal>
    );
  };

  return (
    <Layout
      title="CTF Command Center"
      subtitle="Manage your cybersecurity challenges"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-12">
        {/* Hero Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              CTF COMMAND CENTER
            </h1>
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your cybersecurity challenges and track performance in
            real-time
          </p>
        </div>
        <Card className="border-0 shadow-xl mb-8 bg-white/80 backdrop-blur-sm">
          <Card.Content className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Mission Control
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Real-time CTF management dashboard
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {/* Bulk Export Button */}
                <div className="relative export-dropdown-container">
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      handleExportCTFs();
                      setBulkExportMenuOpen(false);
                    }}
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">All CTFs Data</span>
                  </Button>

                  {/* {bulkExportMenuOpen && (
                    <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] w-56 backdrop-blur-sm">
                      <button
                        onClick={() => {
                          handleExportCTFs();
                          setBulkExportMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-all duration-200 border-b border-gray-100"
                      >
                        <FileText className="h-4 w-4" />
                        <span>All CTFs Data</span>
                      </button>
                    </div>
                  )} */}
                </div>

                <Button
                  variant="outline"
                  onClick={refreshCTFs}
                  className="flex items-center space-x-2 border-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Data</span>
                </Button>

                <Button
                  onClick={() => setShowModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create CTF</span>
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total CTFs"
            value={stats.total}
            description="All challenges created"
            icon={Trophy}
            color="yellow"
          />
          <StatCard
            title="Active Missions"
            value={stats.active}
            description="Currently running"
            icon={Zap}
            color="green"
          />
          <StatCard
            title="Total Participants"
            value={stats.totalParticipants}
            description="Engaged hackers"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Published"
            value={stats.published}
            description="Live challenges"
            icon={Eye}
            color="purple"
          />
        </div>
        {/* Filters and Search */}
        <Card className="mb-6 border-0 shadow-xl">
          <Card.Content className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search CTFs by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="all">All Status</option>
                  {statuses.slice(1).map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card.Content>
        </Card>
        {/* CTFs Table */}
        <Card className="border-0 shadow-xl">
          <Card.Content className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Challenge Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex justify-center items-center space-x-3">
                          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8"></div>
                          <span className="text-gray-600 font-medium">
                            Loading challenges...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCTFs.length > 0 ? (
                    filteredCTFs.map((ctf) => (
                      <React.Fragment key={ctf._id}>
                        <tr className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group">
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-4">
                              <button
                                onClick={() => toggleRowExpansion(ctf._id)}
                                className="flex-shrink-0 p-2 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-200"
                              >
                                {expandedRows.has(ctf._id) ? (
                                  <ChevronUp className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                )}
                              </button>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                    {ctf.title}
                                  </h3>
                                  {getVisibilityBadge(ctf)}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                  {ctf.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200">
                              {ctf.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getDifficultyBadge(ctf.difficulty)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span className="font-mono font-bold text-gray-900 text-lg">
                                {ctf.points}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(ctf)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-600 font-medium">
                              <Users className="h-4 w-4 mr-2" />
                              {ctf.participants?.length || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end space-x-2">
                              <ActionButton
                                onClick={() => handleViewCTF(ctf)}
                                icon={Eye}
                                color="purple"
                                title="View CTF"
                              />
                              <ActionButton
                                onClick={() => handleViewAnalytics(ctf)}
                                icon={BarChart3}
                                color="blue"
                                title="View Analytics"
                              />
                              <ActionButton
                                onClick={() => openEditModal(ctf)}
                                icon={Edit}
                                color="green"
                                title="Edit CTF"
                              />

                              <RealTimeStatusControls
                                ctf={ctf}
                                onStatusChange={refreshCTFs}
                              />

                              <ExportControls ctf={ctf} />

                              <ActionButton
                                onClick={() => handleDeleteCTF(ctf._id)}
                                icon={Trash2}
                                color="red"
                                title="Delete CTF"
                              />
                            </div>
                          </td>
                        </tr>
                        {expandedRows.has(ctf._id) && (
                          <tr className="bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                            <td colSpan="7" className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <span>Schedule Information</span>
                                  </h4>
                                  <div className="space-y-2 pl-6">
                                    <p className="flex justify-between">
                                      <span className="text-gray-600">
                                        Start:
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {new Date(
                                          ctf.schedule.startDate
                                        ).toLocaleString()}
                                      </span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span className="text-gray-600">
                                        End:
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {new Date(
                                          ctf.schedule.endDate
                                        ).toLocaleString()}
                                      </span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span className="text-gray-600">
                                        Active Hours:
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {ctf.activeHours.startTime} - {ctf.activeHours.endTime} ({ctf.activeHours.timezone || 'Asia/Kolkata'})
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                    <Zap className="h-4 w-4 text-purple-500" />
                                    <span>Quick Actions</span>
                                  </h4>
                                  <div className="flex flex-wrap gap-2 pl-6">
                                    {ctf.ctfLink && (
                                      <button
                                        onClick={() =>
                                          handleCopyLink(ctf.ctfLink)
                                        }
                                        className="inline-flex items-center px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-200"
                                      >
                                        <Copy className="h-3 w-3 mr-1" />
                                        Copy Link
                                      </button>
                                    )}
                                    <button
                                      onClick={() =>
                                        handleToggleActivation(ctf)
                                      }
                                      className="inline-flex items-center px-3 py-1.5 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors border border-orange-200"
                                    >
                                      {ctf.isVisible ? (
                                        <EyeOff className="h-3 w-3 mr-1" />
                                      ) : (
                                        <Eye className="h-3 w-3 mr-1" />
                                      )}
                                      {ctf.isVisible ? "Hide" : "Show"}
                                    </button>
                                    <button
                                      onClick={() => handlePublish(ctf)}
                                      className="inline-flex items-center px-3 py-1.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors border border-purple-200"
                                    >
                                      {ctf.isPublished ? (
                                        <FileText className="h-3 w-3 mr-1" />
                                      ) : (
                                        <Eye className="h-3 w-3 mr-1" />
                                      )}
                                      {ctf.isPublished
                                        ? "Unpublish"
                                        : "Publish"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="text-center">
                          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Challenges Found
                          </h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {searchTerm ||
                            statusFilter !== "all" ||
                            categoryFilter !== "all"
                              ? "Try adjusting your search criteria or filters to find what you're looking for."
                              : "Ready to create your first cybersecurity challenge? Start by creating a new CTF."}
                          </p>
                          <Button
                            onClick={() => setShowModal(true)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:shadow-lg"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First CTF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
        {/* Mobile View */}
        <div className="lg:hidden space-y-4 mt-6">
          {loading ? (
            <Card className="border-0 shadow-lg">
              <Card.Content className="p-6 text-center">
                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading CTFs...</p>
              </Card.Content>
            </Card>
          ) : filteredCTFs.length > 0 ? (
            filteredCTFs.map((ctf) => (
              <Card
                key={ctf._id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Card.Content className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {ctf.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {ctf.description}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMobileMenuOpen(
                            mobileMenuOpen === ctf._id ? null : ctf._id
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>

                      {mobileMenuOpen === ctf._id && (
                        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-48 backdrop-blur-sm bg-white/95">
                          <button
                            onClick={() => {
                              handleViewCTF(ctf);
                              setMobileMenuOpen(null);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded-t-xl transition-all duration-200"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View CTF</span>
                          </button>
                          <button
                            onClick={() => {
                              handleViewAnalytics(ctf);
                              setMobileMenuOpen(null);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-all duration-200"
                          >
                            <BarChart3 className="h-4 w-4" />
                            <span>Analytics</span>
                          </button>
                          <button
                            onClick={() => {
                              openEditModal(ctf);
                              setMobileMenuOpen(null);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-all duration-200"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit CTF</span>
                          </button>
                          <button
                            onClick={() => {
                              handleExportCTFSubmissions(ctf._id, ctf.title);
                              setMobileMenuOpen(null);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-all duration-200"
                          >
                            <Download className="h-4 w-4" />
                            <span>Export Submissions</span>
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteCTF(ctf._id);
                              setMobileMenuOpen(null);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-b-xl transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Category</p>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {ctf.category}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Difficulty</p>
                      {getDifficultyBadge(ctf.difficulty)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Points</p>
                      <div className="flex items-center space-x-1">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        <span className="font-mono font-bold text-gray-900">
                          {ctf.points}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Status</p>
                      {getStatusBadge(ctf)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {ctf.participants?.length || 0} participants
                    </div>
                    <div>{getVisibilityBadge(ctf)}</div>
                  </div>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card className="border-0 shadow-lg">
              <Card.Content className="p-6 text-center">
                <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No CTFs Found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  categoryFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first CTF challenge"}
                </p>
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create CTF
                </Button>
              </Card.Content>
            </Card>
          )}
        </div>
        {/* Modals */}
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editingCTF ? "Edit Challenge" : "Create New Challenge"}
          size="xl"
        >
          <CTFForm
            ctf={editingCTF}
            onSubmit={editingCTF ? handleUpdateCTF : handleCreateCTF}
            onCancel={closeModal}
            loading={actionLoading}
          />
        </Modal>
        {/* View CTF Modal */}
        {viewCTF && (
          <Modal
            isOpen={!!viewCTF}
            onClose={closeViewModal}
            title="Challenge Details"
            size="lg"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title
                  </label>
                  <p className="text-lg text-gray-900 font-medium">
                    {viewCTF.title}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {viewCTF.category}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <p className="text-gray-700 leading-relaxed">
                  {viewCTF.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {viewCTF.points}
                  </p>
                  <p className="text-sm text-gray-600">Points</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {viewCTF.difficulty}
                  </p>
                  <p className="text-sm text-gray-600">Difficulty</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {viewCTF.participants?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Participants</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                  <Activity className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="mt-1">{getStatusBadge(viewCTF)}</div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  onClick={closeViewModal}
                  variant="outline"
                  className="border-gray-300"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    closeViewModal();
                    openEditModal(viewCTF);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 border-0"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Challenge
                </Button>
              </div>
            </div>
          </Modal>
        )}
        {analyticsCTF && (
          <AnalyticsModal ctf={analyticsCTF} onClose={closeAnalyticsModal} />
        )}
      </div>
    </Layout>
  );
};

export default CTFManagement;
