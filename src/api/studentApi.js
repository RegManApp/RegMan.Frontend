import axiosInstance from "./axiosInstance";

export const studentApi = {
  // Get all students with pagination and filtering
  // Query params: firstName?, lastName?, email?, studentLevel?, pageNumber=1, pageSize=10
  getAll: (params = {}) => {
    return axiosInstance.get("/admin/students", { params });
  },

  // Get student by ID
  getById: (id) => {
    return axiosInstance.get(`/admin/students/${id}`);
  },

  // Get current student's profile (for logged-in student)
  getMyProfile: () => {
    return axiosInstance.get("/auth/me");
  },

  // Get student's cart
  getCart: (studentId) => {
    return axiosInstance.get(`/admin/students/${studentId}/cart`);
  },

  // Create new student (Admin only)
  // Request: { email, password, firstName, lastName, phoneNumber?, dateOfBirth, address?, city?, enrollmentDate, studentLevel }
  create: (studentData) => {
    const { firstName, lastName, address, city, ...rest } = studentData;
    return axiosInstance.post("/admin/create-user", {
      ...rest,
      fullName: `${firstName} ${lastName}`.trim(),
      address: address || city || "",
      role: "Student",
    });
  },

  // Update student (Admin only)
  // Request: { id, firstName?, lastName?, phoneNumber?, dateOfBirth?, address?, city?, studentLevel? }
  update: (id, studentData) => {
    return axiosInstance.put(`/admin/students/${id}`, {
      id: Number(id),
      ...studentData,
    });
  },

  // Delete student (Admin only)
  delete: (id) => {
    return axiosInstance.delete(`/admin/students/${id}`);
  },
};

export default studentApi;
