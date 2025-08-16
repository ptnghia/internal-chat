import axios from 'axios';
import { User } from '../store/slices/authSlice';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  // Login
  async login(credentials: { identifier: string; password: string; rememberMe?: boolean }) {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },

  // Register
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
  }) {
    const response = await api.post('/auth/register', userData);
    return response.data.data;
  },

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  // Refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  // Check if user is authenticated
  async checkAuth() {
    try {
      const response = await api.get('/auth/check');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await api.put('/auth/change-password', data);
    return response.data.data;
  },

  // Update profile
  async updateProfile(data: Partial<User>) {
    const response = await api.put('/auth/profile', data);
    return response.data.data;
  },
};

// Export axios instance for other services
export { api };
