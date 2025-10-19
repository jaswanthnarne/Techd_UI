import api from './api';

// Student CTF endpoints
export const userCTFAPI = {
  getAllCTFs: (params) => api.get('/ctf/ctfs', { params }),
  getCTF: (id) => api.get(`/ctf/ctfs/${id}`),
  joinCTF: (id) => api.post(`/ctf/ctfs/${id}/join`),
  submitFlag: (id, data) => api.post(`/ctf/ctfs/${id}/submit`, data),
  getProgress: (id) => api.get(`/ctf/ctfs/${id}/progress`),
  checkJoined: (id) => api.get(`/ctf/ctfs/${id}/joined`),
  getJoinedCTFs: (params) => api.get('/user/ctfs/joined', { params }),
  getLeaderboard: (id) => api.get(`/ctf/ctfs/${id}/leaderboard`),
  getGlobalLeaderboard: (params) => api.get('/ctf/leaderboard/global', { params }),
  // Get user's submission for a specific CTF - FIXED URL
  getMySubmission: (ctfId) => 
    api.get(`/ctf/ctfs/${ctfId}/my-submission`),
  
  // Get user's submissions
  getMySubmissions: (params = {}) => 
    api.get('/user/my-submissions', { params }),


  // Get all CTFs with user's submissions and screenshots
  getMyCTFsWithSubmissions: (params = {}) =>
    api.get("/ctf/my-ctfs-with-submissions", { params }),

  // Get all submissions with screenshots
  getMyScreenshots: (params = {}) => api.get("/ctf/my-screenshots", { params }),

  // Get submission screenshot details
  getSubmissionScreenshot: (submissionId) =>
    api.get(`/ctf/submissions/${submissionId}/screenshot`),

  // Get all CTFs with progress and submission status
  getMyProgress: (params = {}) => api.get("/ctf/my-progress", { params }),
};

// Student profile and stats
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),
  getDashboard: () => api.get('/user/dashboard'),
  getStats: () => api.get('/user/stats'),
  getRanking: () => api.get('/user/ranking'),
};