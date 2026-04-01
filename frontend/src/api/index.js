import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ──────────────────────────────────────────────
// Auth APIs
// ──────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// ──────────────────────────────────────────────
// Post APIs
// ──────────────────────────────────────────────
export const fetchPosts = (page = 1, sort = 'newest') =>
  API.get(`/posts?page=${page}&limit=10&sort=${sort}`);

export const createPost = (formData) =>
  API.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const likePost = (postId) => API.put(`/posts/${postId}/like`);

export const addComment = (postId, text) =>
  API.post(`/posts/${postId}/comment`, { text });

export const deletePost = (postId) => API.delete(`/posts/${postId}`);

export const deleteComment = (postId, commentId) =>
  API.delete(`/posts/${postId}/comment/${commentId}`);

// ──────────────────────────────────────────────
// User APIs
// ──────────────────────────────────────────────
export const getUserProfile = (username) => API.get(`/users/${username}`);
export const updateProfile = (formData) =>
  API.put('/users/profile/update', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const followUser = (userId) => API.put(`/users/${userId}/follow`);

export default API;
