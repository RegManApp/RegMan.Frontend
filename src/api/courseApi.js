import axiosInstance from './axiosInstance';

export const courseApi = {
  // Get all courses with filtering
  // Query: courseName?, creditHours?, courseCode?, courseCategoryId?
  getAll: (params = {}) => {
    return axiosInstance.get('/courses', { params });
  },

  // Get course by ID (detailed)
  getById: (id) => {
    return axiosInstance.get(`/courses/${id}`);
  },

  // Get course summary
  getSummary: (id) => {
    return axiosInstance.get(`/courses/${id}/summary`);
  },

  // Create new course (Admin only)
  // Request: { courseName, courseCode, creditHours, courseCategoryId, description? }
  create: (courseData) => {
    return axiosInstance.post('/courses', courseData);
  },

  // Update course (Admin only)
  // Request: { id, courseName?, courseCode?, creditHours?, courseCategoryId?, description? }
  update: (id, courseData) => {
    return axiosInstance.put(`/courses/${id}`, { id: Number(id), ...courseData });
  },

  // Delete course (Admin only)
  delete: (id) => {
    return axiosInstance.delete(`/courses/${id}`);
  },
};

export default courseApi;
