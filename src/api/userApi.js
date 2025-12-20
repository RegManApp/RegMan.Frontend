import axiosInstance from "./axiosInstance";

export const userApi = {
  // Get all users with pagination and filtering (Admin only)
  // Route: GET /admin/users
  // Query: email?, role?, pageNumber=1, pageSize=10
  getAll: (params = {}) => {
    return axiosInstance.get("/admin/users", { params });
  },

  // Get user by ID (Admin only)
  // Route: GET /admin/users/{userId}
  // Note: userId is the Identity User.Id (string/GUID)
  getById: (id) => {
    return axiosInstance.get(`/admin/users/${id}`);
  },

  // Get dashboard stats (Admin only)
  // Route: GET /admin/stats
  getStats: () => {
    return axiosInstance.get("/admin/stats");
  },

  // Update user (Admin only)
  // Route: PUT /admin/users/{userId}
  // Request: { fullName?, email?, address? }
  update: (id, userData) => {
    return axiosInstance.put(`/admin/users/${id}`, userData);
  },

  // Delete user (Admin only)
  // Route: DELETE /admin/users/{userId}
  delete: (id) => {
    return axiosInstance.delete(`/admin/users/${id}`);
  },

  // Update user role (Admin only)
  // Route: PUT /admin/users/{userId}/role
  // Request: { newRole: "Admin" | "Student" | "Instructor" }
  updateRole: (id, newRole) => {
    return axiosInstance.put(`/admin/users/${id}/role`, { newRole });
  },

  // Create new user (Admin only)
  // Route: POST /admin/create-user
  // Request: { email, password, fullName, address?, role, title?, degree?, department?, familyContact?, academicPlanId? }
  createUser: (userData) => {
    return axiosInstance.post("/admin/create-user", userData);
  },
};

export default userApi;
