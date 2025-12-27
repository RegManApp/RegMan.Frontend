import axiosInstance from "./axiosInstance";

export const chatApi = {
  // Get all conversations for current user
  getConversations: () => {
    return axiosInstance.get("/chat");
  },

  // Get a specific conversation by ID with messages
  getConversation: (conversationId, page = 1, pageSize = 20) => {
    return axiosInstance.get(`/chat/${conversationId}`, {
      params: { page, pageSize },
    });
  },

  // Send a message via REST API (fallback for SignalR)
  sendMessage: (receiverId, textMessage, conversationId = null) => {
    return axiosInstance.post("/chat", null, {
      params: { receiverId, conversationId, textMessage },
    });
  },
};

export default chatApi;
