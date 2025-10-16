import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/StudentLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { userAPI } from '../../services/user';
import { authAPI } from '../../services/auth';
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
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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
      console.log('Fetched profile:', response.data.user);
      setProfile(response.data.user);
      setFormData(response.data.user);
    } catch (error) {
      toast.error('Failed to fetch profile');
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
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // Password complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      toast.error('Password must contain uppercase, lowercase, number, and special character');
      return;
    }

    try {
      setChangingPassword(true);
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const specializations = [
    'Cybersecurity',
    'Artificial Intelligence',
    'Others'
  ];

  const expertiseLevels = ['Beginner', 'Junior', 'Intermediate', 'Senior', 'Expert'];
  const semesters = ['3', '4', '5', '6', '7'];
  const collegeNames = ['PIET', 'PIT', 'Other'];

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
      <div className="max-w-4xl space-y-6">
        {/* Profile Header */}
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
                  <p className="text-gray-600">{profile.specialization} • {profile.collegeName}</p>
                  <p className="text-sm text-gray-500">ERP: {profile.erpNumber}</p>
                </div>
              </div>
              
              {!editing ? (
                <Button 
                  onClick={() => setEditing(true)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleCancel}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button 
                    onClick={handleSave}
                    loading={saving}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address
                </label>
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                  {profile.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">University email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Badge className="h-4 w-4 inline mr-2" />
                  ERP Number
                </label>
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                  {profile.erpNumber}
                </div>
                <p className="text-xs text-gray-500 mt-1">ERP number cannot be changed</p>
              </div>
            </div>

            {/* Editable Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Full Name *
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName || ''}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="text-gray-900">{profile.fullName}</div>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Contact Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber || ''}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your contact number"
                  />
                ) : (
                  <div className="text-gray-900">{profile.contactNumber || 'Not provided'}</div>
                )}
              </div>

              {/* College Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4 inline mr-2" />
                  College Name *
                </label>
                {editing ? (
                  <select
                    name="collegeName"
                    required
                    value={formData.collegeName || ''}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {collegeNames.map(college => (
                      <option key={college} value={college}>{college}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-gray-900">{profile.collegeName}</div>
                )}
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap className="h-4 w-4 inline mr-2" />
                  Semester *
                </label>
                {editing ? (
                  <select
                    name="sem"
                    required
                    value={formData.sem || ''}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(sem => (
                      <option key={sem} value={sem}> {sem}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-gray-900">Semester {profile.sem}</div>
                )}
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Award className="h-4 w-4 inline mr-2" />
                  Specialization *
                </label>
                {editing ? (
                  <select
                    name="specialization"
                    required
                    value={formData.specialization || ''}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-gray-900">{profile.specialization}</div>
                )}
              </div>

              {/* Expertise Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="h-4 w-4 inline mr-2" />
                  Expertise Level
                </label>
                {editing ? (
                  <select
                    name="expertiseLevel"
                    value={formData.expertiseLevel || ''}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {expertiseLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-gray-900">{profile.expertiseLevel}</div>
                )}
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Account Information */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <div className="mt-1 text-sm text-gray-900 font-mono">
                  {profile.username}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <div className="mt-1 text-sm text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Login</label>
                <div className="mt-1 text-sm text-gray-900">
                  {profile.lastLogin 
                    ? new Date(profile.lastLogin).toLocaleString()
                    : 'Never'
                  }
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Security Section */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Password</h4>
                  <p className="text-sm text-gray-600">Last changed: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'Never'}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center space-x-2"
                >
                  <Lock className="h-4 w-4" />
                  <span>Change Password</span>
                </Button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">
                  For security reasons, you cannot change your university email or ERP number. 
                  Contact administration if you need to update these details.
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={closePasswordModal}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                required
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                required
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closePasswordModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={changingPassword}
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