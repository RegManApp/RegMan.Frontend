import axiosInstance from "./axiosInstance";

const academicPlanApi = {
  // Student: Get own academic progress
  getMyProgress: () => axiosInstance.get("/academicplan/my-progress"),

  // Admin: Get all academic plans
  getAll: (params) => axiosInstance.get("/academicplan", { params }),

  // Admin: Get academic plan by ID
  getById: (id) => axiosInstance.get(`/academicplan/${id}`),

  // Admin: Create academic plan
  create: (data) => axiosInstance.post("/academicplan", data),

  // Admin: Update academic plan
  update: (data) => axiosInstance.put("/academicplan", data),

  // Admin: Delete academic plan
  delete: (id) => axiosInstance.delete(`/academicplan/${id}`),

  // Admin: Get courses in a plan
  getCourses: (planId) => axiosInstance.get(`/academicplan/${planId}/courses`),

  // Admin: Add course to plan
  addCourse: (data) => axiosInstance.post("/academicplan/add-course", data),

  // Admin: Remove course from plan
  removeCourse: (planId, courseId) =>
    axiosInstance.delete(`/academicplan/${planId}/courses/${courseId}`),

  // Admin: Assign plan to student
  assignStudent: (data) =>
    axiosInstance.post("/academicplan/assign-student", data),

  // Admin: Get student progress
  getStudentProgress: (studentUserId) =>
    axiosInstance.get(`/academicplan/student-progress/${studentUserId}`),
};

export default academicPlanApi;
