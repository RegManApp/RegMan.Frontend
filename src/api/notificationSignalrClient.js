import * as signalR from "@microsoft/signalr";

let connection = null;
let connectionRefCount = 0;
let startingPromise = null;

const getToken = () => {
  return (
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
};

export async function startNotificationsConnection() {
  connectionRefCount += 1;

  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  if (startingPromise) {
    return startingPromise;
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

  startingPromise = connection
    .start()
    .then(() => connection)
    .finally(() => {
      startingPromise = null;
    });

  return startingPromise;
}

export function onNotificationReceived(handler) {
  if (!connection) return;
  connection.on("NotificationReceived", handler);
}

export function offNotificationReceived(handler) {
  if (!connection) return;
  connection.off("NotificationReceived", handler);
}

export function onAnnouncementSent(handler) {
  if (!connection) return;
  connection.on("AnnouncementSent", handler);
}

export function offAnnouncementSent(handler) {
  if (!connection) return;
  connection.off("AnnouncementSent", handler);
}

export function onAnnouncementRead(handler) {
  if (!connection) return;
  connection.on("AnnouncementRead", handler);
}

export function offAnnouncementRead(handler) {
  if (!connection) return;
  connection.off("AnnouncementRead", handler);
}

export async function stopNotificationsConnection() {
  connectionRefCount = Math.max(0, connectionRefCount - 1);
  if (!connection) return;
  if (connectionRefCount > 0) return;
  try {
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
