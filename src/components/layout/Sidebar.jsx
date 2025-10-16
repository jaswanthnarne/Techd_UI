import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Flag, 
  BarChart3, 
  Settings,
  LogOut,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ currentPath }) => {
  const { admin, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'CTF Management', href: '/admin/ctfs', icon: Flag },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { 
      name: 'Submission Review', 
      href: '/admin/submissions', 
      icon: CheckCircle,
      current: currentPath === '/admin/submissions' || currentPath.startsWith('/admin/submissions/')
    },
    { 
      name: 'Pending Submissions', 
      href: '/admin/submissions/pending', 
      icon: FileText,
      current: currentPath === '/admin/submissions/pending'
    },
    { 
      name: 'Submission Analytics', 
      href: '/admin/submission-analytics', 
      icon: BarChart3,
      current: currentPath === '/admin/submission-analytics'
    },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
        <div className="flex items-center space-x-2">
          <Flag className="h-8 w-8 text-primary-400" />
          <span className="text-xl font-bold">CTF Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = item.current || currentPath === item.href;
          
          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </a>
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
                  {admin?.fullName?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {admin?.fullName}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {admin?.role}
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

export default Sidebar;