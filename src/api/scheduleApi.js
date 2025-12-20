import axiosInstance from "./axiosInstance";

export const scheduleApi = {
  // Get all schedule slots
  // Available to: Admin, Instructor, Student
  getAll: (params = {}) => {
    return axiosInstance.get("/scheduleslot", { params });
  },

  // Get schedules by section ID
  // Available to: Admin, Instructor, Student
  // Route: /scheduleslot/section/{sectionId}
  getBySection: (sectionId) => {
    return axiosInstance.get(`/scheduleslot/section/${sectionId}`);
  },

  // Get schedules for an instructor
  // Available to: Admin, Instructor
  // Route: /scheduleslot/instructor/{instructorId}
  getByInstructor: (instructorId) => {
    return axiosInstance.get(`/scheduleslot/instructor/${instructorId}`);
  },

  // Get schedules by room ID
  // Available to: Admin, Instructor, Student
  // Route: /scheduleslot/room/{roomId}
  getByRoom: (roomId) => {
    return axiosInstance.get(`/scheduleslot/room/${roomId}`);
  },

  // Create new schedule slot (Admin only)
  // Request: CreateScheduleSlotDTO (sectionId, instructorId, roomId, timeSlotId, etc.)
  create: (scheduleData) => {
    return axiosInstance.post("/scheduleslot", scheduleData);
  },

  // Delete schedule slot (Admin only)
  delete: (id) => {
    return axiosInstance.delete(`/scheduleslot/${id}`);
  },
};

export default scheduleApi;
