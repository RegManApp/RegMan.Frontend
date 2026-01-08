import axiosInstance from "./axiosInstance";

export const announcementsApi = {
  getMine: (params) => axiosInstance.get("/announcements/mine", { params }),
  getUnreadCount: () => axiosInstance.get("/announcements/unread-count"),
  markRead: (announcementId) =>
    axiosInstance.post(`/announcements/${announcementId}/read`),
  getScopes: () => axiosInstance.get("/announcements/scopes"),
  create: (payload) => axiosInstance.post("/announcements", payload),
  adminAudit: (params) => axiosInstance.get("/announcements/audit", { params }),
  archive: (announcementId) =>
    axiosInstance.post(`/announcements/${announcementId}/archive`),
};
