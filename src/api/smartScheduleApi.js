import axiosInstance from "./axiosInstance";

export const smartScheduleApi = {
  recommend: (payload) => {
    return axiosInstance.post("/smartschedule/recommend", payload);
  },
};

export default smartScheduleApi;
