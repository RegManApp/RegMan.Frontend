import axiosInstance from "./axiosInstance";

// Get all notifications for the current user
export const getNotifications = async (params = {}) => {
  const response = await axiosInstance.get("/Notification", { params });
  // Backend returns a payload object: { notifications, totalCount, unreadCount, ... }
  return response.data?.notifications || [];
};

// Get unread notification count
export const getUnreadCount = async () => {
  const response = await axiosInstance.get("/Notification/unread-count");
  // Backend returns: { count }
  return response.data?.count ?? 0;
};

// Mark a notification as read
export const markAsRead = async (id) => {
  const response = await axiosInstance.post(`/Notification/${id}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await axiosInstance.post("/Notification/read-all");
  return response.data;
};

// Delete a notification
export const deleteNotification = async (id) => {
  const response = await axiosInstance.delete(`/Notification/${id}`);
  return response.data;
};

// Delete all read notifications
export const clearReadNotifications = async () => {
  const response = await axiosInstance.delete("/Notification/clear-read");
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
