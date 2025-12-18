import axiosInstance from './axiosInstance';

export const authApi = {
  // Register new user
  register: (userData) => {
    return axiosInstance.post('/auth/register', userData);
  },

  // Login user
  login: (credentials) => {
    return axiosInstance.post('/auth/login', credentials);
  },

  // Logout user
  logout: () => {
    return axiosInstance.post('/auth/logout');
  },

  // Get current user profile
  getCurrentUser: () => {
    return axiosInstance.get('/auth/me');
  },

  // Update profile
  updateProfile: (profileData) => {
    return axiosInstance.put('/auth/profile', profileData);
  },

  // Change password
  changePassword: (passwordData) => {
    return axiosInstance.post('/auth/change-password', passwordData);
  },
};

export default authApi;
