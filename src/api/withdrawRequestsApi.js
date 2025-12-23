import axiosInstance from "./axiosInstance";

export const withdrawRequestsApi = {
  getMyWithdrawRequests: () => {
    return axiosInstance.get("/withdraw-requests/my");
  },
};

export default withdrawRequestsApi;
