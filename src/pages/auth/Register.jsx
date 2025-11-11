import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {RecaptchaWrapper} from "./RecaptchaWrapper";
import {toast} from "react-hot-toast";
import {
  Eye,
  EyeOff,
  UserPlus,
  Shield,
  Mail,
  Star,
  Target,
  Zap,
  Cpu,
  Network,
  GraduationCap,
  Building,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    specialization: "Cybersecurity",
    sem: "",
    erpNumber: "",
    collegeName: "PIET",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [recaptchaError, setRecaptchaError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

// Add these validation functions in your Register component
const validateERPNumber = (erpNumber) => {
  const erpRegex = /^\d+$/;
  return erpRegex.test(erpNumber);
};

const validateContactNumber = (contactNumber) => {
  if (!contactNumber) return true; // Optional field
  const phoneRegex = /^\d+$/;
  return phoneRegex.test(contactNumber);
};
const handleRecaptchaVerify = (token) => {
    setRecaptchaToken(token);
    setRecaptchaError("");
  };

  const handleRecaptchaError = (error) => {
    console.error("reCAPTCHA Error:", error);
    setRecaptchaError("reCAPTCHA verification failed. Please try again.");
    setRecaptchaToken("");
  };
// Update the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  // Check reCAPTCHA
  if (!recaptchaToken) {
    setError("Please complete the reCAPTCHA verification");
    setLoading(false);
    return;
  }

  // Validate required fields
  if (
    !formData.fullName ||
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword ||
    !formData.sem ||
    !formData.erpNumber ||
    !formData.collegeName
  ) {
    setError("All required fields must be filled");
    setLoading(false);
    return;
  }

  // Validate email domain
  if (!formData.email.endsWith("@paruluniversity.ac.in")) {
    setError("Only @paruluniversity.ac.in email addresses are allowed");
    setLoading(false);
    return;
  }

  // Validate ERP number (numbers only)
  if (!validateERPNumber(formData.erpNumber)) {
    setError("ERP Number must contain only numbers");
    setLoading(false);
    return;
  }

  // Validate contact number (numbers only)
  if (formData.contactNumber && !validateContactNumber(formData.contactNumber)) {
    setError("Contact Number must contain only numbers");
    setLoading(false);
    return;
  }

  // Validate password match
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    setLoading(false);
    return;
  }

  // Validate password strength
  if (formData.password.length < 8) {
    setError("Password must be at least 8 characters long");
    setLoading(false);
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/;
  if (!passwordRegex.test(formData.password)) {
    setError("Password must contain uppercase, lowercase, number, and special character");
    setLoading(false);
    return;
  }

  const { confirmPassword, ...submitData } = formData;

  const registrationData = {
    ...submitData,
    recaptchaToken: recaptchaToken,
  };



  try {
    const result = await register(registrationData);
    if (result.success) {
      toast.success("Registration successful! Redirecting to dashboard...");
      navigate("/student");
    } else {
      console.error("Registration failed:", result);
      setError(result.message || result.error || "Registration failed");
    }
  } catch (err) {
    console.error("Registration error:", err);
    
    // ✅ FIX: Handle different types of errors properly
    if (err.response && err.response.data) {
      const errorData = err.response.data;
      // Use the specific errsor message from backend
      setError(errorData.message || errorData.error || "Registration failed");
    } else if (err.message) {
      setError(err.message);
    } else {
      setError("Registration failed. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

// Update the handleChange function with real-time validation
const handleChange = (e) => {
  const { name, value } = e.target;

  // ERP Number validation - only numbers
  if (name === "erpNumber") {
    if (value === "" || /^\d+$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    return;
  }

  // Contact Number validation - only numbers
  if (name === "contactNumber") {
    if (value === "" || /^\d+$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    return;
  }

  // Email handling
  if (name === "email" && value && !value.includes("@")) {
    setFormData({
      ...formData,
      [name]: value,
    });
  } else {
    setFormData({
      ...formData,
      [name]: value,
    });
  }
};

  const specializations = [
    "Cybersecurity",
    "Artificial Intelligence",
    "Others",
  ];

  const semesters = ["3", "4", "5", "6", "7"];

  const collegeNames = ["PIET", "PIT", "Other"];

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
                Join the cybersecurity community and develop your skills through
                real-world challenges and competitions.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    University Verified
                  </h3>
                  <p className="text-xs text-gray-500">
                    Exclusive access for Parul University students
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Real Challenges
                  </h3>
                  <p className="text-xs text-gray-500">
                    Hands-on cybersecurity exercises
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Network className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Live Leaderboard
                  </h3>
                  <p className="text-xs text-gray-500">
                    Compete with fellow students
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-2xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-slate-900 to-gray-800 px-8 py-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Student Registration
                </h2>
                <p className="text-gray-300 text-sm">
                  Create your CTF Platform account
                </p>
              </div>

              <Card.Content className="p-8">
                {/* Domain Notice */}
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3 text-blue-800">
                    <Mail className="h-5 w-5" />
                    <span className="text-sm font-semibold">
                      Only @paruluniversity.ac.in email addresses are allowed
                    </span>
                  </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <div className="rounded-xl bg-gradient-to-r from-red-50 to-orange-50 p-4 border-2 border-red-200">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Shield className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-red-800">
                            Registration Failed
                          </h3>
                          <div className="mt-1 text-sm text-red-700">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        name="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        University Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white"
                          placeholder="username@paruluniversity.ac.in"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Number
                      </label>
                      <input
                        name="contactNumber"
                        type="tel"
                        value={formData.contactNumber}
                        onChange={handleChange}
                          pattern="[0-9]*"
                        inputMode="numeric"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ERP Number *
                      </label>
                      <input
                        name="erpNumber"
                        type="text"
                        required
                        value={formData.erpNumber}
                        onChange={handleChange}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white"
                        placeholder="Enter your ERP Number"
                      />
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        College *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          name="collegeName"
                          required
                          value={formData.collegeName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white appearance-none"
                        >
                          {collegeNames.map((college) => (
                            <option key={college} value={college}>
                              {college}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Semester *
                      </label>
                      <select
                        name="sem"
                        required
                        value={formData.sem}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white"
                      >
                        <option value="">Select Semester</option>
                        {semesters.map((sem) => (
                          <option key={sem} value={sem}>
                            {sem}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Specialization *
                      </label>
                      <select
                        name="specialization"
                        required
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white"
                      >
                        {specializations.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white pr-12"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        8+ chars with uppercase, lowercase, number & special
                        character
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white pr-12"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* reCAPTCHA Component in ui  */}
                  <div className="space-y-2">
                    <RecaptchaWrapper
                      onVerify={handleRecaptchaVerify}
                      onError={handleRecaptchaError}
                      
                    />
                    {recaptchaError && (
                      <div className="text-center">
                        <p className="text-sm text-red-600 bg-red-50 py-2 px-4 rounded-lg border border-red-200">
                          {recaptchaError}
                        </p>
                        <button
                          type="button"
                          onClick={() => window.location.reload()}
                          className="mt-2 text-sm text-primary-600 hover:text-primary-500 font-semibold"
                        >
                          Refresh Page
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
            <Button
  type="submit"
  loading={loading}
  className="w-full py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary-600 to-blue-700 hover:from-primary-700 hover:to-blue-800 text-white transform hover:scale-105"
  disabled={loading}
>
  {loading ? (
    <>Loading...</>
  ) : (
    <>
      <UserPlus className="h-5 w-5 mr-3" />
      Create University Account
    </>
  )}
</Button>

                  {/* Login Link */}
                  <div className="text-center pt-6 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <Link
                        to="/student/login"
                        className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                      >
                        Sign in here
                      </Link>
                    </span>
                  </div>
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

export default Register;
