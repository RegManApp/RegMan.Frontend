import axiosInstance from "./axiosInstance";

export const scheduleApi = {
  // Get all schedules with filtering
  // Query: courseId?, instructorId?, dayOfWeek?, roomNumber?
  getAll: (params = {}) => {
    return axiosInstance.get("/scheduleslot", { params });
  },

  // Get schedule by ID
  getById: (id) => {
    return axiosInstance.get(`/scheduleslot/${id}`);
  },

  // Get schedules for a student
  getByStudent: (studentId) => {
    return axiosInstance.get(`/scheduleslot/student/${studentId}`);
  },

  // Get schedules for an instructor
  getByInstructor: (instructorId) => {
    return axiosInstance.get(`/instructor/${instructorId}/schedule`);
  },

  // Create new schedule (Admin only)
  // Request: { courseId, instructorId, dayOfWeek, startTime, endTime, roomNumber, semester }
  create: (scheduleData) => {
    return axiosInstance.post("/scheduleslot", scheduleData);
  },

  // Update schedule (Admin only)
  // Request: { id, instructorId?, dayOfWeek?, startTime?, endTime?, roomNumber? }
  update: (id, scheduleData) => {
    return axiosInstance.put(`/scheduleslot/${id}`, {
      id: Number(id),
      ...scheduleData,
    });
  },

  // Delete schedule (Admin only)
  delete: (id) => {
    return axiosInstance.delete(`/scheduleslot/${id}`);
  },
};

export default scheduleApi;
