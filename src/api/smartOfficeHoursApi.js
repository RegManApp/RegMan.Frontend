import axiosInstance from "./axiosInstance";

export const smartOfficeHoursApi = {
  joinQueue: async (officeHourId, { purpose } = {}) => {
    const res = await axiosInstance.post(
      `/smart-office-hours/${officeHourId}/queue/join`,
      { purpose: purpose || null }
    );
    return res.data;
  },

  getMyStatus: async (officeHourId) => {
    const res = await axiosInstance.get(
      `/smart-office-hours/${officeHourId}/queue/me`
    );
    return res.data;
  },

  getProviderView: async (officeHourId) => {
    const res = await axiosInstance.get(
      `/smart-office-hours/${officeHourId}/provider`
    );
    return res.data;
  },

  callNext: async (officeHourId) => {
    const res = await axiosInstance.post(
      `/smart-office-hours/${officeHourId}/provider/call-next`
    );
    return res.data;
  },

  completeCurrent: async (officeHourId) => {
    const res = await axiosInstance.post(
      `/smart-office-hours/${officeHourId}/provider/complete`
    );
    return res.data;
  },

  noShowCurrent: async (officeHourId) => {
    const res = await axiosInstance.post(
      `/smart-office-hours/${officeHourId}/provider/no-show`
    );
    return res.data;
  },

  scan: async (token) => {
    const res = await axiosInstance.post(`/smart-office-hours/scan`, { token });
    return res.data;
  },
};
