import axiosInstance from "./axiosInstance";

const transcriptApi = {
  // Student: Get own transcript
  getMyTranscript: () => axiosInstance.get("/transcript/my-transcript"),

  // Admin: Get transcript for a student
  getStudentTranscript: (studentUserId) =>
    axiosInstance.get(`/transcript/student/${studentUserId}`),

  // Admin: Get transcript by id
  getById: (id) => axiosInstance.get(`/transcript/${id}`),

  // Admin: Get transcripts by studentId
  getByStudent: (studentId) =>
    axiosInstance.get(`/transcript/by-student/${studentId}`),

  // Admin: Get transcripts by semester
  getBySemester: (params) =>
    axiosInstance.get("/transcript/by-semester", { params }),

  // Admin: Get all transcripts with filters
  getAll: (params) => axiosInstance.get("/transcript", { params }),

  // Admin: Create transcript
  create: (data) => axiosInstance.post("/transcript", data),

  // Admin: Update transcript
  update: (data) => axiosInstance.put("/transcript", data),

  // Admin: Delete transcript
  delete: (id) => axiosInstance.delete(`/transcript/${id}`),

  // Admin: Recalculate GPA for a student
  recalculateGpa: (studentId) =>
    axiosInstance.post(`/transcript/recalculate-gpa/${studentId}`),
};

export default transcriptApi;
