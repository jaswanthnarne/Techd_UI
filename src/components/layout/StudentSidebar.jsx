// import React from "react";
// import {
//   LayoutDashboard,
//   Flag,
//   Trophy,
//   User,
//   LogOut,
//   Award,
//   HelpCircle,
//   Shield,
//   Zap,
// } from "lucide-react";
// import { useAuth } from "../../contexts/AuthContext";
// import { Link, useLocation } from "react-router-dom";

// const navigation = [
//   { name: "Dashboard", href: "/student", icon: LayoutDashboard },
//   { name: "CTF Challenges", href: "/student/ctfs", icon: Flag },
//   { name: "Leaderboard", href: "/student/leaderboard", icon: Trophy },
//   { name: "Profile", href: "/student/profile", icon: User },
//   { name: "Help", href: "/student/help", icon: HelpCircle },
// ];

// const StudentSidebar = () => {
//   const { user, logout } = useAuth();
//   const location = useLocation();

//   return (
//     <div className="flex flex-col w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl border-r border-gray-700/50">
//       {/* Enhanced Logo Section */}
//       <div className="flex items-center justify-center h-20 px-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border-b border-gray-700/50">
//         <div className="flex items-center space-x-3">
//           <div className="relative">
//             <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
//               <Shield className="h-6 w-6 text-white" />
//             </div>
//             <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
//           </div>
//           <div className="text-center">
//             <span className="text-lg font-black bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
//               WAR ROOM
//             </span>
//             <div className="text-xs text-gray-400 font-medium mt-1">
//               COMMAND CENTER
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Enhanced Navigation */}
//       <nav className="flex-1 px-4 py-6 space-y-1">
//         {navigation.map((item) => {
//           const Icon = item.icon;
//           const isActive = location.pathname === item.href;

//           return (
//             <Link
//               key={item.name}
//               to={item.href}
//               className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
//                 isActive
//                   ? "bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white shadow-lg shadow-purple-500/25 transform scale-105"
//                   : "text-gray-300 hover:bg-gray-700/50 hover:text-white hover:shadow-md hover:transform hover:scale-105"
//               }`}
//             >
//               <div
//                 className={`relative mr-3 transition-transform duration-300 ${
//                   isActive ? "transform scale-110" : "group-hover:scale-110"
//                 }`}
//               >
//                 <Icon
//                   className={`h-5 w-5 ${
//                     isActive
//                       ? "text-white"
//                       : "text-gray-400 group-hover:text-white"
//                   }`}
//                 />
//                 {isActive && (
//                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
//                 )}
//               </div>
//               <span className="font-medium">{item.name}</span>

//               {isActive && (
//                 <div className="ml-auto">
//                   <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
//                 </div>
//               )}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Enhanced User Info Section */}
//       <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-sm">
//         <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
//           <div className="relative">
//             <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
//               <span className="text-sm font-bold text-white">
//                 {user?.fullName?.charAt(0) || "S"}
//               </span>
//             </div>
//             <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
//           </div>

//           <div className="flex-1 min-w-0">
//             <Link to="/student/profile">
//               <p className="text-sm font-bold text-white truncate">
//                 {user?.fullName || "Student"}
//               </p>
//             </Link>
//             <p className="text-xs text-gray-300 truncate">
//               {user?.specialization || "Cybersecurity Warrior"}
//             </p>
//             <div className="flex items-center mt-1">
//               <div className="w-full bg-gray-700 rounded-full h-1.5">
//                 <div
//                   className="bg-gradient-to-r from-green-400 to-emerald-400 h-1.5 rounded-full transition-all duration-1000"
//                   style={{ width: "75%" }}
//                 ></div>
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={logout}
//             className="flex-shrink-0 p-2 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-300 group"
//             title="Logout"
//           >
//             <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
//           </button>
//         </div>

//         {/* Quick Stats */}
//         {/* <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
//           <div className="bg-gray-800/30 rounded-lg p-2 text-center border border-gray-700/30">
//             <div className="text-green-400 font-bold">135</div>
//             <div className="text-gray-400">Points</div>
//           </div>
//           <div className="bg-gray-800/30 rounded-lg p-2 text-center border border-gray-700/30">
//             <div className="text-blue-400 font-bold">#24</div>
//             <div className="text-gray-400">Rank</div>
//           </div>
//         </div> */}
//       </div>
//     </div>
//   );
// };

// export default StudentSidebar;

import React, { useState } from "react";
import {
  LayoutDashboard,
  Flag,
  Trophy,
  User,
  LogOut,
  HelpCircle,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "CTF Challenges", href: "/student/ctfs", icon: Flag },
  { name: "Leaderboard", href: "/student/leaderboard", icon: Trophy },
  { name: "Profile", href: "/student/profile", icon: User },
  { name: "Help", href: "/student/help", icon: HelpCircle },
];

const StudentSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
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
              WAR ROOM
            </span>
            <div className="text-xs text-gray-400 font-medium mt-1">
              COMMAND CENTER
            </div>
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={closeMobileSidebar}
          className="lg:hidden p-1 text-gray-300 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Enhanced Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={closeMobileSidebar}
              className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white shadow-lg shadow-purple-500/25 transform scale-105"
                  : "text-gray-300 hover:bg-gray-700/50 hover:text-white hover:shadow-md hover:transform hover:scale-105"
              }`}
            >
              <div
                className={`relative mr-3 transition-transform duration-300 ${
                  isActive ? "transform scale-110" : "group-hover:scale-110"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  }`}
                />
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </div>
              <span className="font-medium">{item.name}</span>

              {isActive && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Enhanced User Info Section */}
      <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-sm">
        <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
          <div className="relative">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">
                {user?.fullName?.charAt(0) || "S"}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
          </div>

          <div className="flex-1 min-w-0">
            <Link to="/student/profile" onClick={closeMobileSidebar}>
              <p className="text-sm font-bold text-white truncate">
                {user?.fullName || "Student"}
              </p>
            </Link>
            <p className="text-xs text-gray-300 truncate">
              {user?.specialization || "Cybersecurity Warrior"}
            </p>
            <div className="flex items-center mt-1">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-400 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: "75%" }}
                ></div>
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
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
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

export default StudentSidebar;
