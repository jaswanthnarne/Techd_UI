import api from './api';

export const submissionAPI = {
  // Submit with screenshot - FIXED URL
  submitWithScreenshot: (ctfId, formData) => 
    api.post(`/ctf/ctfs/${ctfId}/submit-with-screenshot`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Edit submission screenshot - FIXED URL
  editSubmissionScreenshot: (submissionId, formData) =>
    api.put(`/ctf/submissions/${submissionId}/screenshot`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Get user's submission for a CTF - FIXED URL
  getMySubmission: (ctfId) => 
    api.get(`/ctf/ctfs/${ctfId}/my-submission`),
};