import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Flag,
  BarChart3,
  Settings,
  LogOut,
  CheckCircle,
  FileText,
  Menu,
  X,
  Shield,
  Trophy, // Add this import for the leaderboard icon
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = ({ currentPath }) => {
  const { admin, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "CTF Management", href: "/admin/ctfs", icon: Flag },
    { name: "User Management", href: "/admin/users", icon: Users },
    { 
      name: "Leaderboard", 
      href: "/admin/leaderboard", 
      icon: Trophy // Using Trophy icon for leaderboard
    },
    {
      name: "Submission Review",
      href: "/admin/submissions",
      icon: CheckCircle,
    },
    {
      name: "Pending Submissions",
      href: "/admin/submissions/pending",
      icon: FileText,
    },
    {
      name: "Submission Analytics",
      href: "/admin/submission-analytics",
      icon: BarChart3,
    },
    {
      name: "Marked Submissions",
      href: "/admin/marked-submissions",
      icon: Flag,
    },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  // Function to determine if a navigation item is active
  const isActive = (item) => {
    const { href, name } = item;

    // Exact match for specific pages
    if (name === "Pending Submissions") {
      return currentPath === "/admin/submissions/pending";
    }

    if (name === "Submission Review") {
      return (
        currentPath === "/admin/submissions" ||
        (currentPath.startsWith("/admin/submissions/") &&
          currentPath !== "/admin/submissions/pending")
      );
    }

    if (name === "Submission Analytics") {
      return currentPath === "/admin/submission-analytics";
    }

    if (name === "Leaderboard") {
      return currentPath === "/admin/leaderboard";
    }

    // For other items, use exact match or startsWith for nested routes
    return (
      currentPath === href ||
      (href !== "/admin" &&
        currentPath.startsWith(href) &&
        !(
          href === "/admin/submissions" &&
          currentPath === "/admin/submissions/pending"
        ))
    );
  };

  const SidebarContent = () => (
    <>
      {/* Enhanced Logo Section */}
      <div className="flex items-center justify-between h-20 px-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border-b border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
          </div>
          <div className="text-center">
            <span className="text-lg font-black bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
              ADMIN PANEL
            </span>
            <div className="text-xs text-gray-400 font-medium mt-1">
              CONTROL CENTER
            </div>
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={closeMobileSidebar}
          className="lg:hidden p-1 text-gray-300 hover:text-white transition-all duration-300"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Enhanced Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <a
              key={item.name}
              href={item.href}
              onClick={closeMobileSidebar}
              className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                active
                  ? "bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white shadow-lg shadow-purple-500/25 transform scale-105"
                  : "text-gray-300 hover:bg-gray-700/50 hover:text-white hover:shadow-md hover:transform hover:scale-105"
              }`}
            >
              <div
                className={`relative mr-3 transition-transform duration-300 ${
                  active ? "transform scale-110" : "group-hover:scale-110"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    active
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  }`}
                />
                {active && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </div>
              <span className="font-medium">{item.name}</span>

              {active && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </a>
          );
        })}
      </nav>

      {/* Enhanced User Info Section */}
      <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-sm">
        <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
          <div className="relative">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">
                {admin?.fullName?.charAt(0) || "A"}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
          </div>

          <div className="flex-1 min-w-0">
            <div>
              <p className="text-sm font-bold text-white truncate">
                {admin?.fullName || "Admin"}
              </p>
              <p className="text-xs text-gray-300 truncate">
                {admin?.role || "Administrator"}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-400 h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-300 group"
            title="Logout"
          >
            <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800/30 rounded-lg p-2 text-center border border-gray-700/30">
            <div className="text-green-400 font-bold">Admin</div>
            <div className="text-gray-400">Role</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-2 text-center border border-gray-700/30">
            <div className="text-blue-400 font-bold">Full</div>
            <div className="text-gray-400">Access</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-110"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl border-r border-gray-700/50
      `}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;