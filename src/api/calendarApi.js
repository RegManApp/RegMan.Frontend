import axiosInstance from "./axiosInstance";

// Helper to format time from ISO string
const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Helper to transform backend events to frontend format
const transformEvents = (backendEvents) => {
  if (!Array.isArray(backendEvents)) return [];

  return backendEvents.map((event) => ({
    ...event,
    // Add date property from start for calendar grid matching
    date: event.start
      ? new Date(event.start).toISOString().split("T")[0]
      : null,
    // Format times for display
    startTime: formatTime(event.start),
    endTime: formatTime(event.end),
    // Map backend properties to frontend expected properties
    location: event.extendedProps?.room || null,
    instructorName: event.extendedProps?.instructorName || null,
    description:
      event.extendedProps?.purpose || event.extendedProps?.courseCode || null,
  }));
};

// Get all calendar events for the current user
export const getCalendarEvents = async (params = {}) => {
  const response = await axiosInstance.get("/calendar/events", { params });
  // Backend returns { events: [], dateRange: {} }
  const events = response.data?.events || response.data || [];
  return transformEvents(events);
};

// Get today's events
export const getTodayEvents = async () => {
  const response = await axiosInstance.get("/calendar/today");
  const events = response.data?.events || response.data || [];
  return transformEvents(events);
};

// Get upcoming events (next 7 days)
export const getUpcomingEvents = async () => {
  const response = await axiosInstance.get("/calendar/upcoming");
  const events = response.data?.events || response.data || [];
  return transformEvents(events);
};

export const calendarApi = {
  getCalendarEvents,
  getTodayEvents,
  getUpcomingEvents,
  getTimeline: async () => {
    const response = await axiosInstance.get("/calendar/timeline");
    return response.data;
  },
};

export default calendarApi;
