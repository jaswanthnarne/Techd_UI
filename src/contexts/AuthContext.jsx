// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { adminAuth } from '../services/admin';
// import { authAPI } from '../services/auth';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userType, setUserType] = useState(null); // 'admin' or 'student'

//   useEffect(() => {
//     checkAuth();
//   }, []);

// // In the checkAuth function, fix the admin reference:
// const checkAuth = async () => {
//   try {
//     const adminToken = localStorage.getItem('adminToken');
//     const userToken = localStorage.getItem('userToken');
    
//     if (adminToken) {
//       const response = await adminAuth.getProfile();
//       setUser(response.data.admin); // This should be response.data.admin
//       setIsAuthenticated(true);
//       setUserType('admin');
//     } else if (userToken) {
//       const response = await authAPI.getProfile();
//       setUser(response.data.user);
//       setIsAuthenticated(true);
//       setUserType('student');
//     }
//   } catch (error) {
//     console.error('Auth check failed:', error);
//     localStorage.removeItem('adminToken');
//     localStorage.removeItem('userToken');
//     localStorage.removeItem('adminUser');
//     localStorage.removeItem('userData');
//   } finally {
//     setLoading(false);
//   }
// };

//   const adminLogin = async (credentials) => {
//     try {
//       const response = await adminAuth.login(credentials);
//       console.log(response);
//       const { admin, token } = response.data;
      
//       localStorage.setItem('adminToken', token);
//       localStorage.setItem('adminUser', JSON.stringify(admin));
      
//       setUser(admin);
//       setIsAuthenticated(true);
//       setUserType('admin');
      
//       return { success: true, user: admin };
//     } catch (error) {
//       return { 
//         success: false, 
//         error: error.response?.data?.error || 'Login failed' 
//       };
//     }
//   };

//   const studentLogin = async (credentials) => {
//     try {
//       const response = await authAPI.login(credentials);
//       const { user, token } = response.data;
      
//       localStorage.setItem('userToken', token);
//       localStorage.setItem('userData', JSON.stringify(user));
      
//       setUser(user);
//       setIsAuthenticated(true);
//       setUserType('student');
      
//       return { success: true, user };
//     } catch (error) {
//       return { 
//         success: false, 
//         error: error.response?.data?.error || 'Login failed' 
//       };
//     }
//   };

//   const register = async (data) => {
//     try {
//       const response = await authAPI.register(data);
//       const { user, token } = response.data;
      
//       localStorage.setItem('userToken', token);
//       localStorage.setItem('userData', JSON.stringify(user));
      
//       setUser(user);
//       setIsAuthenticated(true);
//       setUserType('student');
      
//       return { success: true, user };
//     } catch (error) {
//       return { 
//         success: false, 
//         error: error.response?.data?.error || 'Registration failed' 
//       };
//     }
//   };

//   const logout = async () => {
//     try {
//       if (userType === 'admin') {
//         await adminAuth.logout();
//         localStorage.removeItem('adminToken');
//         localStorage.removeItem('adminUser');
//       } else {
//         await authAPI.logout();
//         localStorage.removeItem('userToken');
//         localStorage.removeItem('userData');
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       setUser(null);
//       setIsAuthenticated(false);
//       setUserType(null);
//     }
//   };

//   const value = {
//     user,
//     loading,
//     isAuthenticated,
//     userType,
//     adminLogin,
//     studentLogin,
//     register,
//     logout,
//     checkAuth,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

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
  const [userType, setUserType] = useState(null); // 'admin' or 'student'

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const studentToken = localStorage.getItem('token'); // Changed from 'userToken'
      
      console.log('Auth check - Admin token:', !!adminToken, 'Student token:', !!studentToken);
      
      if (adminToken) {
        const response = await adminAuth.getProfile();
        console.log('Admin profile response:', response);
        
        // Handle different possible response structures
        const adminUser = response.data.admin || response.data.user || response.data;
        setUser(adminUser);
        setIsAuthenticated(true);
        setUserType('admin');
      } else if (studentToken) {
        const response = await authAPI.getProfile();
        console.log('Student profile response:', response);
        
        // Handle different possible response structures
        const studentUser = response.data.user || response.data;
        setUser(studentUser);
        setIsAuthenticated(true);
        setUserType('student');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear all auth data on failure
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (credentials) => {
    try {
      const response = await adminAuth.login(credentials);
      console.log('Admin login response:', response);
      
      const { admin, user, token } = response.data;
      const adminUser = admin || user;
      
      if (!token || !adminUser) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      
      setUser(adminUser);
      setIsAuthenticated(true);
      setUserType('admin');
      
      return { success: true, user: adminUser };
    } catch (error) {
      console.error('Admin login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed' 
      };
    }
  };

  const studentLogin = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      console.log('Student login response:', response);
      
      const { user, token } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Use consistent key 'token' for student
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      setUserType('student');
      
      return { success: true, user };
    } catch (error) {
      console.error('Student login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed' 
      };
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      console.log('Registration response:', response);
      
      const { user, token } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Use consistent key 'token' for student
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      setUserType('student');
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      if (userType === 'admin') {
        await adminAuth.logout();
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } else {
        await authAPI.logout();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Clear storage even if logout API fails
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('user');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setUserType(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    userType,
    adminLogin,
    studentLogin,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};