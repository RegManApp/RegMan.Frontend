import axiosInstance from './axiosInstance';

export const studentApi = {
  // Get all students with pagination and filtering
  // Query params: firstName?, lastName?, email?, studentLevel?, pageNumber=1, pageSize=10
  getAll: (params = {}) => {
    return axiosInstance.get('/students', { params });
  },

  // Get student by ID
  getById: (id) => {
    return axiosInstance.get(`/students/${id}`);
  },

  // Create new student (Admin only)
  // Request: { email, password, firstName, lastName, phoneNumber?, dateOfBirth, address?, city?, enrollmentDate, studentLevel }
  create: (studentData) => {
    return axiosInstance.post('/students', studentData);
  },

  // Update student (Admin only)
  // Request: { id, firstName?, lastName?, phoneNumber?, dateOfBirth?, address?, city?, studentLevel? }
  update: (id, studentData) => {
    return axiosInstance.put(`/students/${id}`, { id: Number(id), ...studentData });
  },

  // Delete student (Admin only)
  delete: (id) => {
    return axiosInstance.delete(`/students/${id}`);
  },
};

export default studentApi;
