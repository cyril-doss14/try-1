// frontend/src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:5001',
  withCredentials: true,
});

export const fetchIdeas = () => API.get('/api/feed');

export const submitIdea = (formData, token) =>
  API.post('/api/ideas/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

export const loginUser = (credentials) =>
  API.post('/api/auth/login', credentials);

export const registerUser = (userInfo) =>
  API.post('/api/auth/register', userInfo);

export const likeIdea = (ideaId, token) =>
  API.post('/api/like', { ideaId }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export default API;