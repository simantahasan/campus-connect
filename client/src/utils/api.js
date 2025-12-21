import axios from 'axios';

// Create an Axios instance pointing to your running server
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // This connects React to Node
});

// Automatically add the Token to requests if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;