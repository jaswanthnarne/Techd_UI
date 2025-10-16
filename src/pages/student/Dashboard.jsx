import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { userAPI, userCTFAPI } from '../../services/user';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock,
  Flag,
  Users,
  Award,
  Calendar,
  BarChart3 // Add this import
} from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [activeCTFs, setActiveCTFs] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, ctfsResponse, submissionsResponse] = await Promise.all([
        userAPI.getDashboard(),
        userCTFAPI.getJoinedCTFs({ status: 'active', limit: 3 }),
        userCTFAPI.getMySubmissions({ limit: 5 })
      ]);
      
      setDashboardData(dashboardResponse.data);
      setActiveCTFs(ctfsResponse.data.ctfs || []);
      setRecentSubmissions(submissionsResponse.data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      purple: 'text-purple-600 bg-purple-100',
    };

    return (
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
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
      </Card>
    );
  };

  if (loading || !dashboardData) {
    return (
      <StudentLayout title="Dashboard" subtitle="Your CTF journey overview">
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      </StudentLayout>
    );
  }

  const { user, stats } = dashboardData;

  return (
    <StudentLayout title="Dashboard" subtitle="Your CTF journey overview">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-gray-600 mt-2">
              Continue your cybersecurity learning journey with these active challenges.
            </p>
          </div>
          <Link to="/student/leaderboard" className="mt-4 sm:mt-0">
            <Button variant="outline" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>View Leaderboard</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Points"
          value={stats.submissions?.totalPoints || 0}
          change={8}
          icon={Trophy}
          color="yellow"
        />
        <StatCard
          title="CTFs Joined"
          value={stats.ctfs?.totalJoined || 0}
          change={12}
          icon={Flag}
          color="blue"
        />
        <StatCard
          title="Challenges Solved"
          value={stats.ctfs?.solvedCTFs || 0}
          change={15}
          icon={Target}
          color="green"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.accuracy || 0}%`}
          change={5}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active CTFs */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Active CTFs</h3>
              <Link to="/student/ctfs">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {activeCTFs.length > 0 ? (
                activeCTFs.map((ctf) => (
                  <div key={ctf._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{ctf.title}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {ctf.activeHours?.startTime} - {ctf.activeHours?.endTime}
                        </span>
                        <span className="font-mono text-primary-600">{ctf.points} pts</span>
                      </div>
                    </div>
                    <Link to={`/student/ctf/${ctf._id}`}>
                      <Button size="sm">Continue</Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Flag className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No active CTFs</p>
                  <Link to="/student/ctfs">
                    <Button variant="outline" className="mt-4">Browse CTFs</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((submission) => (
                  <div key={submission._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                      submission.isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Submitted to {submission.ctf?.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        submission.isCorrect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {submission.isCorrect ? `+${submission.points}` : 'Failed'}
                      </span>
                    </div>
                  </div>
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

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.ctfs?.solvedCTFs || 0}</div>
          <div className="text-sm text-gray-500">CTFs Solved</div>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.submissions?.correctSubmissions || 0}</div>
          <div className="text-sm text-gray-500">Correct Submissions</div>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.accuracy || 0}%</div>
          <div className="text-sm text-gray-500">Accuracy Rate</div>
        </Card>
      </div>

      {/* Upcoming CTFs */}
      <Card className="mt-8">
        <Card.Header>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming CTFs</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">No upcoming CTFs scheduled</p>
            <p className="text-sm mt-1">Check back later for new challenges!</p>
          </div>
        </Card.Content>
      </Card>
    </StudentLayout>
  );
};

export default StudentDashboard;