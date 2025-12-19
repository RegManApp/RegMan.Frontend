import axiosInstance from "./axiosInstance";

export const userApi = {
  // Get all users with pagination and filtering (Admin only)
  // Query: email?, role?, pageNumber=1, pageSize=10
  getAll: (params = {}) => {
    return axiosInstance.get("/admin/users", { params });
  },

  // Get user by ID (Admin only)
  getById: (id) => {
    return axiosInstance.get(`/admin/users/${id}`);
  },

  // Get dashboard stats (Admin only)
  getStats: () => {
    return axiosInstance.get("/admin/stats");
  },

  // Update user (Admin only)
  // Request: { firstName?, lastName?, phoneNumber?, isActive? }
  update: (id, userData) => {
    return axiosInstance.put(`/admin/users/${id}`, userData);
  },

  // Delete user (Admin only)
  delete: (id) => {
    return axiosInstance.delete(`/admin/users/${id}`);
  },

  // Update user role (Admin only)
  // Request: { newRole: "Admin" | "Student" | "Instructor" }
  updateRole: (id, newRole) => {
    return axiosInstance.put(`/admin/users/${id}/role`, { newRole });
  },

  // Create new user (Admin only)
  createUser: (userData) => {
    return axiosInstance.post("/admin/create-user", userData);
  },
};

export default userApi;
