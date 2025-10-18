// import React, { useState, useEffect } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import Button from "../../components/ui/Button";
// import Card from "../../components/ui/Card";
// import { Lock, ArrowLeft, Eye, EyeOff, Shield } from "lucide-react";
// import toast from "react-hot-toast";
// import { authAPI } from "../../services/auth";

// const ResetPassword = () => {
//   const { token } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     newPassword: "",
//     confirmPassword: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [validToken, setValidToken] = useState(true);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   // Verify token on component mount
//   useEffect(() => {
//     if (!token) {
//       setValidToken(false);
//       toast.error("Invalid reset token");
//     }
//   }, [token]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (formData.newPassword !== formData.confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     if (formData.newPassword.length < 8) {
//       toast.error("Password must be at least 8 characters long");
//       return;
//     }

//     // Password complexity check
//     const passwordRegex =
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/;
//     if (!passwordRegex.test(formData.newPassword)) {
//       toast.error(
//         "Password must contain uppercase, lowercase, number, and special character"
//       );
//       return;
//     }

//     try {
//       setLoading(true);
//       console.log("🔄 Sending reset request with token:", token);

//       const response = await authAPI.resetPassword(token, formData.newPassword);

//       console.log("✅ Reset successful:", response.data);
//       toast.success(
//         "Password reset successfully! You can now login with your new password."
//       );
//       navigate("/login");
//     } catch (error) {
//       console.error("💥 Reset password error:", error);

//       // Handle different error scenarios
//       if (error.response?.status === 400) {
//         const errorMessage =
//           error.response.data.error || "Invalid or expired reset token";
//         toast.error(errorMessage);

//         if (
//           error.response.data.error?.includes("invalid") ||
//           error.response.data.error?.includes("expired")
//         ) {
//           setValidToken(false);
//         }
//       } else if (error.response?.status === 500) {
//         toast.error("Server error. Please try again later.");
//       } else {
//         toast.error(error.response?.data?.error || "Failed to reset password");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!validToken) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8">
//           <div className="text-center">
//             <Shield className="mx-auto h-12 w-12 text-red-600" />
//             <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
//               Invalid Reset Link
//             </h2>
//             <p className="mt-2 text-sm text-gray-600">
//               This password reset link is invalid or has expired.
//             </p>
//           </div>

//           <Card>
//             <Card.Content className="text-center space-y-4">
//               <p className="text-gray-600">
//                 Please request a new password reset link.
//               </p>
//               <div className="space-y-2">
//                 <Link to="/forgot-password" className="block">
//                   <Button className="w-full">Request New Reset Link</Button>
//                 </Link>
//                 <Link to="/login" className="block">
//                   <Button variant="outline" className="w-full">
//                     Back to Login
//                   </Button>
//                 </Link>
//               </div>
//             </Card.Content>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div className="text-center">
//           <div className="flex justify-center">
//             <Shield className="h-12 w-12 text-primary-600" />
//           </div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Set new password
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Enter your new password below.
//           </p>
//         </div>

//         <Card>
//           <Card.Content>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* New Password */}
//               <div>
//                 <label
//                   htmlFor="newPassword"
//                   className="block text-sm font-medium text-gray-700 mb-2"
//                 >
//                   New Password *
//                 </label>
//                 <div className="relative">
//                   <input
//                     id="newPassword"
//                     name="newPassword"
//                     type={showNewPassword ? "text" : "password"}
//                     required
//                     value={formData.newPassword}
//                     onChange={handleChange}
//                     className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 pr-10"
//                     placeholder="Enter new password"
//                   />
//                   <button
//                     type="button"
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     onClick={() => setShowNewPassword(!showNewPassword)}
//                   >
//                     {showNewPassword ? (
//                       <EyeOff className="h-4 w-4" />
//                     ) : (
//                       <Eye className="h-4 w-4" />
//                     )}
//                   </button>
//                 </div>
//                 <p className="mt-1 text-xs text-gray-500">
//                   Must be at least 8 characters with uppercase, lowercase,
//                   number, and special character
//                 </p>
//               </div>

//               {/* Confirm Password */}
//               <div>
//                 <label
//                   htmlFor="confirmPassword"
//                   className="block text-sm font-medium text-gray-700 mb-2"
//                 >
//                   Confirm New Password *
//                 </label>
//                 <div className="relative">
//                   <input
//                     id="confirmPassword"
//                     name="confirmPassword"
//                     type={showConfirmPassword ? "text" : "password"}
//                     required
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 pr-10"
//                     placeholder="Confirm new password"
//                   />
//                   <button
//                     type="button"
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   >
//                     {showConfirmPassword ? (
//                       <EyeOff className="h-4 w-4" />
//                     ) : (
//                       <Eye className="h-4 w-4" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 loading={loading}
//                 className="w-full flex items-center justify-center space-x-2"
//               >
//                 <Lock className="h-4 w-4" />
//                 <span>Reset Password</span>
//               </Button>
//             </form>
//           </Card.Content>
//         </Card>

//         <div className="text-center">
//           <Link
//             to="/login"
//             className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
//           >
//             <ArrowLeft className="h-4 w-4 mr-1" />
//             Back to login
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Cpu,
  Star,
  Target,
  Zap,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../../services/auth";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setValidToken(false);
      toast.error("Invalid reset token");
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Password complexity check
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/;
    if (!passwordRegex.test(formData.newPassword)) {
      toast.error(
        "Password must contain uppercase, lowercase, number, and special character"
      );
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Sending reset request with token:", token);

      const response = await authAPI.resetPassword(token, formData.newPassword);

      console.log("✅ Reset successful:", response.data);
      toast.success(
        "Password reset successfully! You can now login with your new password."
      );
      navigate("/login");
    } catch (error) {
      console.error("💥 Reset password error:", error);

      // Handle different error scenarios
      if (error.response?.status === 400) {
        const errorMessage =
          error.response.data.error || "Invalid or expired reset token";
        toast.error(errorMessage);

        if (
          error.response.data.error?.includes("invalid") ||
          error.response.data.error?.includes("expired")
        ) {
          setValidToken(false);
        }
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(error.response?.data?.error || "Failed to reset password");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding */}
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
                  Secure password recovery for your CTF Platform account. Get
                  back to learning and competing in cybersecurity challenges.
                </p>
              </div>
            </div>

            {/* Right Side - Invalid Token */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-8 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Invalid Reset Link
                  </h2>
                  <p className="text-red-100 text-sm">
                    This password reset link is no longer valid
                  </p>
                </div>

                <Card.Content className="p-8 text-center space-y-6">
                  <div className="text-red-600">
                    <Lock className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-sm font-semibold text-gray-700">
                      This reset link has expired or is invalid. Please request
                      a new one.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Link to="/forgot-password" className="block">
                      <Button className="w-full py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary-600 to-blue-700 hover:from-primary-700 hover:to-blue-800 text-white">
                        Get New Reset Link
                      </Button>
                    </Link>

                    <Link to="/login">
                      <Button
                        variant="outline"
                        className="w-full py-3 rounded-xl border-2 font-semibold hover:bg-gray-50 transition-all duration-300"
                      >
                        Back to login
                      </Button>
                    </Link>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                Create a new secure password for your CTF Platform account.
                Ensure it meets all security requirements.
              </p>
            </div>

            {/* Password Requirements */}
            <div className="space-y-3 max-w-md mx-auto lg:mx-0">
              <h4 className="font-semibold text-gray-900 text-sm">
                Password Requirements:
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <span>At least 8 characters long</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <span>Uppercase and lowercase letters</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <span>At least one number</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <span>At least one special character</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Reset Password Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-slate-900 to-gray-800 px-8 py-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  New Password
                </h2>
                <p className="text-gray-300 text-sm">
                  Create a strong, secure password
                </p>
              </div>

              <Card.Content className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Password Field */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <CheckCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-300 bg-white"
                        placeholder="Confirm new password"
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

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <Button
                      type="submit"
                      loading={loading}
                      className="w-full py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary-600 to-blue-700 hover:from-primary-700 hover:to-blue-800 text-white transform hover:scale-105"
                    >
                      <Zap className="h-5 w-5 mr-3" />
                      Reset Password
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

export default ResetPassword;
