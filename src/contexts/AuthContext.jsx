import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuth } from '../services/admin';
import { authAPI } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check all possible token storage locations
      const adminToken = localStorage.getItem('adminToken');
      const studentToken = localStorage.getItem('token');
      const userToken = localStorage.getItem('userToken'); // legacy
      
      // console.log('🔐 Auth Check - Tokens found:', {
      //   adminToken: !!adminToken,
      //   studentToken: !!studentToken,
      //   userToken: !!userToken
      // });

      if (adminToken) {
        // console.log('🛠️ Checking admin authentication...');
        const response = await adminAuth.getProfile();
        // console.log('✅ Admin auth successful:', response.data);
        
        const adminUser = response.data.admin || response.data.user || response.data;
        setUser(adminUser);
        setIsAuthenticated(true);
        setUserType('admin');
        console.log('👤 Admin user set:', adminUser);
      } else if (studentToken || userToken) {
        // Use whichever token exists
        const token = studentToken || userToken;
        // console.log('🛠️ Checking student authentication...');
        
        const response = await authAPI.getProfile();
        // console.log('✅ Student auth successful:', response.data);
        
        const studentUser = response.data.user || response.data;
        setUser(studentUser);
        setIsAuthenticated(true);
        setUserType('student');
        // console.log('👤 Student user set:', studentUser);
      } else {
        // console.log('❌ No authentication tokens found');
        setIsAuthenticated(false);
        setUserType(null);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      console.error('Error details:', error.response?.data);
      
      // Clear invalid tokens
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('user');
      
      setIsAuthenticated(false);
      setUserType(null);
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (credentials) => {
    try {
      // console.log('🛠️ Attempting admin login with:', credentials);
      const response = await adminAuth.login(credentials);
      // console.log('✅ Admin login response:', response);
      
      const { admin, user, token } = response.data;
      const adminUser = admin || user;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // console.log('💾 Storing admin token and user data');
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      
      setUser(adminUser);
      setIsAuthenticated(true);
      setUserType('admin');
      
      // console.log('✅ Admin login successful');
      return { success: true, user: adminUser };
    } catch (error) {
      console.error('❌ Admin login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed' 
      };
    }
  };

  const studentLogin = async (credentials) => {
    try {
      // console.log('🛠️ Attempting student login with:', credentials);
      const response = await authAPI.login(credentials);
      // console.log('✅ Student login response:', response);
      
      const { user, token } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // console.log('💾 Storing student token and user data');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      setUserType('student');
      
      // console.log('✅ Student login successful');
      return { success: true, user };
    } catch (error) {
      console.error('❌ Student login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      // console.log('🛠️ Logging out user type:', userType);
      if (userType === 'admin') {
        await adminAuth.logout();
      } else {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('user');
      
      setUser(null);
      setIsAuthenticated(false);
      setUserType(null);
      // console.log('✅ Logout completed');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    userType,
    adminLogin,
    studentLogin,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};