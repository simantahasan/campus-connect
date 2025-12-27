import axios from 'axios';
import { API_URL } from '../config'; // 👈 Import the smart URL from your config

// Create an Axios instance using the dynamic API_URL
const api = axios.create({
  baseURL: `${API_URL}/api`, // This now switches between localhost and IP automatically
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