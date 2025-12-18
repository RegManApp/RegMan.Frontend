import axiosInstance from './axiosInstance';

export const enrollmentApi = {
  // Get all enrollments with pagination and filtering
  // Query: studentId?, courseId?, status?, semester?, pageNumber=1, pageSize=10
  getAll: (params = {}) => {
    return axiosInstance.get('/enrollments', { params });
  },

  // Get enrollment by ID
  getById: (id) => {
    return axiosInstance.get(`/enrollments/${id}`);
  },

  // Get enrollments by student ID
  getByStudent: (studentId) => {
    return axiosInstance.get(`/enrollments/student/${studentId}`);
  },

  // Get enrollments by course ID
  getByCourse: (courseId) => {
    return axiosInstance.get(`/enrollments/course/${courseId}`);
  },

  // Create new enrollment
  // Request: { studentId, courseId, semester }
  create: (enrollmentData) => {
    return axiosInstance.post('/enrollments', enrollmentData);
  },

  // Update enrollment (grade, status)
  // Request: { id, grade?, status? }
  update: (id, enrollmentData) => {
    return axiosInstance.put(`/enrollments/${id}`, { id: Number(id), ...enrollmentData });
  },

  // Delete enrollment (Admin only)
  delete: (id) => {
    return axiosInstance.delete(`/enrollments/${id}`);
  },

  // Drop enrollment (Student or Admin)
  drop: (id) => {
    return axiosInstance.post(`/enrollments/${id}/drop`);
  },
};

export default enrollmentApi;
