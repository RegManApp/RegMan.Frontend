import * as signalR from "@microsoft/signalr";

let connection = null;
let startingPromise = null;

const getToken = () => {
  return (
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
};

export async function startSmartOfficeHoursConnection() {
  if (connection && connection.state === signalR.HubConnectionState.Connected)
    return connection;

  if (startingPromise) return startingPromise;

  const apiBase = (import.meta.env.VITE_API_BASE_URL || "")
    .replace(/\/$/, "")
    .replace(/\/api\/?$/i, "");

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${apiBase}/hubs/officehours`, {
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

export function onProviderViewUpdated(handler) {
  if (!connection) return;
  connection.on("ProviderViewUpdated", handler);
}

export function offProviderViewUpdated(handler) {
  if (!connection) return;
  connection.off("ProviderViewUpdated", handler);
}

export function onStudentViewUpdated(handler) {
  if (!connection) return;
  connection.on("StudentViewUpdated", handler);
}

export function offStudentViewUpdated(handler) {
  if (!connection) return;
  connection.off("StudentViewUpdated", handler);
}

export async function joinOfficeHourAsStudent(officeHourId) {
  if (!connection) await startSmartOfficeHoursConnection();
  try {
    return await connection.invoke("JoinAsStudent", Number(officeHourId));
  } catch (err) {
    const msg = err?.message || "Failed to join office hour";
    const e = new Error(msg);
    e.cause = err;
    throw e;
  }
}

export async function joinOfficeHourAsProvider(officeHourId) {
  if (!connection) await startSmartOfficeHoursConnection();
  try {
    return await connection.invoke("JoinAsProvider", Number(officeHourId));
  } catch (err) {
    const msg = err?.message || "Failed to join office hour";
    const e = new Error(msg);
    e.cause = err;
    throw e;
  }
}
