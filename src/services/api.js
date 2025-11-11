import axios from 'axios';

const API_BASE_URL = 'https://techddb.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor with debugging
api.interceptors.request.use(
  (config) => {
    // console.log('🚀 API Request:', {
    //   url: config.url,
    //   method: config.method,
    //   headers: config.headers
    // });

    // For admin routes
    if (config.url.includes('/admin/')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        // console.log('🔐 Added admin token to request');
      } 
    } else {
      // For student routes - check both possible token locations
      const studentToken = localStorage.getItem('token') || localStorage.getItem('userToken');
      if (studentToken) {
        config.headers.Authorization = `Bearer ${studentToken}`;
        // console.log('🔐 Added student token to request');
      } 
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with debugging
api.interceptors.response.use(
  (response) => {
    // console.log('✅ API Response Success:', {
    //   url: response.config.url,
    //   status: response.status,
    //   data: response.data
    // });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      console.log('🔒 401 Unauthorized - Clearing tokens');
      
      // Clear all tokens
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('user');
      
      // // Redirect based on current path
      // if (window.location.pathname.includes('/admin')) {
      //   window.location.href = '/admin/login';
      // } else {
      //   window.location.href = '/login';
      // }
    }
    
    return Promise.reject(error);
  }
);

export default api;