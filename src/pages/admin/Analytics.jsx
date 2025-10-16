import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { analyticsAPI } from '../../services/admin';
import { 
  BarChartComponent, 
  LineChartComponent, 
  PieChartComponent 
} from '../../components/charts/StatsChart';
import { 
  Users, 
  Flag, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Download,
  RefreshCw
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getComprehensiveAnalytics();
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAnalytics();
  };

  if (loading || !analytics) {
    return (
      <Layout title="Analytics" subtitle="Detailed platform insights and statistics">
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  const { users, ctfs, submissions, resources, recentActivity } = analytics;

  return (
    <Layout title="Analytics" subtitle="Detailed platform insights and statistics">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Platform Analytics</h2>
          <p className="text-sm text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" onClick={refreshData} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd className="text-lg font-semibold text-gray-900">{users?.total || 0}</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <Flag className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total CTFs</dt>
                <dd className="text-lg font-semibold text-gray-900">{ctfs?.total || 0}</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                <dd className="text-lg font-semibold text-gray-900">{submissions?.total || 0}</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {submissions?.total > 0 
                    ? `${Math.round((submissions.correctSubmissions / submissions.total) * 100)}%`
                    : '0%'
                  }
                </dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* CTF Status Distribution */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">CTF Status Distribution</h3>
          </Card.Header>
          <Card.Content>
            <PieChartComponent
              data={ctfs?.statusStats || []}
              dataKey="count"
              nameKey="_id"
            />
          </Card.Content>
        </Card>

        {/* Category Performance */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
          </Card.Header>
          <Card.Content>
            <BarChartComponent
              data={submissions?.categoryPerformance || []}
              dataKey="totalSolves"
              nameKey="_id"
            />
          </Card.Content>
        </Card>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">User Role Distribution</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {users?.roleStats?.map((stat) => (
                <div key={stat._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {stat._id === 'admin' ? 'Administrators' : 'Students'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-primary-600">{stat.count}</span>
                    <span className="text-sm text-gray-500">
                      ({Math.round((stat.count / users.total) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Active Today</span>
                <span className="text-lg font-semibold text-green-600">
                  {users?.activityStats?.[0]?.activeToday || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Active This Week</span>
                <span className="text-lg font-semibold text-blue-600">
                  {users?.activityStats?.[0]?.activeThisWeek || 0}
                </span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;