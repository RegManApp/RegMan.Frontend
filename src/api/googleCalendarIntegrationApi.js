import axiosInstance from "./axiosInstance";

export const getGoogleCalendarIntegrationStatus = async () => {
  const response = await axiosInstance.get(
    "/integrations/google-calendar/status"
  );
  return response.data;
};

export const googleCalendarIntegrationApi = {
  getStatus: getGoogleCalendarIntegrationStatus,
};

export default googleCalendarIntegrationApi;
