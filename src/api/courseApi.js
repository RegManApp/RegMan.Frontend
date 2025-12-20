import axiosInstance from "./axiosInstance";

export const courseApi = {
  // Get all courses with filtering and pagination
  // Route: GET /course
  // Query: page=1, pageSize=12, search?, courseName?, creditHours?, courseCode?, courseCategoryId?
  // Response: PaginatedResponse<ViewCourseSummaryDTO>
  getAll: (params = {}) => {
    return axiosInstance.get("/course", { params });
  },

  // Get available courses (alias for getAll)
  getAvailable: (params = {}) => {
    return axiosInstance.get("/course", { params });
  },

  // Get course by ID (detailed view)
  // Route: GET /course/{id}
  // Response: ViewCourseDetailsDTO
  getById: (id) => {
    return axiosInstance.get(`/course/${id}`);
  },

  // Create new course (Admin only)
  // Route: POST /course
  // Request: CreateCourseDTO { courseName, courseCode, creditHours, courseCategory (enum int), description? }
  create: (courseData) => {
    return axiosInstance.post("/course", courseData);
  },

  // Update course (Admin only)
  // Route: PUT /course (note: no {id} in path, courseId in body)
  // Request: UpdateCourseDTO { courseId, courseName?, courseCode?, creditHours?, courseCategory?, description? }
  update: (id, courseData) => {
    return axiosInstance.put("/course", {
      courseId: Number(id),
      ...courseData,
    });
  },

  // Delete course (Admin only)
  // Route: DELETE /course/{id}
  delete: (id) => {
    return axiosInstance.delete(`/course/${id}`);
  },
};

export default courseApi;
