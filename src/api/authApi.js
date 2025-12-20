import axiosInstance from "./axiosInstance";

export const authApi = {
  // Register new user (public registration - always creates Student)
  // Request: { email, password, fullName, address? }
  register: (userData) => {
    return axiosInstance.post("/auth/register", userData);
  },

  // Login user
  // Request: { email, password }
  // Response: { accessToken, refreshToken, email, fullName, role, userId, instructorTitle? }
  login: (credentials) => {
    return axiosInstance.post("/auth/login", credentials);
  },

  // Logout user - requires refresh token
  // Request: { refreshToken }
  logout: (data) => {
    return axiosInstance.post("/auth/logout", data);
  },

  // Get current user profile with role-specific data
  // Response includes: id, fullName, email, role, address, instructorTitle?, profile (role-specific data)
  getCurrentUser: () => {
    return axiosInstance.get("/auth/me");
  },

  // Change password
  // Request: { currentPassword, newPassword }
  changePassword: (passwordData) => {
    return axiosInstance.post("/auth/change-password", passwordData);
  },

  // Refresh token
  // Request: { refreshToken }
  // Response: { accessToken, refreshToken }
  refreshToken: (refreshToken) => {
    return axiosInstance.post("/auth/refresh", { refreshToken });
  },
};

export default authApi;
