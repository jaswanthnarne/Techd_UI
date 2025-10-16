import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';

import { 
  Users, 
  Flag, 
  TrendingUp, 
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  LogIn,
  UserCheck,
  Activity,
  Eye,
  EyeOff,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { analyticsAPI, ctfAPI } from '../../services/admin';
import toast from 'react-hot-toast';

// StatCard is your custom component - NOT from lucide-react
const StatCard = ({ title, value, change, icon: Icon, color = 'blue', onClick, clickable = false }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
  };

  const cardClasses = `p-6 ${clickable ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}`;

  return (
    <Card className={cardClasses} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-lg ${colors[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">{value}</div>
                {change && (
                  <div className={`text-sm font-medium ${
                    change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change > 0 ? '+' : ''}{change}% from last week
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
        {clickable && (
          <ArrowRight className="h-5 w-5 text-gray-400" />
        )}
      </div>
    </Card>
  );
};

// Recent Login Card Component
const RecentLoginCard = ({ user, index }) => {
  const getTimeAgo = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      superadmin: 'bg-red-100 text-red-800',
      student: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.user;
  };

  return (
    <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.fullName || 'Unknown User'}
          </p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role)}`}>
            {user?.role || 'user'}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">{user?.email || 'No email'}</p>
        <p className="text-xs text-gray-400 mt-1">
          Last login: {getTimeAgo(user?.lastLogin)}
        </p>
      </div>
      <div className="flex-shrink-0">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user?.isActive)}`}>
          {user?.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};

// Fixed Recent Activity Card Component
const RecentActivityCard = ({ activity, index }) => {
  // Safe type handling with default
  const activityType = activity?.type || 'unknown';
  const isCorrect = activity?.isCorrect || false;

  const getActivityIcon = (type, isCorrect) => {
    if (type === 'submission') {
      return isCorrect ? 
        <CheckCircle className="h-4 w-4 text-green-600" /> : 
        <AlertCircle className="h-4 w-4 text-red-600" />;
    } else if (type === 'ctf_published') {
      return <Eye className="h-4 w-4 text-blue-600" />;
    } else if (type === 'ctf_unpublished') {
      return <EyeOff className="h-4 w-4 text-yellow-600" />;
    } else if (type === 'ctf_activated') {
      return <PlayCircle className="h-4 w-4 text-green-600" />;
    } else if (type === 'ctf_deactivated') {
      return <PauseCircle className="h-4 w-4 text-red-600" />;
    }
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getActivityMessage = (activity) => {
    const type = activity?.type || 'unknown';
    
    if (type === 'submission') {
      return `${activity.user?.fullName || 'Unknown user'} submitted to ${activity.ctf?.title || 'Unknown CTF'}`;
    } else if (type === 'ctf_published') {
      return `CTF "${activity.ctfTitle || 'Unknown CTF'}" was published`;
    } else if (type === 'ctf_unpublished') {
      return `CTF "${activity.ctfTitle || 'Unknown CTF'}" was unpublished`;
    } else if (type === 'ctf_activated') {
      return `CTF "${activity.ctfTitle || 'Unknown CTF'}" was activated`;
    } else if (type === 'ctf_deactivated') {
      return `CTF "${activity.ctfTitle || 'Unknown CTF'}" was deactivated`;
    } else if (type === 'login') {
      return `${activity.user?.fullName || 'Unknown user'} logged in`;
    }
    return 'Unknown activity';
  };

  const getActivityStatus = (type, isCorrect) => {
    if (type === 'submission') {
      return isCorrect ? 'Solved' : 'Failed';
    } else if (type.startsWith('ctf_')) {
      return type.replace('ctf_', '').charAt(0).toUpperCase() + type.replace('ctf_', '').slice(1);
    } else if (type === 'login') {
      return 'Login';
    }
    return 'Activity';
  };

  const getStatusColor = (type, isCorrect) => {
    if (type === 'submission') {
      return isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    } else if (type.startsWith('ctf_')) {
      return 'bg-blue-100 text-blue-800';
    } else if (type === 'login') {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getIconColor = (type, isCorrect) => {
    if (type === 'submission') {
      return isCorrect ? 'bg-green-100' : 'bg-red-100';
    } else if (type.startsWith('ctf_')) {
      return 'bg-blue-100';
    } else if (type === 'login') {
      return 'bg-purple-100';
    }
    return 'bg-gray-100';
  };

  return (
    <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <div className={`p-2 rounded-full ${getIconColor(activityType, isCorrect)}`}>
          {getActivityIcon(activityType, isCorrect)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {getActivityMessage(activity)}
        </p>
        <p className="text-sm text-gray-500">
          {new Date(activity?.timestamp || activity?.submittedAt || Date.now()).toLocaleString()}
        </p>
        {activity?.points && (
          <p className="text-xs text-gray-400">
            {isCorrect ? `+${activity.points} points` : 'No points awarded'}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activityType, isCorrect)}`}>
          {getActivityStatus(activityType, isCorrect)}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentLogins, setRecentLogins] = useState([]);
  const [ctfStatus, setCtfStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [ctfs, setCtfs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, loginsResponse] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        analyticsAPI.getRecentLogins({ limit: 8 })
      ]);
      
      const { stats, recentActivity } = statsResponse.data;
      
      // Ensure recentActivity has proper types
      const safeRecentActivity = Array.isArray(recentActivity) 
        ? recentActivity.map(activity => ({
            ...activity,
            type: activity.type || 'unknown',
            isCorrect: activity.isCorrect || false
          }))
        : [];
      
      setStats(stats || {});
      setRecentActivity(safeRecentActivity);
      setRecentLogins(loginsResponse.data?.recentLogins || []);
      setCtfStatus(stats?.ctfStatusBreakdown || {});
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
      
      // Set safe defaults on error
      setStats({});
      setRecentActivity([]);
      setRecentLogins([]);
      setCtfStatus({});
    } finally {
      setLoading(false);
    }
  };

  const refreshCTFStatus = async () => {
    try {
      const response = await ctfAPI.getAllCTFs();
      const updatedCtfs = response.data.ctfs.map(ctf => ({
        ...ctf,
        currentStatus: ctf.calculateStatus?.(),
        isCurrentlyActive: ctf.isCurrentlyActive?.()
      }));
      setCtfs(updatedCtfs);
    } catch (error) {
      console.error('Failed to refresh CTF status:', error);
    }
  };

  useEffect(() => {
    refreshCTFStatus();
    const interval = setInterval(refreshCTFStatus, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    fetchDashboardData();
  };

  const handleCTFAction = async (ctfId, action) => {
    try {
      if (action === 'activate') {
        await ctfAPI.toggleActivation(ctfId);
        toast.success('CTF activated successfully');
      } else if (action === 'deactivate') {
        await ctfAPI.toggleActivation(ctfId);
        toast.success('CTF deactivated successfully');
      } else if (action === 'publish') {
        await ctfAPI.publishCTF(ctfId);
        toast.success('CTF published successfully');
      } else if (action === 'unpublish') {
        await ctfAPI.unpublishCTF(ctfId);
        toast.success('CTF unpublished successfully');
      }
      fetchDashboardData(); // Refresh to show updated status
    } catch (error) {
      toast.error(`Failed to ${action} CTF`);
    }
  };

  // Navigation handlers
  const handleUsersClick = () => {
    navigate('/admin/users');
  };

  const handleCTFsClick = () => {
    navigate('/admin/ctfs');
  };

  const handleAnalyticsClick = () => {
    navigate('/admin/analytics');
  };

  const handleSubmissionsClick = () => {
    navigate('/admin/submissions');
  };

  if (loading) {
    return (
      <Layout title="Dashboard" subtitle="Overview of your CTF platform">
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  // Enhanced stats with real-time CTF data
  const enhancedStats = {
    totalUsers: stats?.totalUsers || 0,
    totalSubmissions: stats?.totalSubmissions || 0,
    correctSubmissions: stats?.correctSubmissions || 0,
    activeCTFs: ctfStatus.active?.count || 0,
    upcomingCTFs: ctfStatus.upcoming?.count || 0,
    endedCTFs: ctfStatus.ended?.count || 0,
    inactiveCTFs: ctfStatus.inactive?.count || 0,
    newUsersToday: stats?.newUsersToday || 0,
    publishedCTFs: stats?.publishedCTFs || 0,
    activeUsers: stats?.activeUsers || 0,
    visibleCTFs: stats?.visibleCTFs || 0,
  };

  return (
    <Layout title="Dashboard" subtitle="Real-time overview of your CTF platform">
      {/* Action Bar with Auto-refresh */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Platform Overview</h2>
          <p className="text-sm text-gray-600">Real-time statistics and activity</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-600">
              Auto-refresh (30s)
            </label>
          </div>
          <Button onClick={refreshData} variant="outline" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Refresh Now</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={enhancedStats.totalUsers}
          change={12}
          icon={Users}
          color="blue"
          onClick={handleUsersClick}
          clickable={true}
        />
        <StatCard
          title="Active CTFs"
          value={enhancedStats.activeCTFs}
          change={8}
          icon={Flag}
          color="green"
          onClick={handleCTFsClick}
          clickable={true}
        />
        <StatCard
          title="Total Submissions"
          value={enhancedStats.totalSubmissions}
          change={15}
          icon={TrendingUp}
          color="yellow"
          onClick={handleSubmissionsClick}
          clickable={true}
        />
        <StatCard
          title="Success Rate"
          value={`${
            enhancedStats.correctSubmissions && enhancedStats.totalSubmissions 
              ? Math.round((enhancedStats.correctSubmissions / enhancedStats.totalSubmissions) * 100) 
              : 0
          }%`}
          change={5}
          icon={CheckCircle}
          color="green"
          onClick={handleAnalyticsClick}
          clickable={true}
        />
      </div>

      {/* CTF Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-green-500">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Active Now</p>
                <p className="text-2xl font-bold text-green-900">{enhancedStats.activeCTFs}</p>
                <p className="text-xs text-green-600">
                  {ctfs.filter(ctf => ctf.isCurrentlyActive && ctf.status === 'active').length} currently running
                </p>
              </div>
              <PlayCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card.Content>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Upcoming</p>
                <p className="text-2xl font-bold text-blue-900">{enhancedStats.upcomingCTFs}</p>
                <p className="text-xs text-blue-600">Scheduled CTFs</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </Card.Content>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Ended</p>
                <p className="text-2xl font-bold text-gray-900">{enhancedStats.endedCTFs}</p>
                <p className="text-xs text-gray-600">Completed CTFs</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-500" />
            </div>
          </Card.Content>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Inactive</p>
                <p className="text-2xl font-bold text-yellow-900">{enhancedStats.inactiveCTFs}</p>
                <p className="text-xs text-yellow-600">Paused CTFs</p>
              </div>
              <PauseCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                <span className="text-xs text-gray-500">
                  {autoRefresh ? 'Live' : 'Paused'}
                </span>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <RecentActivityCard 
                      key={activity._id || index} 
                      activity={activity} 
                      index={index} 
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No recent activity</p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Right Sidebar - Recent Logins and Platform Health */}
        <div className="space-y-8">
          {/* Recent Login Users */}
          <Card>
            <Card.Header className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Logins</h3>
              </div>
              <Button 
                onClick={() => navigate('/admin/users')}
                variant="ghost" 
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                View All
              </Button>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                {recentLogins.length > 0 ? (
                  recentLogins.map((user, index) => (
                    <RecentLoginCard key={user._id || index} user={user} index={index} />
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <LogIn className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm">No recent logins</p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Enhanced Platform Health */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Platform Health</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">New Users Today</span>
                  <span className="text-lg font-semibold text-primary-600">
                    {enhancedStats.newUsersToday}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Published CTFs</span>
                  <span className="text-lg font-semibold text-green-600">
                    {enhancedStats.publishedCTFs}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Active Users</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {enhancedStats.activeUsers}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Correct Submissions</span>
                  <span className="text-lg font-semibold text-green-600">
                    {enhancedStats.correctSubmissions}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Visible CTFs</span>
                  <span className="text-lg font-semibold text-purple-600">
                    {enhancedStats.visibleCTFs}
                  </span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;