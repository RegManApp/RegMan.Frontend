import axiosInstance from "./axiosInstance";

export const studentApi = {
  // Get all students with pagination and filtering (Admin only)
  // Route: GET /admin/students
  // Query params: firstName?, lastName?, email?, studentLevel?, pageNumber=1, pageSize=10
  getAll: (params = {}) => {
    return axiosInstance.get("/admin/students", { params });
  },

  // Get student by StudentProfile ID (Admin only)
  // Route: GET /admin/students/{studentProfileId}
  // Note: This uses StudentProfile.StudentId (int), not User.Id (string)
  getById: (id) => {
    return axiosInstance.get(`/admin/students/${id}`);
  },

  // Get current student's profile (for logged-in student)
  // Route: GET /auth/me
  getMyProfile: () => {
    return axiosInstance.get("/auth/me");
  },

  // Get student's cart (Admin only)
  // Route: GET /admin/students/{studentProfileId}/cart
  getCart: (studentId) => {
    return axiosInstance.get(`/admin/students/${studentId}/cart`);
  },

  // Create new student (Admin only)
  // Route: POST /admin/create-user
  // Request: { email, password, fullName, address?, role: "Student", familyContact?, academicPlanId? }
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
  // Route: PUT /admin/students/{studentProfileId}
  // Request: { fullName?, email?, address?, gpa?, completedCredits?, registeredCredits? }
  update: (id, studentData) => {
    return axiosInstance.put(`/admin/students/${id}`, {
      id: Number(id),
      ...studentData,
    });
  },

  // Delete student (Admin only)
  // Route: DELETE /admin/students/{studentProfileId}
  delete: (id) => {
    return axiosInstance.delete(`/admin/students/${id}`);
  },
};

export default studentApi;
