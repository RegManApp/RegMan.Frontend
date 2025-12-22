import axiosInstance from "./axiosInstance";

export const devToolsApi = {
  seed: async () => {
    const response = await axiosInstance.post("/devtools/seed");
    return response;
  },

  reset: async () => {
    const response = await axiosInstance.post("/devtools/reset");
    return response;
  },

  getUsers: async () => {
    const response = await axiosInstance.get("/devtools/users");
    return response;
  },

  loginAs: async (email) => {
    const response = await axiosInstance.post("/devtools/login-as", { email });
    return response;
  },
};
