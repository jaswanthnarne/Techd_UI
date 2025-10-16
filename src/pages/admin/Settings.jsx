import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { systemAPI } from '../../services/admin';
import { 
  Save,
  RefreshCw,
  Server,
  Database,
  Mail,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [systemConfig, setSystemConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      setLoading(true);
      const response = await systemAPI.getSystemConfig();
      setSystemConfig(response.data.config);
    } catch (error) {
      toast.error('Failed to fetch system configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // Here you would typically send the updated config to the backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateCTFStatuses = async () => {
    try {
      await systemAPI.updateCTFStatuses();
      toast.success('CTF statuses updated successfully');
    } catch (error) {
      toast.error('Failed to update CTF statuses');
    }
  };

  if (loading || !systemConfig) {
    return (
      <Layout title="Settings" subtitle="System configuration and preferences">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 h-8 w-8"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Settings" subtitle="System configuration and preferences">
      <div className="max-w-4xl space-y-6">
        {/* System Information */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Server className="h-5 w-5 mr-2 text-gray-500" />
              System Information
            </h3>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Environment</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    systemConfig.environment === 'production' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {systemConfig.environment}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Frontend URL</label>
                <div className="mt-1 text-sm text-gray-900">{systemConfig.frontendUrl}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Service</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    systemConfig.emailEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {systemConfig.emailEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Database Status</label>
                <div className="mt-1 flex items-center">
                  <Database className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-green-700">Connected</span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Feature Flags */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-gray-500" />
              Feature Flags
            </h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {Object.entries(systemConfig.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {enabled ? 'Feature is enabled' : 'Feature is disabled'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={enabled}
                      readOnly
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* System Limits */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">System Limits</h3>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(systemConfig.limits).map(([limit, value]) => (
                <div key={limit} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {limit.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-semibold text-primary-600">{value}</span>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Maintenance Actions */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Maintenance</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Update CTF Statuses</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Manually update all CTF statuses based on current time
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={updateCTFStatuses}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Update Now</span>
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Clear Cache</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Clear system cache and refresh data
                  </p>
                </div>
                <Button variant="outline">Clear Cache</Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings}
            loading={saving}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;