import api from './api';

export const ctfAPI = {
  // Public endpoints
  getPublicCTFs: (params) => api.get('/ctf/ctfs', { params }),
  getCTFDetail: (id) => api.get(`/ctf/ctfs/${id}`),
  getGlobalLeaderboard: (params) => api.get('/ctf/leaderboard/global', { params }),
  
  // Protected endpoints (for both admin and students)
  getCTFChallenges: (id) => api.get(`/ctf/ctfs/${id}/challenges`),
  getCTFLeaderboard: (id) => api.get(`/ctf/ctfs/${id}/leaderboard`),
};