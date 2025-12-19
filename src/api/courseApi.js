import axiosInstance from "./axiosInstance";

export const courseApi = {
  // Get all courses with filtering and pagination
  // Query: page?, pageSize?, search?, courseName?, creditHours?, courseCode?, courseCategoryId?
  getAll: (params = {}) => {
    return axiosInstance.get("/course", { params });
  },

  // Get available courses (alias for getAll)
  getAvailable: (params = {}) => {
    return axiosInstance.get("/course", { params });
  },

  // Get course by ID (detailed)
  getById: (id) => {
    return axiosInstance.get(`/course/${id}`);
  },

  // Get course summary
  getSummary: (id) => {
    return axiosInstance.get(`/course/${id}/summary`);
  },

  // Create new course (Admin only)
  // Request: { courseName, courseCode, creditHours, courseCategoryId, description? }
  create: (courseData) => {
    return axiosInstance.post("/course", courseData);
  },

  // Update course (Admin only)
  // Request: { id, courseName?, courseCode?, creditHours?, courseCategoryId?, description? }
  update: (id, courseData) => {
    return axiosInstance.put("/course", { id: Number(id), ...courseData });
  },

  // Delete course (Admin only)
  delete: (id) => {
    return axiosInstance.delete(`/course/${id}`);
  },

  // Get enrolled students for a course
  getEnrolledStudents: (courseId) => {
    return axiosInstance.get(`/course/${courseId}/students`);
  },
};

export default courseApi;
