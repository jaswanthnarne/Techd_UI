import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  Eye,
  EyeOff,
  Shield,
  User,
  Lock,
  Star,
  Zap,
  Target,
  GraduationCap,
  Settings,
  Cpu,
  Network,
} from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("student");

  const { adminLogin, studentLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      if (userType === "admin") {
        result = await adminLogin(credentials);
        if (result.success) {
          toast.success("Admin login successful!");
          navigate("/admin");
        } else {
          toast.error(result.error || "Admin login failed");
        }
      } else {
        result = await studentLogin(credentials);
        if (result.success) {
          toast.success("Login successful!");
          navigate("/student");
        } else {
          toast.error("Invalid username or password");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Login error:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Information */}
          <div className="text-center lg:text-left space-y-8">
            {/* Partnership Badge */}
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-blue-200 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  TechDefence Labs
                </span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Parul University
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <div className="bg-gradient-to-br from-primary-600 to-blue-700 p-4 rounded-2xl shadow-2xl">
                  <Cpu className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                    CTF
                    <span className="block text-2xl lg:text-3xl text-primary-600 font-bold mt-2">
                      Platform
                    </span>
                  </h1>
                </div>
              </div>

              <p className="text-xl text-gray-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Advanced cybersecurity training and competition platform powered
                by industry-academia collaboration.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Network className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Real-time Challenges
                </span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Live Leaderboard
                </span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Secure Platform
                </span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Instant Feedback
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-slate-900 to-gray-800 px-8 py-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-300 text-sm">
                  Sign in to access your account
                </p>
              </div>

              <Card.Content className="p-8">
                {/* User Type Selector */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setUserType("student")}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 ${
                      userType === "student"
                        ? "border-primary-500 bg-gradient-to-br from-primary-50 to-blue-50 text-primary-700 shadow-lg"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <GraduationCap
                      className={`h-7 w-7 mb-3 ${
                        userType === "student"
                          ? "text-primary-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="font-semibold text-base">Student</span>
                    <span className="text-xs text-gray-500 mt-1">
                      Platform Access
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserType("admin")}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 ${
                      userType === "admin"
                        ? "border-primary-500 bg-gradient-to-br from-primary-50 to-blue-50 text-primary-700 shadow-lg"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <Settings
                      className={`h-7 w-7 mb-3 ${
                        userType === "admin"
                          ? "text-primary-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="font-semibold text-base">
                      Administrator
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Management
                    </span>
                  </button>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        name="email"
                        type="email"
                        required
                        value={credentials.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white"
                        placeholder="Enter your institutional email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={credentials.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Links */}
                  {userType === "student" && (
                    <div className="flex justify-between text-sm">
                      <Link
                        to="/forgot-password"
                        className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                      >
                        Forgot password?
                      </Link>
                      <Link
                        to="/register"
                        className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                      >
                        Create account
                      </Link>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary-600 to-blue-700 hover:from-primary-700 hover:to-blue-800 text-white transform hover:scale-105"
                  >
                    <Zap className="h-5 w-5 mr-3" />
                    Sign in to CTF Platform
                  </Button>

                  {/* Switch Hint */}
                  {userType === "admin" && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Student access?{" "}
                        <button
                          type="button"
                          onClick={() => setUserType("student")}
                          className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                        >
                          Switch to student login
                        </button>
                      </p>
                    </div>
                  )}
                </form>
              </Card.Content>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            © 2025 CTF Platform. A collaboration between TechDefence Labs and
            Parul University.
            <br />
            All rights reserved. Built for cybersecurity education and
            innovation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
