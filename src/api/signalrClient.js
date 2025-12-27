import * as signalR from "@microsoft/signalr";

let connection = null;
let connectionRefCount = 0;
let startingPromise = null;

const getToken = () => {
  return (
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
};

export async function startConnection() {
  connectionRefCount += 1;

  if (connection && connection.state === signalR.HubConnectionState.Connected)
    return connection;

  if (startingPromise) {
    return startingPromise;
  }

  // If VITE_API_BASE_URL includes '/api', strip it so hub path becomes '/hubs/chat'
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "")
    .replace(/\/$/, "")
    .replace(/\/api\/?$/i, "");

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${apiBase}/hubs/chat`, {
      accessTokenFactory: () => getToken() || "",
    })
    .configureLogging(signalR.LogLevel.Warning)
    .withAutomaticReconnect()
    .build();

  startingPromise = connection
    .start()
    .then(() => connection)
    .finally(() => {
      startingPromise = null;
    });

  return startingPromise;
}

export function onReceiveMessage(handler) {
  if (!connection) return;
  connection.on("ReceiveMessage", handler);
}

export function offReceiveMessage(handler) {
  if (!connection) return;
  connection.off("ReceiveMessage", handler);
}

export function onMessageRead(handler) {
  if (!connection) return;
  connection.on("MessageRead", handler);
}

export function offMessageRead(handler) {
  if (!connection) return;
  connection.off("MessageRead", handler);
}

export function onUserPresenceChanged(handler) {
  if (!connection) return;
  connection.on("UserPresenceChanged", handler);
}

export function offUserPresenceChanged(handler) {
  if (!connection) return;
  connection.off("UserPresenceChanged", handler);
}

export function onConversationCreated(handler) {
  if (!connection) return;
  connection.on("ConversationCreated", handler);
}

export function offConversationCreated(handler) {
  if (!connection) return;
  connection.off("ConversationCreated", handler);
}

export async function joinConversationGroup(conversationId) {
  if (!connection) await startConnection();
  return connection.invoke("JoinConversationGroup", conversationId);
}

export async function getOnlineUsers() {
  if (!connection) await startConnection();
  return connection.invoke("GetOnlineUsers");
}

export async function sendMessage(receiverId, conversationId, textMessage) {
  if (!connection) await startConnection();
  // Hub method: SendMessageAsync(string? receiverId, int? conversationId, string textMessage)
  return connection.invoke(
    "SendMessageAsync",
    receiverId ?? null,
    conversationId ?? null,
    textMessage
  );
}

export async function stopConnection() {
  connectionRefCount = Math.max(0, connectionRefCount - 1);
  if (!connection) return;
  if (connectionRefCount > 0) return;
  try {
    // Avoid "Failed to start the HttpConnection before stop() was called"
    // by ensuring any in-flight start completes first.
    if (startingPromise) {
      try {
        await startingPromise;
      } catch {
        // ignore start failures
      }
    }
    await connection.stop();
  } catch (e) {
    // swallow to avoid noisy console errors on navigation/logout
  } finally {
    connection = null;
  }
}

export function getConnection() {
  return connection;
}
