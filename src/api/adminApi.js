import axiosInstance from "./axiosInstance";

export const adminApi = {
  getRegistrationEndDate: () => {
    return axiosInstance.get("/calendar/registration-withdraw-dates");
  },
  getStudentCart: (studentId) => {
    return axiosInstance.get(`/admin/carts/${studentId}`);
  },
  getAcademicCalendarSettings: () => {
    return axiosInstance.get("/admin/academic-calendar-settings");
  },
  setAcademicCalendarSettings: (payload) => {
    return axiosInstance.put("/admin/academic-calendar-settings", payload);
  },
  setRegistrationAndWithdrawDates: (registrationEndDate, withdrawEndDate) => {
    return axiosInstance.post("/admin/registration-end-date", {
      registrationEndDate,
      withdrawEndDate,
    });
  },
  submitMyWithdrawRequest: (enrollmentId, reason) => {
    return axiosInstance.post(`/withdraw-requests`, {
      enrollmentId,
      reason,
    });
  },
  submitWithdrawRequest: (studentId, enrollmentId, reason) => {
    return axiosInstance.post(`/admin/students/${studentId}/withdraw-request`, {
      EnrollmentId: enrollmentId,
      Reason: reason,
    });
  },
  getWithdrawRequests: () => {
    return axiosInstance.get("/admin/withdraw-requests");
  },
  approveWithdrawRequest: (requestId) => {
    return axiosInstance.post(`/admin/withdraw-requests/${requestId}/approve`);
  },
  denyWithdrawRequest: (requestId) => {
    return axiosInstance.post(`/admin/withdraw-requests/${requestId}/deny`);
  },
};

export default adminApi;
