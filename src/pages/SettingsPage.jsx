import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

import { useAuth } from "../contexts/AuthContext";
import { adminApi } from "../api/adminApi";
import { googleCalendarIntegrationApi } from "../api/googleCalendarIntegrationApi";
import { calendarPreferencesApi } from "../api/calendarPreferencesApi";
import { reminderRulesApi } from "../api/reminderRulesApi";
import { Card, Button, Input, Breadcrumb, Select } from "../components/common";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();

  // ==========================
  // Google Calendar Integration
  // ==========================
  const [gcLoading, setGcLoading] = useState(true);
  const [gcConnected, setGcConnected] = useState(false);
  const [gcEmail, setGcEmail] = useState(null);
  const [gcDisconnecting, setGcDisconnecting] = useState(false);

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

  const handleGoogleConnect = async () => {
    try {
      const authUrl = await googleCalendarIntegrationApi.getConnectUrl("/settings");
      if (authUrl) {
        window.location.assign(authUrl);
      } else {
        toast.error(t("settings.googleCalendar.errors.connectFailed"));
      }
    } catch (err) {
      // axiosInstance already surfaces a toast with the server's message.
      // 401 is handled globally (redirect to login).
      return;
    }
  };

  const handleGoogleDisconnect = async () => {
    setGcDisconnecting(true);
    try {
      await googleCalendarIntegrationApi.disconnect();
      toast.success(t("settings.googleCalendar.toasts.disconnected"));
      await loadGoogleCalendarStatus();
    } catch {
      toast.error(t("settings.googleCalendar.errors.disconnectFailed"));
    } finally {
      setGcDisconnecting(false);
    }
  };

  // ==================
  // Calendar Preferences
  // ==================
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    timeZoneId: "UTC",
    weekStartDay: "Mon",
    hideWeekends: false,
    defaultReminderMinutes: null,
    eventTypeColorMapJson: null,
  });

  const loadCalendarPreferences = async () => {
    setPrefsLoading(true);
    try {
      const data = await calendarPreferencesApi.get();
      if (data && typeof data === "object") {
        setPrefs({
          timeZoneId: data.timeZoneId ?? "UTC",
          weekStartDay: data.weekStartDay ?? "Mon",
          hideWeekends: Boolean(data.hideWeekends),
          defaultReminderMinutes:
            data.defaultReminderMinutes === null || data.defaultReminderMinutes === undefined
              ? null
              : Number(data.defaultReminderMinutes),
          eventTypeColorMapJson: data.eventTypeColorMapJson ?? null,
        });
      }
    } catch {
      // Non-blocking: keep defaults
    } finally {
      setPrefsLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSavePreferences = async () => {
    setPrefsSaving(true);
    try {
      await calendarPreferencesApi.update({
        timeZoneId: prefs.timeZoneId,
        weekStartDay: prefs.weekStartDay,
        hideWeekends: Boolean(prefs.hideWeekends),
        defaultReminderMinutes:
          prefs.defaultReminderMinutes === "" || prefs.defaultReminderMinutes === undefined
            ? null
            : prefs.defaultReminderMinutes === null
            ? null
            : Number(prefs.defaultReminderMinutes),
        eventTypeColorMapJson: prefs.eventTypeColorMapJson,
      });
      toast.success(t("settings.calendarPreferences.toasts.saved"));
      await loadCalendarPreferences();
    } catch {
      toast.error(t("settings.calendarPreferences.errors.saveFailed"));
    } finally {
      setPrefsSaving(false);
    }
  };

  // =================
  // Reminder Rules
  // =================
  const [rulesLoading, setRulesLoading] = useState(true);
  const [rulesSaving, setRulesSaving] = useState(false);
  const [rules, setRules] = useState([]);

  const loadReminderRules = async () => {
    setRulesLoading(true);
    try {
      const data = await reminderRulesApi.get();
      setRules(Array.isArray(data) ? data : []);
    } catch {
      setRules([]);
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    loadReminderRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerKeyMap = {
    Class: "class",
    OfficeHour: "officeHour",
    RegistrationDeadline: "registrationDeadline",
    WithdrawDeadline: "withdrawDeadline",
  };

  const renderTriggerType = (value) => {
    const v = String(value || "");
    const key = triggerKeyMap[v];
    return key ? t(`settings.reminderRules.trigger.${key}`) : v;
  };

  const updateRule = (index, patch) => {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  };

  const handleSaveReminderRules = async () => {
    setRulesSaving(true);
    try {
      const payload = (rules || []).map((r) => ({
        ...r,
        minutesBefore: Number(r.minutesBefore ?? r.MinutesBefore ?? 0),
        isEnabled: Boolean(r.isEnabled ?? r.IsEnabled),
      }));
      await reminderRulesApi.update(payload);
      toast.success(t("settings.reminderRules.toasts.saved"));
      await loadReminderRules();
    } catch {
      toast.error(t("settings.reminderRules.errors.saveFailed"));
    } finally {
      setRulesSaving(false);
    }
  };

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
              <div className="flex flex-wrap gap-2">
                <Button disabled>{t("settings.googleCalendar.connectButton")}</Button>
                <Button
                  variant="danger"
                  onClick={handleGoogleDisconnect}
                  loading={gcDisconnecting}
                >
                  {t("settings.googleCalendar.disconnectButton")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t("settings.googleCalendar.notConnectedDescription")}
            </p>
            <Button onClick={handleGoogleConnect}>
              {t("settings.googleCalendar.connectButton")}
            </Button>
          </div>
        )}
      </Card>

      <Card title={t("settings.calendarPreferences.title")}>
        {prefsLoading ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
        ) : (
          <div className="space-y-4">
            <Select
              label={t("settings.calendarPreferences.fields.weekStartDay")}
              value={prefs.weekStartDay}
              onChange={(e) => setPrefs((p) => ({ ...p, weekStartDay: e.target.value }))}
              options={[
                { value: "Mon", label: t("settings.calendarPreferences.options.weekStartDay.mon") },
                { value: "Sun", label: t("settings.calendarPreferences.options.weekStartDay.sun") },
              ]}
            />

            <Select
              label={t("settings.calendarPreferences.fields.hideWeekends")}
              value={prefs.hideWeekends ? "true" : "false"}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, hideWeekends: e.target.value === "true" }))
              }
              options={[
                { value: "false", label: t("common.no") },
                { value: "true", label: t("common.yes") },
              ]}
            />

            <Input
              type="number"
              label={t("settings.calendarPreferences.fields.defaultReminderMinutes")}
              value={prefs.defaultReminderMinutes ?? ""}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  defaultReminderMinutes: e.target.value,
                }))
              }
              placeholder={t("settings.calendarPreferences.placeholders.defaultReminderMinutes")}
            />

            <Button onClick={handleSavePreferences} disabled={prefsSaving} loading={prefsSaving}>
              {t("common.save")}
            </Button>
          </div>
        )}
      </Card>

      <Card title={t("settings.reminderRules.title")} subtitle={t("settings.reminderRules.subtitle")}>
        {rulesLoading ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
        ) : rules.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("settings.reminderRules.empty")}</p>
        ) : (
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {renderTriggerType(rule.triggerType || rule.TriggerType)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("settings.reminderRules.inAppOnly")}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Select
                    label={t("settings.reminderRules.fields.enabled")}
                    value={(rule.isEnabled ?? rule.IsEnabled) ? "true" : "false"}
                    onChange={(e) => updateRule(idx, { isEnabled: e.target.value === "true" })}
                    options={[
                      { value: "true", label: t("common.yes") },
                      { value: "false", label: t("common.no") },
                    ]}
                  />

                  <Input
                    type="number"
                    label={t("settings.reminderRules.fields.minutesBefore")}
                    value={rule.minutesBefore ?? rule.MinutesBefore ?? 0}
                    onChange={(e) => updateRule(idx, { minutesBefore: e.target.value })}
                  />
                </div>
              </div>
            ))}

            <Button
              onClick={handleSaveReminderRules}
              disabled={rulesSaving}
              loading={rulesSaving}
            >
              {t("common.save")}
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
