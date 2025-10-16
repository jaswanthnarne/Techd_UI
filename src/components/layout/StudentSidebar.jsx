import React from 'react';
import { 
  LayoutDashboard, 
  Flag, 
  Trophy, 
  User,
  LogOut,
  Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { name: 'CTF Challenges', href: '/student/ctfs', icon: Flag },
  { name: 'Leaderboard', href: '/student/leaderboard', icon: Trophy },
  { name: 'Profile', href: '/student/profile', icon: User },
];

const StudentSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
        <div className="flex items-center space-x-2">
          <Award className="h-8 w-8 text-primary-400" />
          <span className="text-xl font-bold">CTF Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.fullName?.charAt(0) || 'S'}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.specialization}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSidebar;