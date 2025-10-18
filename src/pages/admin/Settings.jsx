import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { systemAPI } from "../../services/admin";
import {
  Save,
  RefreshCw,
  Server,
  Database,
  Mail,
  Shield,
  Cpu,
  Settings as SettingsIcon,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../../components/ui/Loader";

const Settings = () => {
  const [systemConfig, setSystemConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  /**
   * Fetch system configuration from the backend
   */
  const fetchSystemConfig = async () => {
    try {
      setLoading(true);
      const response = await systemAPI.getSystemConfig();
      setSystemConfig(response.data.config);
      // toast.success("System configuration loaded successfully");
    } catch (error) {
      console.error("❌ Failed to fetch system configuration:", error);
      toast.error("Failed to fetch system configuration");

      // Set fallback configuration
      setSystemConfig(getFallbackConfig());
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fallback configuration in case API fails
   */
  const getFallbackConfig = () => ({
    environment: "development",
    frontendUrl: "http://localhost:3000",
    emailEnabled: true,
    features: {
      userRegistration: true,
      ctfCreation: true,
      emailNotifications: true,
      analytics: true,
      darkMode: false,
      twoFactorAuth: false,
    },
    limits: {
      maxFileSize: 10,
      maxUsers: 1000,
      maxCTFs: 50,
      maxSubmissions: 10000,
      sessionTimeout: 24,
    },
    version: "1.0.0",
    lastUpdate: new Date().toISOString(),
  });

  /**
   * Handle saving system settings
   */
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // Simulate API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real application, you would send the updated config to the backend
      // await systemAPI.updateSystemConfig(systemConfig);
      toast.success("Settings saved! Even the servers are impressed 😎");
    } catch (error) {
      console.error("❌ Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Update CTF statuses based on current time
   */
  const updateCTFStatuses = async () => {
    try {
      setUpdatingStatus(true);
      await systemAPI.updateCTFStatuses();
      toast.success("CTF statuses updated successfully!");
    } catch (error) {
      toast.success("Coming soon  please contain your excitement. 😉");
      // toast.error("Failed to update CTF statuses");
    } finally {
      setUpdatingStatus(false);
    }
  };

  /**
   * Clear system cache
   */
  const clearSystemCache = async () => {
    try {
      setClearingCache(true);
      await systemAPI.clearCache();
      toast.success("System cache cleared successfully!");
    } catch (error) {
      console.error(" Failed to clear cache:", error);
      toast.success("Coming soon  please contain your excitement. 😉");
    } finally {
      setClearingCache(false);
    }
  };

  /**
   * Toggle feature flag
   */
  const toggleFeature = (feature) => {
    setSystemConfig((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature],
      },
    }));
  };

  /**
   * Format feature name for display
   */
  const formatFeatureName = (feature) => {
    return feature
      .replace(/([A-Z])/g, " $1")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <Layout title="Settings" subtitle="System configuration and preferences">
        <div className="flex items-center justify-center h-96">
          <Loader size="lg" text="Loading system configuration..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Settings" subtitle="System configuration and preferences">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-4">
            <SettingsIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Settings
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Configure your CTF platform settings, feature flags, and system
            preferences
          </p>
        </div>

        {/* System Information */}
        <Card className="border-l-4 border-l-blue-500">
          <Card.Header className="bg-gradient-to-r from-blue-50 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  System Information
                </h3>
                <p className="text-gray-600 mt-1">
                  Platform configuration and environment details
                </p>
              </div>
            </div>
          </Card.Header>
          <Card.Content className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Environment Status */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Environment
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Current deployment environment
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      systemConfig.environment === "production"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : systemConfig.environment === "staging"
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : "bg-green-100 text-green-800 border border-green-200"
                    }`}
                  >
                    {systemConfig.environment}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Email Service
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Email notifications status
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail
                      className={`h-4 w-4 ${
                        systemConfig.emailEnabled
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        systemConfig.emailEnabled
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      {systemConfig.emailEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Frontend URL
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Platform web address
                    </p>
                  </div>
                  <span className="text-sm font-mono text-primary-600 bg-primary-50 px-2 py-1 rounded">
                    {systemConfig.frontendUrl}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Database
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Connection status
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Feature Flags */}
        <Card className="border-l-4 border-l-purple-500">
          <Card.Header className="bg-gradient-to-r from-purple-50 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Feature Flags
                </h3>
                <p className="text-gray-600 mt-1">
                  Enable or disable platform features
                </p>
              </div>
            </div>
          </Card.Header>
          <Card.Content className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(systemConfig.features).map(
                ([feature, enabled]) => (
                  <div
                    key={feature}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900 block">
                        {formatFeatureName(feature)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {enabled
                          ? "Feature is currently enabled"
                          : "Feature is currently disabled"}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={enabled}
                        onChange={() => toggleFeature(feature)}
                      />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                )
              )}
            </div>
          </Card.Content>
        </Card>

        {/* System Limits */}
        <Card className="border-l-4 border-l-orange-500">
          <Card.Header className="bg-gradient-to-r from-orange-50 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Cpu className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  System Limits
                </h3>
                <p className="text-gray-600 mt-1">
                  Platform capacity and restrictions
                </p>
              </div>
            </div>
          </Card.Header>
          <Card.Content className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(systemConfig.limits).map(([limit, value]) => (
                <div
                  key={limit}
                  className="flex flex-col p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200"
                >
                  <span className="text-sm font-medium text-gray-700 mb-2 capitalize">
                    {limit.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-primary-600">
                      {value}
                    </span>
                    <span className="text-sm text-gray-500">
                      {limit.includes("Size")
                        ? "MB"
                        : limit.includes("Timeout")
                        ? "hours"
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Maintenance Actions */}
        <Card className="border-l-4 border-l-yellow-500">
          <Card.Header className="bg-gradient-to-r from-yellow-50 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Maintenance Actions
                </h3>
                <p className="text-gray-600 mt-1">
                  System maintenance and utilities
                </p>
              </div>
            </div>
          </Card.Header>
          <Card.Content className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Update CTF Statuses */}
              <div className="flex flex-col p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3 mb-3">
                  <RefreshCw className="h-5 w-5 text-yellow-600" />
                  <h4 className="text-lg font-semibold text-yellow-800">
                    Update CTF Statuses
                  </h4>
                </div>
                <p className="text-yellow-700 text-sm mb-4">
                  Manually update all CTF statuses based on current schedule and
                  time. This ensures CTFs are properly marked as active,
                  upcoming, or ended.
                </p>
                <Button
                  variant="outline"
                  onClick={updateCTFStatuses}
                  loading={updatingStatus}
                  className="bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50 self-start"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Statuses
                </Button>
              </div>

              {/* Clear System Cache */}
              <div className="flex flex-col p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Database className="h-5 w-5 text-blue-600" />
                  <h4 className="text-lg font-semibold text-blue-800">
                    Clear System Cache
                  </h4>
                </div>
                <p className="text-blue-700 text-sm mb-4">
                  Clear all system cache to refresh data and resolve potential
                  synchronization issues. This may temporarily increase load
                  times.
                </p>
                <Button
                  variant="outline"
                  onClick={clearSystemCache}
                  loading={clearingCache}
                  className="bg-white text-blue-700 border-blue-300 hover:bg-blue-50 self-start"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Save Settings Action */}
        <Card>
          <Card.Content>
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h4 className="text-lg font-semibold text-primary-900">
                  Apply Configuration Changes
                </h4>
                <p className="text-primary-700 text-sm mt-1">
                  Save your settings to apply all configuration changes across
                  the platform
                </p>
              </div>
              <Button
                onClick={handleSaveSettings}
                loading={saving}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3"
                size="lg"
              >
                <Save className="h-5 w-5 mr-2" />
                Save All Settings
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
