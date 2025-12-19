import * as signalR from "@microsoft/signalr";

let connection = null;

const getToken = () => {
  return (
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
};

export async function startConnection() {
  if (connection && connection.state === signalR.HubConnectionState.Connected)
    return connection;

  const token = getToken();
  // If VITE_API_BASE_URL includes '/api', strip it so hub path becomes '/hubs/chat'
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "")
    .replace(/\/$/, "")
    .replace(/\/api\/?$/i, "");

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${apiBase}/hubs/chat`, {
      accessTokenFactory: () => token || "",
    })
    .configureLogging(signalR.LogLevel.Warning)
    .withAutomaticReconnect()
    .build();

  await connection.start();
  return connection;
}

export function onReceiveMessage(handler) {
  if (!connection) return;
  connection.on("ReceiveMessage", handler);
}

export function offReceiveMessage(handler) {
  if (!connection) return;
  connection.off("ReceiveMessage", handler);
}

export async function sendMessage(receiverId, textMessage) {
  if (!connection) await startConnection();
  return connection.invoke("SendMessage", receiverId, textMessage);
}

export async function stopConnection() {
  if (!connection) return;
  try {
    await connection.stop();
  } catch (e) {
    console.error("Error stopping SignalR connection", e);
  } finally {
    connection = null;
  }
}

export function getConnection() {
  return connection;
}
