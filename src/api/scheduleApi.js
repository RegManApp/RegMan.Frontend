import axiosInstance from './axiosInstance';

export const scheduleApi = {
  // Get all schedules with filtering
  // Query: courseId?, instructorId?, dayOfWeek?, roomNumber?
  getAll: (params = {}) => {
    return axiosInstance.get('/schedules', { params });
  },

  // Get schedule by ID
  getById: (id) => {
    return axiosInstance.get(`/schedules/${id}`);
  },

  // Get schedules for a student
  getByStudent: (studentId) => {
    return axiosInstance.get(`/schedules/student/${studentId}`);
  },

  // Get schedules for an instructor
  getByInstructor: (instructorId) => {
    return axiosInstance.get(`/schedules/instructor/${instructorId}`);
  },

  // Create new schedule (Admin only)
  // Request: { courseId, instructorId, dayOfWeek, startTime, endTime, roomNumber, semester }
  create: (scheduleData) => {
    return axiosInstance.post('/schedules', scheduleData);
  },

  // Update schedule (Admin only)
  // Request: { id, instructorId?, dayOfWeek?, startTime?, endTime?, roomNumber? }
  update: (id, scheduleData) => {
    return axiosInstance.put(`/schedules/${id}`, { id: Number(id), ...scheduleData });
  },

  // Delete schedule (Admin only)
  delete: (id) => {
    return axiosInstance.delete(`/schedules/${id}`);
  },
};

export default scheduleApi;
