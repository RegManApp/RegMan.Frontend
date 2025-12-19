import axiosInstance from "./axiosInstance";

// Get all calendar events for the current user
export const getCalendarEvents = async (params = {}) => {
  const response = await axiosInstance.get("/calendar/events", { params });
  return response.data;
};

// Get today's events
export const getTodayEvents = async () => {
  const response = await axiosInstance.get("/calendar/today");
  return response.data;
};

// Get upcoming events (next 7 days)
export const getUpcomingEvents = async () => {
  const response = await axiosInstance.get("/calendar/upcoming");
  return response.data;
};

export const calendarApi = {
  getCalendarEvents,
  getTodayEvents,
  getUpcomingEvents,
};

export default calendarApi;
