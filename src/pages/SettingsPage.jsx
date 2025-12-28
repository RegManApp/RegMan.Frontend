import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

import { useAuth } from "../contexts/AuthContext";
import { adminApi } from "../api/adminApi";
import { googleCalendarIntegrationApi } from "../api/googleCalendarIntegrationApi";
import { Card, Button, Input, Breadcrumb } from "../components/common";

const normalizeApiBase = (raw) => {
  const trimmed = String(raw || "").replace(/\/$/, "");

  // Default to relative /api when no env is set.
  if (!trimmed) return "/api";

  // If caller already provided /api, use it.
  if (/\/api$/i.test(trimmed)) return trimmed;

  // If caller provided origin-only (e.g. https://localhost:7025), append /api.
  return `${trimmed}/api`;
};

const SettingsPage = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();

  // ==========================
  // Google Calendar Integration
  // ==========================
  const [gcLoading, setGcLoading] = useState(true);
  const [gcConnected, setGcConnected] = useState(false);
  const [gcEmail, setGcEmail] = useState(null);

  const apiBase = useMemo(
    () => normalizeApiBase(import.meta.env.VITE_API_BASE_URL),
    []
  );

  const connectUrl = useMemo(() => {
    const returnUrl = encodeURIComponent("/settings");
    return `${apiBase}/integrations/google-calendar/connect?returnUrl=${returnUrl}`;
  }, [apiBase]);

  const loadGoogleCalendarStatus = async () => {
    setGcLoading(true);
    try {
      const status = await googleCalendarIntegrationApi.getStatus();
      setGcConnected(Boolean(status?.connected));
      setGcEmail(status?.email || null);
    } catch {
      // Non-blocking: treat as not connected if status endpoint fails.
      setGcConnected(false);
      setGcEmail(null);
    } finally {
      setGcLoading(false);
    }
  };

  useEffect(() => {
    loadGoogleCalendarStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =================
  // Admin-only section
  // =================
  const [registrationStartDate, setRegistrationStartDate] = useState("");
  const [registrationEndDate, setRegistrationEndDate] = useState("");
  const [withdrawStartDate, setWithdrawStartDate] = useState("");
  const [withdrawEndDate, setWithdrawEndDate] = useState("");
  const [adminSaving, setAdminSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin()) return;

    adminApi
      .getAcademicCalendarSettings()
      .then((res) => {
        setRegistrationStartDate(res.data?.registrationStartDate || "");
        setRegistrationEndDate(res.data?.registrationEndDate || "");
        setWithdrawStartDate(res.data?.withdrawStartDate || "");
        setWithdrawEndDate(res.data?.withdrawEndDate || "");
      })
      .catch(() => {
        // fallback for older endpoint
        adminApi.getRegistrationEndDate().then((res) => {
          setRegistrationStartDate(res.data?.registrationStartDate || "");
          setRegistrationEndDate(res.data?.registrationEndDate || "");
          setWithdrawStartDate(res.data?.withdrawStartDate || "");
          setWithdrawEndDate(res.data?.withdrawEndDate || "");
        });
      });
  }, [isAdmin]);

  const handleAdminSave = async () => {
    setAdminSaving(true);
    try {
      await adminApi.setAcademicCalendarSettings({
        registrationStartDate,
        registrationEndDate,
        withdrawStartDate,
        withdrawEndDate,
      });
      toast.success(t("adminSettings.toasts.timelineUpdated"));
    } catch {
      toast.error(t("adminSettings.errors.timelineUpdateFailed"));
    } finally {
      setAdminSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb
          items={[{ labelKey: isAdmin() ? "nav.adminSettings" : "nav.settings", href: "/settings", current: true }]}
        />
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {isAdmin() ? t("nav.adminSettings") : t("nav.settings")}
        </h1>
      </div>

      <Card title={t("settings.googleCalendar.title")}>
        {gcLoading ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("common.loading")}
          </p>
        ) : gcConnected ? (
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {t("settings.googleCalendar.connected")}
              </p>
              {gcEmail ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("settings.googleCalendar.connectedEmail", { email: gcEmail })}
                </p>
              ) : null}
              <Button disabled>{t("settings.googleCalendar.connectButton")}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t("settings.googleCalendar.notConnectedDescription")}
            </p>
            <Button onClick={() => window.location.assign(connectUrl)}>
              {t("settings.googleCalendar.connectButton")}
            </Button>
          </div>
        )}
      </Card>

      {isAdmin() ? (
        <Card title={t("adminSettings.cards.registrationTimeline")}
          subtitle={t("adminSettings.cards.registrationTimelineSubtitle")}
        >
          <div className="space-y-4">
            <label className="block font-medium text-gray-900 dark:text-white">
              {t("adminSettings.fields.registrationOpenDate")}
            </label>
            <Input
              type="date"
              value={registrationStartDate}
              onChange={(e) => setRegistrationStartDate(e.target.value)}
            />

            <label className="block font-medium text-gray-900 dark:text-white">
              {t("adminSettings.fields.registrationEndDate")}
            </label>
            <Input
              type="date"
              value={registrationEndDate}
              onChange={(e) => setRegistrationEndDate(e.target.value)}
            />

            <label className="block font-medium text-gray-900 dark:text-white">
              {t("adminSettings.fields.withdrawStartDate")}
            </label>
            <Input
              type="date"
              value={withdrawStartDate}
              onChange={(e) => setWithdrawStartDate(e.target.value)}
            />

            <label className="block font-medium text-gray-900 dark:text-white">
              {t("adminSettings.fields.withdrawEndDate")}
            </label>
            <Input
              type="date"
              value={withdrawEndDate}
              onChange={(e) => setWithdrawEndDate(e.target.value)}
            />

            <Button onClick={handleAdminSave} disabled={adminSaving}>
              {adminSaving ? t("common.submitting") : t("common.save")}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default SettingsPage;
