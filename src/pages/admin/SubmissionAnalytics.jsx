import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { submissionAdminAPI, analyticsAPI } from '../../services/admin';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer
} from 'recharts';
import {
  Download,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText
} from 'lucide-react';

const SubmissionAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [statsResponse, submissionsResponse] = await Promise.all([
        submissionAdminAPI.getSubmissionStats(),
        submissionAdminAPI.getAllSubmissions({ limit: 1000 })
      ]);

      setStats({
        ...statsResponse.data,
        recentSubmissions: submissionsResponse.data.submissions
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      // Implementation for exporting data
      toast.success(`Exporting ${type} data...`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  if (loading || !stats) {
    return (
      <Layout title="Submission Analytics" subtitle="Detailed submission insights">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8"></div>
        </div>
      </Layout>
    );
  }

  const statusData = stats.stats?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  })) || [];

  const COLORS = {
    pending: '#F59E0B',
    approved: '#10B981',
    rejected: '#EF4444'
  };

  const statusColors = statusData.map(item => COLORS[item.name.toLowerCase()]);

  return (
    <Layout title="Submission Analytics" subtitle="Detailed submission insights">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Submission Analytics</h2>
          <p className="text-sm text-gray-600">Comprehensive insights into CTF submissions</p>
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
          </select>
          <Button 
            variant="outline"
            onClick={() => handleExport('submissions')}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.total?.totalSubmissions || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.total?.approvedSubmissions || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.total?.pendingSubmissions || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-red-100 text-red-600">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.total?.rejectedSubmissions || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Submission Status Distribution</h3>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
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
              {stats.recentSubmissions?.slice(0, 5).map((submission) => (
                <div key={submission._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                    submission.submissionStatus === 'approved' ? 'bg-green-500' :
                    submission.submissionStatus === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {submission.user?.fullName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {submission.ctf?.title}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      submission.submissionStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      submission.submissionStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {submission.submissionStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>
    </Layout>
  );
};

export default SubmissionAnalytics;