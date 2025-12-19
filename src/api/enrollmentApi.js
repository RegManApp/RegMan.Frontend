import axiosInstance from "./axiosInstance";

export const enrollmentApi = {
  // Get all enrollments with pagination and filtering (Admin)
  // Query: studentId?, courseId?, status?, semester?, pageNumber=1, pageSize=10
  getAll: (params = {}) => {
    return axiosInstance.get("/admin/enrollments", { params });
  },

  // Get enrollment by ID
  getById: (id) => {
    return axiosInstance.get(`/enrollment/${id}`);
  },

  // Get current student's enrollments
  getMyEnrollments: () => {
    return axiosInstance.get("/cart/my-enrollments");
  },

  // Get enrollments by student ID (Admin)
  getByStudent: (studentId) => {
    return axiosInstance.get(`/admin/students/${studentId}/enrollments`);
  },

  // Get enrollments by course ID
  getByCourse: (courseId) => {
    return axiosInstance.get(`/course/${courseId}/enrollments`);
  },

  // Enroll in a course (Student) - through cart
  enrollInCourse: (scheduleSlotId) => {
    return axiosInstance.post(`/cart?scheduleSlotId=${scheduleSlotId}`);
  },

  // Get cart
  getCart: () => {
    return axiosInstance.get("/cart");
  },

  // Checkout cart (enroll in all cart items)
  checkout: () => {
    return axiosInstance.post("/cart/checkout");
  },

  // Remove from cart
  removeFromCart: (cartItemId) => {
    return axiosInstance.delete(`/cart/${cartItemId}`);
  },

  // Create new enrollment (Admin force enroll)
  // Request: { studentId, sectionId }
  create: (studentId, sectionId) => {
    return axiosInstance.post(`/admin/students/${studentId}/force-enroll`, {
      sectionId,
    });
  },

  // Update enrollment (grade, status)
  // Request: { id, grade?, status? }
  update: (id, enrollmentData) => {
    return axiosInstance.put(`/enrollment/${id}`, {
      id: Number(id),
      ...enrollmentData,
    });
  },

  // Delete enrollment (Admin only)
  delete: (id) => {
    return axiosInstance.delete(`/enrollment/${id}`);
  },

  // Drop enrollment (Student or Admin)
  drop: (id) => {
    return axiosInstance.post(`/enrollment/${id}/drop`);
  },
};

export default enrollmentApi;
