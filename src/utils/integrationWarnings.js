export const isCalendarSyncWarningMessage = (message) => {
  if (!message) return false;
  const m = String(message).toLowerCase();

  const mentionsCalendar = m.includes("calendar") || m.includes("google");
  const indicatesFailure =
    m.includes("fail") || m.includes("error") || m.includes("unable");

  return mentionsCalendar && indicatesFailure;
};
