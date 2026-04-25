import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getSessionsApi,
  logoutSessionApi,
  logoutOtherSessionsApi,
  deactivateAccountApi,
  deleteAccountApi,
  type Session,
} from "../service/settingService";

interface SettingToggleProps {
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function SettingToggle({ label, sub, value, onChange }: SettingToggleProps) {
  const trackClass = value ? "bg-[#1D9E75]" : "bg-[#D5D0CA]";
  const knobClass = value ? "translate-x-6" : "translate-x-0";

  return (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <div className="text-sm font-medium text-[#1A1A1A]">{label}</div>
        <div className="mt-0.5 text-xs text-[#999]">{sub}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className={`relative h-6 w-12 rounded-full transition-colors ${trackClass}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${knobClass}`}
        />
      </button>
    </div>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 rounded-2xl border border-[#E8E2DA] bg-white px-5 py-6 sm:px-7">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[1px] text-[#C0392B]">
        {title}
      </p>
      <div className="divide-y divide-[#F0EDE8]">{children}</div>
    </div>
  );
}

function deviceIcon(session: Session): string {
  const type = session.deviceDetails?.type ?? "";
  if (type === "mobile") return "📱";
  if (type === "tablet") return "📲";
  return "💻";
}

export default function SettingsPage() {
  const [notif, setNotif] = useState({
    bloodRequests: true,
    donorResponses: true,
    requestFulfilled: true,
    systemUpdates: false,
    emailDigest: true,
    smsAlerts: false,
  });

  const [privacy, setPrivacy] = useState({
    showPhone: false,
    showEmail: false,
    showLocation: true,
    showDonations: true,
    showSocials: true,
  });

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [accountActionLoading, setAccountActionLoading] = useState<
    "deactivate" | "delete" | null
  >(null);

  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const data = await getSessionsApi();
      setSessions(data.sessions);
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleLogoutSession = async (sessionId: string) => {
    try {
      setActionLoading(sessionId);
      await logoutSessionApi(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session logged out");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to log out session";
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogoutAllOthers = async () => {
    try {
      setActionLoading("all");
      await logoutOtherSessionsApi();
      setSessions((prev) => prev.filter((s) => s.current));
      toast.success("All other sessions logged out");
    } catch {
      toast.error("Failed to log out other sessions");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleNotif = (key: keyof typeof notif) => (v: boolean) =>
    setNotif((p) => ({ ...p, [key]: v }));
  const togglePrivacy = (key: keyof typeof privacy) => (v: boolean) =>
    setPrivacy((p) => ({ ...p, [key]: v }));

  const confirmAction = (options: {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => Promise<void> | void;
  }) => {
    toast(
      (t) => (
        <div className="w-72 rounded-xs border border-[#E8E2DA] bg-white p-4 shadow-lg">
          <div className="text-sm font-semibold text-[#1A1A1A]">
            {options.title}
          </div>
          <div className="mt-1 text-xs text-[#888]">{options.message}</div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="rounded-md border border-[#E8E2DA] px-3 py-1 text-xs font-medium text-[#666] hover:bg-[#F7F5F2]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                void options.onConfirm();
              }}
              className="rounded-xs border border-[#FADBD8] px-3 py-1 text-xs font-medium text-[#E74C3C] hover:bg-[#FFF5F5]"
            >
              {options.confirmLabel}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  };

  const handleDeactivate = () => {
    if (accountActionLoading) return;
    confirmAction({
      title: "Deactivate account?",
      message: "Hides your profile. You can reactivate anytime by logging in.",
      confirmLabel: "Deactivate",
      onConfirm: async () => {
        try {
          setAccountActionLoading("deactivate");
          await deactivateAccountApi();
          toast.success("Account deactivated");
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Failed to deactivate account";
          toast.error(msg);
        } finally {
          setAccountActionLoading(null);
        }
      },
    });
  };

  const handleDelete = () => {
    if (accountActionLoading) return;
    confirmAction({
      title: "Delete account permanently?",
      message: "All your data will be erased. This cannot be undone.",
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          setAccountActionLoading("delete");
          await deleteAccountApi("user_requested");
          toast.success("Account deleted");
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Failed to delete account";
          toast.error(msg);
        } finally {
          setAccountActionLoading(null);
        }
      },
    });
  };

  const cardClass = "mb-5 rounded-2xl border border-[#E8E2DA] bg-white px-5 py-6 sm:px-7";

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto w-full max-w-[720px] px-4 pb-20 pt-8 sm:px-6">
        <div className="mb-7">
          <h1 className="mb-1 font-serif text-2xl font-bold text-[#1A1A1A]">
            Settings
          </h1>
          <p className="text-sm text-[#888]">
            Manage your notifications, privacy and security
          </p>
        </div>

        <SettingSection title="Notifications">
          <SettingToggle
            label="Blood requests nearby"
            sub="Get notified when someone requests your blood type"
            value={notif.bloodRequests}
            onChange={toggleNotif("bloodRequests")}
          />
          <SettingToggle
            label="Donor responses"
            sub="When a donor responds to your blood request"
            value={notif.donorResponses}
            onChange={toggleNotif("donorResponses")}
          />
          <SettingToggle
            label="Request fulfilled"
            sub="When your blood request is marked as fulfilled"
            value={notif.requestFulfilled}
            onChange={toggleNotif("requestFulfilled")}
          />
          <SettingToggle
            label="System updates"
            sub="News and feature updates from BloodConnect"
            value={notif.systemUpdates}
            onChange={toggleNotif("systemUpdates")}
          />
          <SettingToggle
            label="Email digest"
            sub="Weekly summary of activity in your area"
            value={notif.emailDigest}
            onChange={toggleNotif("emailDigest")}
          />
          <SettingToggle
            label="SMS alerts"
            sub="Urgent blood requests via SMS (charges may apply)"
            value={notif.smsAlerts}
            onChange={toggleNotif("smsAlerts")}
          />
        </SettingSection>

        <SettingSection title="Privacy">
          <SettingToggle
            label="Show phone number"
            sub="Visible to donors and requesters on your profile"
            value={privacy.showPhone}
            onChange={togglePrivacy("showPhone")}
          />
          <SettingToggle
            label="Show email address"
            sub="Visible on your public donor profile"
            value={privacy.showEmail}
            onChange={togglePrivacy("showEmail")}
          />
          <SettingToggle
            label="Show location"
            sub="Show your city/district to help donors find you"
            value={privacy.showLocation}
            onChange={togglePrivacy("showLocation")}
          />
          <SettingToggle
            label="Show donation count"
            sub="Display total donations on your public profile"
            value={privacy.showDonations}
            onChange={togglePrivacy("showDonations")}
          />
          <SettingToggle
            label="Show social links"
            sub="Facebook, Instagram and Twitter on your profile"
            value={privacy.showSocials}
            onChange={togglePrivacy("showSocials")}
          />
        </SettingSection>

        <div className={cardClass}>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[1px] text-[#C0392B]">
              Active sessions
            </p>
            {sessions.filter((s) => !s.current).length > 0 && (
              <button
                type="button"
                onClick={handleLogoutAllOthers}
                disabled={actionLoading === "all"}
                className="rounded-md border border-[#E8E2DA] px-4 py-1.5 text-xs font-medium text-[#888] hover:bg-[#F7F5F2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading === "all" ? "Logging out…" : "Log out all others"}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            {sessionsLoading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[62px] rounded-xl border border-[#E8E2DA] bg-[#F7F5F2] animate-pulse"
                />
              ))
            ) : sessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E8E2DA] px-6 py-8 text-center text-sm text-[#888]">
                No active sessions found
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                    session.current
                      ? "border-[#9FE1CB] bg-[#F0FAF5]"
                      : "border-[#E8E2DA] bg-[#F7F5F2]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${
                        session.current
                          ? "bg-[#1D9E75] text-white"
                          : "bg-[#E8E2DA]"
                      }`}
                    >
                      {deviceIcon(session)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A]">
                        {session.device}
                        {session.current && (
                          <span className="rounded-full bg-[#1D9E75] px-2 py-0.5 text-[10px] text-white">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#888]">
                        {session.location} · {session.lastActive}
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      type="button"
                      onClick={() => handleLogoutSession(session.id)}
                      disabled={actionLoading === session.id}
                      className="rounded-md border border-[#FADBD8] px-4 py-1.5 text-xs font-medium text-[#E74C3C] hover:bg-[#FFF5F5] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading === session.id ? "Logging out…" : "Log out"}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className={cardClass}>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[1px] text-[#C0392B]">
            Danger zone
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl border border-[#FADBD8] bg-[#FFF5F5] px-4 py-3">
              <div>
                <div className="text-sm font-medium text-[#922B21]">
                  Deactivate account
                </div>
                <div className="mt-0.5 text-xs text-[#C0392B]">
                  Hides your profile. You can reactivate anytime by logging in.
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={accountActionLoading === "deactivate"}
                className="rounded-xs border border-[#FADBD8] px-4 py-1.5 text-xs font-medium text-[#E74C3C] hover:bg-[#FFF5F5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {accountActionLoading === "deactivate" ? "Working…" : "Deactivate"}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#FADBD8] bg-[#FFF5F5] px-4 py-3">
              <div>
                <div className="text-sm font-medium text-[#922B21]">
                  Delete account permanently
                </div>
                <div className="mt-0.5 text-xs text-[#C0392B]">
                  All your data will be erased. This cannot be undone.
                </div>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                disabled={accountActionLoading === "delete"}
                className="rounded-xs border border-[#FADBD8] px-4 py-1.5 text-xs font-medium text-[#E74C3C] hover:bg-[#FFF5F5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {accountActionLoading === "delete" ? "Working…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
