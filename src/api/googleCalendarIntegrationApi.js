import axiosInstance from "./axiosInstance";

export const getGoogleCalendarIntegrationStatus = async () => {
  const response = await axiosInstance.get(
    "/integrations/google-calendar/status"
  );
  return response.data;
};

export const getGoogleCalendarConnectUrl = async (returnUrl) => {
  const response = await axiosInstance.get(
    "/integrations/google-calendar/connect-url",
    {
      params: {
        returnUrl,
      },
    }
  );
  return response.data?.url;
};

export const googleCalendarIntegrationApi = {
  getStatus: getGoogleCalendarIntegrationStatus,
  getConnectUrl: getGoogleCalendarConnectUrl,
};

export default googleCalendarIntegrationApi;
