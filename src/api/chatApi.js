import axiosInstance from "./axiosInstance";

export const chatApi = {
  // Search users by full name, email, or userId
  searchUsers: (query, limit = 20) => {
    return axiosInstance.get("/chat/users/search", {
      params: { query, limit },
    });
  },

  // Get or create a 1:1 conversation with another user
  getOrCreateDirectConversation: (otherUserId, page = 1, pageSize = 20) => {
    return axiosInstance.post("/chat/conversations/direct", {
      otherUserId,
      page,
      pageSize,
    });
  },

  // Get all conversations for current user
  getConversations: () => {
    return axiosInstance.get("/chat");
  },

  // Get a specific conversation by ID with messages
  getConversation: (
    conversationId,
    page = 1,
    pageSize = 20,
    beforeMessageId = null
  ) => {
    return axiosInstance.get(`/chat/${conversationId}`, {
      params: { page, pageSize, beforeMessageId },
    });
  },

  // Mark messages as read in a conversation (receiver-only on backend)
  markConversationRead: (conversationId) => {
    return axiosInstance.post(`/chat/conversations/${conversationId}/read`);
  },

  deleteMessageForMe: (conversationId, messageId) => {
    return axiosInstance.post(
      `/chat/conversations/${conversationId}/messages/${messageId}/delete-for-me`
    );
  },

  deleteMessageForEveryone: (conversationId, messageId) => {
    return axiosInstance.post(
      `/chat/conversations/${conversationId}/messages/${messageId}/delete-for-everyone`
    );
  },

  // Send a message via REST API (fallback for SignalR)
  sendMessage: (receiverId, textMessage, conversationId = null) => {
    return axiosInstance.post("/chat", null, {
      params: { receiverId, conversationId, textMessage },
    });
  },
};

export default chatApi;
