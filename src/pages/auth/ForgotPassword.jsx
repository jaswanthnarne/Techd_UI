import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  Mail,
  ArrowLeft,
  Shield,
  Star,
  Target,
  Zap,
  Cpu,
  Lock,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../../services/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });

      if (response.data && response.data.message) {
        toast.success(
          "If an account with that email exists, password reset instructions have been sent."
        );
        setSubmitted(true);
      } else {
        toast.success("Password reset instructions sent to your email");
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      if (error.response?.status === 400) {
        const errorDetails = error.response.data.details;
        if (errorDetails && errorDetails.length > 0) {
          toast.error(errorDetails[0].msg || "Validation failed");
        } else {
          toast.error(error.response.data.error || "Invalid email format");
        }
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(
          error.response?.data?.error || "Failed to send reset instructions"
        );
      }
    } finally {
      setLoading(false);
    }
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
                Secure password recovery for your CTF Platform account. Get back
                to learning and competing in cybersecurity challenges.
              </p>
            </div>

            {/* Security Features */}
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Secure Recovery
                  </h3>
                  <p className="text-xs text-gray-500">
                    Encrypted password reset process
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    University Verified
                  </h3>
                  <p className="text-xs text-gray-500">
                    Exclusive to Parul University emails
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Quick Process
                  </h3>
                  <p className="text-xs text-gray-500">
                    Reset link expires in 1 hour
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Password Reset Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-slate-900 to-gray-800 px-8 py-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Reset Password
                </h2>
                <p className="text-gray-300 text-sm">
                  Recover access to your CTF account
                </p>
              </div>

              <Card.Content className="p-8">
                {submitted ? (
                  /* Success State */
                  <div className="text-center space-y-6">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg">
                      <Mail className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-black text-gray-900">
                        Check Your Email
                      </h3>
                      <p className="text-sm text-gray-600">
                        We've sent password reset instructions to
                      </p>
                      <p className="text-primary-600 font-semibold text-lg">
                        {email}
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-xs text-blue-700 font-medium">
                        The reset link will expire in 1 hour for security
                        reasons.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Button
                        onClick={() => setSubmitted(false)}
                        variant="outline"
                        className="w-full py-3 rounded-xl border-2 font-semibold hover:bg-gray-50 transition-all duration-300"
                      >
                        Try another email
                      </Button>
                      <Link to="/login" className="block">
                        <Button
                          variant="ghost"
                          className="w-full py-3 rounded-xl font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all duration-300"
                        >
                          Back to login
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Reset Form */
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        University Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          name="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white"
                          placeholder="username@paruluniversity.ac.in"
                        />
                      </div>
                      <p className="text-xs text-blue-600 font-medium">
                        Only Parul University email addresses are accepted
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Button
                        type="submit"
                        loading={loading}
                        className="w-full py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary-600 to-blue-700 hover:from-primary-700 hover:to-blue-800 text-white transform hover:scale-105"
                      >
                        <Send className="h-5 w-5 mr-3" />
                        Send Reset Instructions
                      </Button>

                      <Link to="/login">
                        <Button
                          variant="outline"
                          className="w-full py-3 rounded-xl border-2 font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back to login</span>
                        </Button>
                      </Link>
                    </div>
                  </form>
                )}
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

export default ForgotPassword;
