import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import {
  getSessionsApi,
  logoutSessionApi,
  logoutOtherSessionsApi,
  deactivateAccountApi,
  deleteAccountApi,
  type Session,
} from "../service/settingService";

// ── Types ──────────────────────────────────────────────────

interface NotificationPreferences {
  orderUpdates: boolean;
  deliveryNotifications: boolean;
  prescriptionReminders: boolean;
  medicineReorders: boolean;
  pharmacyNews: boolean;
  promotionsDiscounts: boolean;
  smsAlerts: boolean;
  emailNotifications: boolean;
}

interface PrivacyPreferences {
  prescriptionVisibility: boolean;
  orderHistory: boolean;
  healthProfile: boolean;
  allergyInfo: boolean;
  medicineHistory: boolean;
}

// ── Components ──────────────────────────────────────────────

interface SettingToggleProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}

function SettingToggle({
  label,
  description,
  value,
  onChange,
  icon,
}: SettingToggleProps) {
  const trackClass = value ? "bg-primary" : "bg-gray-300";
  const knobClass = value ? "translate-x-6" : "translate-x-0";

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="mt-0.5 text-primary">{icon}</div>}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-dark">{label}</p>
          <p className="text-xs text-slate-600 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${trackClass}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${knobClass}`}
        />
      </button>
    </div>
  );
}

interface SettingSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function SettingSection({
  title,
  description,
  icon,
  children,
}: SettingSectionProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-4 sm:px-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-1">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="text-base font-black text-dark">{title}</h3>
        </div>
        {description && (
          <p className="text-xs text-slate-600 ml-7 mt-1">{description}</p>
        )}
      </div>
      <div className="px-5 py-4 sm:px-6">{children}</div>
    </div>
  );
}

function deviceIcon(session: Session): string {
  const type = session.deviceDetails?.type ?? "";
  if (type === "mobile") return "📱";
  if (type === "tablet") return "📲";
  return "💻";
}

// ── Main Component ──────────────────────────────────────────

export default function MySettingPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    orderUpdates: true,
    deliveryNotifications: true,
    prescriptionReminders: true,
    medicineReorders: true,
    pharmacyNews: false,
    promotionsDiscounts: true,
    smsAlerts: false,
    emailNotifications: true,
  });

  const [privacy, setPrivacy] = useState<PrivacyPreferences>({
    prescriptionVisibility: false,
    orderHistory: false,
    healthProfile: false,
    allergyInfo: false,
    medicineHistory: false,
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

  const toggleNotif =
    (key: keyof NotificationPreferences) => (v: boolean) =>
      setNotifications((p) => ({ ...p, [key]: v }));

  const togglePrivacy = (key: keyof PrivacyPreferences) => (v: boolean) =>
    setPrivacy((p) => ({ ...p, [key]: v }));

  const confirmAction = (options: {
    title: string;
    message: string;
    confirmLabel: string;
    isDanger?: boolean;
    onConfirm: () => Promise<void> | void;
  }) => {
    toast(
      (t) => (
        <div className="w-80 rounded-xl border border-gray-100 bg-white p-5 shadow-lg">
          <p className="font-semibold text-dark text-sm">{options.title}</p>
          <p className="text-xs text-slate-600 mt-2">{options.message}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                void options.onConfirm();
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                options.isDanger
                  ? "bg-red-50 text-red-700 hover:bg-red-100"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              {options.confirmLabel}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleDeactivate = () => {
    if (accountActionLoading) return;
    confirmAction({
      title: "Deactivate your account?",
      message:
        "Your account and profile will be hidden. You can reactivate anytime by logging in.",
      confirmLabel: "Deactivate",
      isDanger: true,
      onConfirm: async () => {
        try {
          setAccountActionLoading("deactivate");
          await deactivateAccountApi();
          toast.success("Account deactivated");
          setTimeout(() => navigate("/login"), 1500);
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to deactivate account";
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
      message:
        "All your data including orders, prescriptions, and health information will be permanently deleted. This action cannot be undone.",
      confirmLabel: "Delete Permanently",
      isDanger: true,
      onConfirm: async () => {
        try {
          setAccountActionLoading("delete");
          await deleteAccountApi("user_requested");
          toast.success("Account deleted");
          setTimeout(() => navigate("/"), 1500);
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to delete account";
          toast.error(msg);
        } finally {
          setAccountActionLoading(null);
        }
      },
    });
  };

  return (
    <SectionContainer>
      <MainContainer>
        <div className="mb-8">
          <SectionHeading
            title="Account Settings"
            description="Manage your preferences, privacy, security and connected devices"
            align="left"
          />
        </div>

        {/* ── Notification Preferences ── */}
        <SettingSection
          title="Notifications"
          description="Control how Medigo contacts you about your orders and health"
          icon="🔔"
        >
          <SettingToggle
            label="Order Updates"
            description="Get notified when your order status changes"
            value={notifications.orderUpdates}
            onChange={toggleNotif("orderUpdates")}
            icon={<Icons.Cart className="!w-5 !h-5" />}
          />
          <SettingToggle
            label="Delivery Notifications"
            description="Real-time updates about your delivery"
            value={notifications.deliveryNotifications}
            onChange={toggleNotif("deliveryNotifications")}
            icon={<Icons.Delivery className="!w-5 !h-5" />}
          />
          <SettingToggle
            label="Prescription Reminders"
            description="Reminders to refill your prescriptions"
            value={notifications.prescriptionReminders}
            onChange={toggleNotif("prescriptionReminders")}
            icon={<Icons.Prescription className="!w-5 !h-5" />}
          />
          <SettingToggle
            label="Medicine Reorder Suggestions"
            description="Suggestions to reorder frequently used medicines"
            value={notifications.medicineReorders}
            onChange={toggleNotif("medicineReorders")}
            icon={<Icons.Pill className="!w-5 !h-5" />}
          />
          <SettingToggle
            label="Pharmacy News & Updates"
            description="New medicines, services and health information"
            value={notifications.pharmacyNews}
            onChange={toggleNotif("pharmacyNews")}
            icon={<Icons.AlertCircle className="!w-5 !h-5" />}
          />
          <SettingToggle
            label="Promotions & Discounts"
            description="Exclusive offers and discounts on medicines"
            value={notifications.promotionsDiscounts}
            onChange={toggleNotif("promotionsDiscounts")}
            icon={<Icons.Star className="!w-5 !h-5" />}
          />
          <SettingToggle
            label="SMS Alerts"
            description="Critical alerts via SMS (for important updates only)"
            value={notifications.smsAlerts}
            onChange={toggleNotif("smsAlerts")}
            icon={<Icons.Phone className="!w-5 !h-5" />}
          />
          <SettingToggle
            label="Email Notifications"
            description="Receive updates and confirmations via email"
            value={notifications.emailNotifications}
            onChange={toggleNotif("emailNotifications")}
            icon={<Icons.Mail className="!w-5 !h-5" />}
          />
        </SettingSection>

        {/* ── Privacy Preferences ── */}
        <SettingSection
          title="Privacy & Data"
          description="Control visibility of your health and order information"
          icon="🔐"
        >
          <SettingToggle
            label="Prescription Visibility"
            description="Allow doctors and pharmacists to view your prescriptions"
            value={privacy.prescriptionVisibility}
            onChange={togglePrivacy("prescriptionVisibility")}
            icon={<Icons.Lock className="!w-5 !h-5" />}
          />
          <SettingToggle
            label="Order History Visibility"
            description="Show your order history to support team"
            value={privacy.orderHistory}
            onChange={togglePrivacy("orderHistory")}
            icon={<Icons.Clock className="!w-5 !h-5" />}
          />
          <SettingToggle
            label="Health Profile"
            description="Allow sharing your health information with doctors"
            value={privacy.healthProfile}
            onChange={togglePrivacy("healthProfile")}
            icon={<Icons.Shield className="!w-5 !h-5" />}
          />
          <SettingToggle
            label="Allergy Information"
            description="Keep your allergy data visible for pharmacist consultation"
            value={privacy.allergyInfo}
            onChange={togglePrivacy("allergyInfo")}
            icon={<Icons.AlertCircle className="!w-5 !h-5" />}
          />
          <SettingToggle
            label="Medicine History"
            description="Enable personalized medicine recommendations"
            value={privacy.medicineHistory}
            onChange={togglePrivacy("medicineHistory")}
            icon={<Icons.Pill className="!w-5 !h-5" />}
          />
        </SettingSection>

        {/* ── Active Sessions ── */}
        <SettingSection
          title="Active Sessions"
          description="Manage devices where you're signed in"
          icon="📲"
        >
          <div className="mb-4 flex items-center justify-between">
            {sessions.filter((s) => !s.current).length > 0 && (
              <button
                type="button"
                onClick={handleLogoutAllOthers}
                disabled={actionLoading === "all"}
                className="px-4 py-2 text-sm font-semibold text-danger border border-danger/30 rounded-lg hover:bg-danger/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === "all" ? "Logging out…" : "Sign out all other devices"}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {sessionsLoading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg border border-gray-100 bg-gray-50 animate-pulse"
                />
              ))
            ) : sessions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 px-6 py-8 text-center text-sm text-slate-600">
                No active sessions found
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                    session.current
                      ? "border-primary/30 bg-primary/5"
                      : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${
                        session.current
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {deviceIcon(session)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-dark">
                          {session.device}
                        </p>
                        {session.current && (
                          <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-xs font-bold">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {session.location} · {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      type="button"
                      onClick={() => handleLogoutSession(session.id)}
                      disabled={actionLoading === session.id}
                      className="ml-3 px-3 py-1.5 text-xs font-semibold text-danger border border-danger/30 rounded-lg hover:bg-danger/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      {actionLoading === session.id ? "…" : "Sign out"}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </SettingSection>

        {/* ── Danger Zone ── */}
        <SettingSection
          title="Danger Zone"
          description="Irreversible actions that affect your account"
          icon="⚠️"
        >
          <div className="space-y-3">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Deactivate Account
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Hides your profile and stops receiving communications. You can
                    reactivate anytime.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={accountActionLoading === "deactivate"}
                  className="px-4 py-2 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  {accountActionLoading === "deactivate"
                    ? "Processing…"
                    : "Deactivate"}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-red-300 bg-red-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-red-900">
                    Delete Account Permanently
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Permanently delete your account and all data. This cannot be
                    undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={accountActionLoading === "delete"}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  {accountActionLoading === "delete" ? "Processing…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </SettingSection>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-slate-600">
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@medigo.com"
              className="text-primary hover:underline"
            >
              support@medigo.com
            </a>
          </p>
        </div>
      </MainContainer>
    </SectionContainer>
  );
}

