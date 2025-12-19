import axiosInstance from "./axiosInstance";

// Get all notifications for the current user
export const getNotifications = async (params = {}) => {
  const response = await axiosInstance.get("/notification", { params });
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async () => {
  const response = await axiosInstance.get("/notification/unread-count");
  return response.data;
};

// Mark a notification as read
export const markAsRead = async (id) => {
  const response = await axiosInstance.post(`/notification/${id}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await axiosInstance.post("/notification/read-all");
  return response.data;
};

// Delete a notification
export const deleteNotification = async (id) => {
  const response = await axiosInstance.delete(`/notification/${id}`);
  return response.data;
};

// Delete all read notifications
export const clearReadNotifications = async () => {
  const response = await axiosInstance.delete("/notification/clear-read");
  return response.data;
};

export const notificationApi = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
};

export default notificationApi;
