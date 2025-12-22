import * as signalR from "@microsoft/signalr";

let connection = null;

const getToken = () => {
  return (
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
};

export async function startNotificationsConnection() {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  const apiBase = (import.meta.env.VITE_API_BASE_URL || "")
    .replace(/\/$/, "")
    .replace(/\/api\/?$/i, "");

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${apiBase}/hubs/notifications`, {
      accessTokenFactory: () => getToken() || "",
    })
    .configureLogging(signalR.LogLevel.Warning)
    .withAutomaticReconnect()
    .build();

  await connection.start();
  return connection;
}

export function onNotificationReceived(handler) {
  if (!connection) return;
  connection.on("NotificationReceived", handler);
}

export function offNotificationReceived(handler) {
  if (!connection) return;
  connection.off("NotificationReceived", handler);
}

export async function stopNotificationsConnection() {
  if (!connection) return;
  try {
    await connection.stop();
  } catch (e) {
    console.error("Error stopping notifications SignalR connection", e);
  } finally {
    connection = null;
  }
}
