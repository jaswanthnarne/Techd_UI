import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Eye, EyeOff, Shield, User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('student'); // Default to student

  const { adminLogin, studentLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      if (userType === 'admin') {
        result = await adminLogin(credentials);
        if (result.success) {
          toast.success('Admin login successful!');
          navigate('/admin');
        } else {
          toast.error(result.error || 'Admin login failed');
        }
      } else {
        result = await studentLogin(credentials);
        if (result.success) {
          toast.success('Login successful!');
          navigate('/student');
        } else {
          toast.error(result.error || 'Login failed');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-3 rounded-xl shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">CTF</h1>
              <p className="text-sm text-gray-600 font-medium">Capture The Flag Platform</p>
            </div>
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access the CTF platform as student or administrator
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-6 py-8 sm:px-10 shadow-xl border-0">
          {/* User Type Selector */}
          <div className="flex space-x-4 mb-6">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border transition-all ${
                userType === 'student'
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="h-5 w-5 mr-2" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border transition-all ${
                userType === 'admin'
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Lock className="h-5 w-5 mr-2" />
              Admin
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm pr-10 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {userType === 'student' && (
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="text-sm">
                  <Link
                    to="/register"
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Create account
                  </Link>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                loading={loading}
                className="w-full py-3 text-base font-medium rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                size="lg"
              >
                Sign in as {userType === 'admin' ? 'Administrator' : 'Student'}
              </Button>
            </div>

            {userType === 'admin' && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Student access?{' '}
                  <button
                    type="button"
                    onClick={() => setUserType('student')}
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Switch to student login
                  </button>
                </p>
              </div>
            )}
          </form>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2024 CTF Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;