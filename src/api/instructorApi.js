import axiosInstance from "./axiosInstance";

export const instructorApi = {
  // Get all instructors with pagination and filtering
  // Query: firstName?, lastName?, email?, departmentId?, pageNumber=1, pageSize=10
  getAll: (params = {}) => {
    return axiosInstance.get("/instructor", { params });
  },

  // Get instructor by ID
  getById: (id) => {
    return axiosInstance.get(`/instructor/${id}`);
  },

  // Get instructor schedule
  getSchedule: (id) => {
    return axiosInstance.get(`/instructor/${id}/schedule`);
  },

  // Create new instructor (Admin only)
  // Request: { email, password, firstName, lastName, title }
  create: (instructorData) => {
    const { firstName, lastName, ...rest } = instructorData;
    return axiosInstance.post("/instructor", {
      ...rest,
      fullName: `${firstName} ${lastName}`.trim(),
    });
  },

  // Update instructor (Admin only)
  // Request: { id, firstName?, lastName?, phoneNumber?, dateOfBirth?, address?, city?, hireDate?, departmentId? }
  update: (id, instructorData) => {
    return axiosInstance.put(`/instructor/${id}`, {
      id: Number(id),
      ...instructorData,
    });
  },

  // Delete instructor (Admin only)
  delete: (id) => {
    return axiosInstance.delete(`/instructor/${id}`);
  },
};

export default instructorApi;
