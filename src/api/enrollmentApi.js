import axiosInstance from "./axiosInstance";

export const enrollmentApi = {
  // =========================
  // ADMIN ENDPOINTS
  // =========================

  // Get all enrollments with pagination and filtering (Admin)
  // Query: search?, status?, page=1, pageSize=10
  // Route: GET /admin/enrollments
  getAll: (params = {}) => {
    return axiosInstance.get("/admin/enrollments", { params });
  },

  // Get enrollments by student user ID (Admin)
  // Route: GET /admin/students/{studentUserId}/enrollments
  // Note: studentId should be the user's ID (string), not the StudentProfile ID
  getByStudent: (studentUserId) => {
    return axiosInstance.get(`/admin/students/${studentUserId}/enrollments`);
  },

  // Force enroll student in a section (Admin)
  // Route: POST /admin/students/{studentUserId}/force-enroll
  // Request: { sectionId }
  create: (studentUserId, sectionId) => {
    return axiosInstance.post(`/admin/students/${studentUserId}/force-enroll`, {
      sectionId,
    });
  },

  // =========================
  // ENROLLMENT CRUD (Admin/Instructor)
  // =========================

  // Get enrollment by ID
  // Route: GET /enrollment/{id}
  getById: (id) => {
    return axiosInstance.get(`/enrollment/${id}`);
  },

  // Update enrollment (grade, status)
  // Route: PUT /enrollment/{id}
  // Request: { grade?, status?, declineReason? }
  update: (id, enrollmentData) => {
    return axiosInstance.put(`/enrollment/${id}`, enrollmentData);
  },

  // Delete enrollment (Admin only)
  // Route: DELETE /enrollment/{id}
  delete: (id) => {
    return axiosInstance.delete(`/enrollment/${id}`);
  },

  // Drop enrollment
  // Route: POST /enrollment/{id}/drop
  drop: (id) => {
    return axiosInstance.post(`/enrollment/${id}/drop`);
  },

  // Approve enrollment (Admin only)
  // Route: POST /enrollment/{id}/approve
  approve: (id) => {
    return axiosInstance.post(`/enrollment/${id}/approve`);
  },

  // Decline enrollment (Admin only)
  // Route: POST /enrollment/{id}/decline
  // Request: { reason? }
  decline: (id, reason = null) => {
    return axiosInstance.post(`/enrollment/${id}/decline`, { reason });
  },

  // =========================
  // STUDENT CART ENDPOINTS
  // =========================

  // Get current student's enrollments
  // Route: GET /cart/my-enrollments
  getMyEnrollments: () => {
    return axiosInstance.get("/cart/my-enrollments");
  },

  // Add section to cart (Student)
  // Route: POST /cart?scheduleSlotId={scheduleSlotId}
  enrollInCourse: (scheduleSlotId) => {
    return axiosInstance.post(`/cart?scheduleSlotId=${scheduleSlotId}`);
  },

  // Get cart contents (Student)
  // Route: GET /cart
  getCart: () => {
    return axiosInstance.get("/cart");
  },

  // Checkout cart - enroll in all cart items (Student)
  // Route: POST /cart/checkout (or /cart/enroll)
  checkout: () => {
    return axiosInstance.post("/cart/checkout");
  },

  // Remove item from cart (Student)
  // Route: DELETE /cart/{cartItemId}
  removeFromCart: (cartItemId) => {
    return axiosInstance.delete(`/cart/${cartItemId}`);
  },
};

export default enrollmentApi;
