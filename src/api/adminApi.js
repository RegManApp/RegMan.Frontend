import axiosInstance from "./axiosInstance";

export const adminApi = {
  getRegistrationEndDate: () => {
    return axiosInstance.get("/admin/registration-end-date");
  },
  setRegistrationAndWithdrawDates: (registrationEndDate, withdrawEndDate) => {
    return axiosInstance.post("/admin/registration-end-date", {
      registrationEndDate,
      withdrawEndDate,
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
