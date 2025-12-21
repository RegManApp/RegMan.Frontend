import axiosInstance from "./axiosInstance";

export const instructorApi = {
  // Get all instructors
  // Route: GET /instructor
  // Available to: Admin, Student, Instructor
  getAll: (params = {}) => {
    return axiosInstance.get("/instructor", { params });
  },

  // Get instructor by InstructorProfile ID
  // Route: GET /instructor/{id}
  // Available to: Admin, Student, Instructor
  // Note: id is InstructorProfile.InstructorId (int)
  getById: (id) => {
    return axiosInstance.get(`/instructor/${id}`);
  },

  // Get instructor schedule by InstructorProfile ID
  // Route: GET /instructor/{id}/schedule
  // Available to: Admin, Instructor
  getSchedule: (id) => {
    return axiosInstance.get(`/instructor/${id}/schedule`);
  },

  // Get my schedule (for logged-in instructor)
  // Route: GET /instructor/my-schedule
  // Available to: Instructor only
  getMySchedule: () => {
    return axiosInstance.get("/instructor/my-schedule");
  },

  // Create new instructor (Admin only)
  // Route: POST /instructor
  // Request: CreateInstructorDTO { email, password, fullName, title?, degree?, department? }
  create: (instructorData) => {
    const { firstName, lastName, ...rest } = instructorData;
    return axiosInstance.post("/instructor", {
      ...rest,
      fullName:
        firstName && lastName
          ? `${firstName} ${lastName}`.trim()
          : rest.fullName,
    });
  },

  // Update instructor (Admin only)
  // Route: PUT /instructor/{id}
  // Request: UpdateInstructorDTO { fullName?, email?, title?, degree?, department?, address? }
  update: (id, instructorData) => {
    const { firstName, lastName, ...rest } = instructorData;
    return axiosInstance.put(`/instructor/${id}`, {
      ...rest,
      fullName:
        firstName && lastName
          ? `${firstName} ${lastName}`.trim()
          : rest.fullName,
    });
  },

  // Delete instructor (Admin only)
  // Route: DELETE /instructor/{id}
  delete: (id) => {
    return axiosInstance.delete(`/instructor/${id}`);
  },
};

export default instructorApi;
