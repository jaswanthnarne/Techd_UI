import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import CTFManagement from "./pages/admin/CTFManagement";
import UserManagement from "./pages/admin/UserManagement";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import AdminSubmissions from "../src/pages/admin/AdminSubmissions";
import PendingSubmissions from "../src/pages/admin/PendingSubmissions";
import SubmissionAnalytics from "../src/pages/admin/SubmissionAnalytics";
import MarkedSubmissions from "../src/pages/admin/MarkedSubmissions";


// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import CTFs from "./pages/student/CTFs";
import CTFSubmission from "./pages/student/CTFSubmission";
import CTFDetail from "./pages/student/CTFDetail";
import Profile from "./pages/student/Profile";
import Leaderboard from "./pages/student/Leaderboard";
import Help from "./pages/student/Help";
import MyScreenshots from "./pages/student/MyScreenShots";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword ";

// Loader
import { PageLoader } from "./components/ui/Loader";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, userType, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return isAuthenticated && userType === "admin" ? (
    children
  ) : (
    <Navigate to="/login" />
  );
};

const StudentRoute = ({ children }) => {
  const { isAuthenticated, userType, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return isAuthenticated && userType === "student" ? (
    children
  ) : (
    <Navigate to="/login" />
  );
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, userType, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return children;
  }

  // Redirect authenticated users to their respective dashboards
  if (userType === "admin") {
    return <Navigate to="/admin" />;
  } else {
    return <Navigate to="/student" />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 1500,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />

          <Routes>
            {/* Unified Login Route */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Student Auth Routes */}
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/ctfs"
              element={
                <AdminRoute>
                  <CTFManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <AdminRoute>
                  <Analytics />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <Settings />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/submissions"
              element={
                <AdminRoute>
                  <AdminSubmissions />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/submissions/pending"
              element={
                <AdminRoute>
                  <PendingSubmissions />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/submission-analytics"
              element={
                <AdminRoute>
                  <SubmissionAnalytics />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/marked-submissions"
              element={
                <AdminRoute>
                  <MarkedSubmissions />
                </AdminRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <StudentRoute>
                  <StudentDashboard />
                </StudentRoute>
              }
            />
            <Route
              path="/student/ctfs"
              element={
                <StudentRoute>
                  <CTFs />
                </StudentRoute>
              }
            />
            <Route
              path="/student/ctf/:id"
              element={
                <StudentRoute>
                  <CTFDetail />
                </StudentRoute>
              }
            />
            <Route
              path="/student/ctf/:id/submit"
              element={
                <StudentRoute>
                  <CTFSubmission />
                </StudentRoute>
              }
            />
            <Route
              path="/student/ctf/:id/leaderboard"
              element={
                <StudentRoute>
                  <Leaderboard />
                </StudentRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <StudentRoute>
                  <Profile />
                </StudentRoute>
              }
            />
             <Route
              path="/student/allscreenshot"
              element={
                <StudentRoute>
                 <MyScreenshots/>
                </StudentRoute>
              }
            />
            <Route
              path="/student/leaderboard"
              element={
                <StudentRoute>
                  <Leaderboard />
                </StudentRoute>
              }
            />
            <Route
              path="/student/help"
              element={
                <StudentRoute>
                  <Help />
                </StudentRoute>
              }
            />

            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
