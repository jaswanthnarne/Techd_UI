import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/StudentLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { userAPI } from "../../services/user";
import { authAPI } from "../../services/auth";
import {
  User,
  Mail,
  Phone,
  Award,
  Target,
  Edit,
  Save,
  X,
  Building,
  GraduationCap,
  Badge,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Shield,
  CheckCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      console.log("Fetched profile:", response.data.user);
      setProfile(response.data.user);
      setFormData(response.data.user);
    } catch (error) {
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Remove fields that shouldn't be updated
      const updateData = { ...formData };
      delete updateData.email;
      delete updateData.erpNumber;
      delete updateData.role;
      delete updateData._id;
      delete updateData.username;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.__v;

      await userAPI.updateProfile(updateData);
      setProfile(formData);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Password complexity check
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      toast.error(
        "Password must contain uppercase, lowercase, number, and special character"
      );
      return;
    }

    try {
      setChangingPassword(true);
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const specializations = [
    "Cybersecurity",
    "Artificial Intelligence",
    "Others",
  ];

  const expertiseLevels = [
    "Beginner",
    "Junior",
    "Intermediate",
    "Senior",
    "Expert",
  ];
  const semesters = ["3", "4", "5", "6", "7"];
  const collegeNames = ["PIET", "PIT", "Other"];

  if (loading || !profile) {
    return (
      <Layout title="Profile" subtitle="Your personal information">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 h-8 w-8"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile" subtitle="Your personal information">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{profile.fullName}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      {profile.specialization}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      {profile.collegeName}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      ERP: {profile.erpNumber}
                    </span>
                  </div>
                </div>
              </div>

              {!editing ? (
                <Button
                  onClick={() => setEditing(true)}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    loading={saving}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <Card.Header className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary-600" />
                  <span>Personal Information</span>
                </h3>
              </Card.Header>
              <Card.Content className="p-6 space-y-6">
                {/* Read-only Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Mail className="h-4 w-4 text-primary-600" />
                      <span>Email Address</span>
                    </label>
                    <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium">
                      {profile.email}
                    </div>
                    <p className="text-xs text-gray-500">
                      University email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Badge className="h-4 w-4 text-primary-600" />
                      <span>ERP Number</span>
                    </label>
                    <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-mono font-medium">
                      {profile.erpNumber}
                    </div>
                    <p className="text-xs text-gray-500">
                      ERP number cannot be changed
                    </p>
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <User className="h-4 w-4 text-primary-600" />
                      <span>Full Name *</span>
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium">
                        {profile.fullName}
                      </div>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Phone className="h-4 w-4 text-primary-600" />
                      <span>Contact Number</span>
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your contact number"
                      />
                    ) : (
                      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium">
                        {profile.contactNumber || "Not provided"}
                      </div>
                    )}
                  </div>

                  {/* College Name */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Building className="h-4 w-4 text-primary-600" />
                      <span>College Name *</span>
                    </label>
                    {editing ? (
                      <select
                        name="collegeName"
                        required
                        value={formData.collegeName || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      >
                        {collegeNames.map((college) => (
                          <option key={college} value={college}>
                            {college}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium">
                        {profile.collegeName}
                      </div>
                    )}
                  </div>

                  {/* Semester */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <GraduationCap className="h-4 w-4 text-primary-600" />
                      <span>Semester *</span>
                    </label>
                    {editing ? (
                      <select
                        name="sem"
                        required
                        value={formData.sem || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Semester</option>
                        {semesters.map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium">
                        Semester {profile.sem}
                      </div>
                    )}
                  </div>

                  {/* Specialization */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Award className="h-4 w-4 text-primary-600" />
                      <span>Specialization *</span>
                    </label>
                    {editing ? (
                      <select
                        name="specialization"
                        required
                        value={formData.specialization || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      >
                        {specializations.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium">
                        {profile.specialization}
                      </div>
                    )}
                  </div>

                  {/* Expertise Level */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Target className="h-4 w-4 text-primary-600" />
                      <span>Expertise Level</span>
                    </label>
                    {editing ? (
                      <select
                        name="expertiseLevel"
                        value={formData.expertiseLevel || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      >
                        {expertiseLevels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium">
                        {profile.expertiseLevel}
                      </div>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Right Column - Account & Security */}
          <div className="space-y-6">
            {/* Account Information */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <Card.Header className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary-600" />
                  <span>Account Information</span>
                </h3>
              </Card.Header>
              <Card.Content className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Username
                    </span>
                    <span className="text-sm text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded-lg">
                      {profile.username}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Member Since
                    </span>
                    <span className="text-sm text-gray-900 flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-primary-600" />
                      <span>
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Last Login
                    </span>
                    <span className="text-sm text-gray-900 flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-primary-600" />
                      <span>
                        {profile.lastLogin
                          ? new Date(profile.lastLogin).toLocaleString()
                          : "Never"}
                      </span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Account Status
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        profile.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {profile.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Verification
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        profile.isVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {profile.isVerified ? "Verified" : "Pending"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Role
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {profile.role}
                    </span>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Security Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <Card.Header className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-primary-600" />
                  <span>Security</span>
                </h3>
              </Card.Header>
              <Card.Content className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="bg-primary-50 rounded-2xl p-6 border-2 border-primary-100">
                      <Lock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Password Protection
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Last changed:{" "}
                        {profile.updatedAt
                          ? new Date(profile.updatedAt).toLocaleDateString()
                          : "Never"}
                      </p>
                      <Button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center space-x-2 py-3 rounded-xl"
                      >
                        <Lock className="h-4 w-4" />
                        <span>Change Password</span>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800 text-center">
                      For security reasons, you cannot change your university
                      email or ERP number.
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={closePasswordModal}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                required
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="block w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 pr-12"
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                required
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="block w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 pr-12"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Must be at least 8 characters with uppercase, lowercase, number,
              and special character
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="block w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 pr-12"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={closePasswordModal}
              className="px-6 py-2.5 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={changingPassword}
              className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700"
            >
              Change Password
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Profile;
