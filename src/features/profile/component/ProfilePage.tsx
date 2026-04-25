import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { setAuthUser } from "../../../redux/slices/userSlice";
import type { IReduxUser } from "../../../redux/slices/userSlice";
import { profileStyles } from "../service/ProfileStyle";
import ProfileCard from "../ui/ProfileCard";
import ProfileField from "../ui/ProfileField";
import ProfileAvatar from "../ui/ProfileAvatar";
import BloodTypeSelector from "../ui/BloodTypeSelector";
import AvailabilityToggle from "../ui/AvailabilityToggle";
import SocialField from "../ui/SocialField";
import toast from "react-hot-toast";
import {
  changePasswordApi,
  getProfileApi,
  updateProfileApi,
  type ProfileApiUser,
} from "../service/profileService";

// ── shorthand alias for styles (used throughout JSX) ──
const s = profileStyles;

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bloodType: string;
  gender: "male" | "female" | "";
  age: string;
  weight: string;
  dateOfBirth: string;
  totalDonations: number;
  lastDonationDate: string;
  totalReceived: number;
  lastReceivedDate: string;
  isAvailable: boolean;
  isVerified: boolean;
  isDonorVerified: boolean;
  createdAt: string;
  updatedAt: string;
  role: string;
  location: {
    city: string;
    state: string;
    state_district: string;
    county: string;
    country: string;
    country_code: string;
    postcode: string;
    coordinates: {
      lat: number | null;
      lng: number | null;
    };
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

type ProfileFieldKey = Exclude<keyof ProfileForm, "location" | "socialLinks">;
type LocationFieldKey = Exclude<keyof ProfileForm["location"], "coordinates">;
type SocialFieldKey = keyof ProfileForm["socialLinks"];
type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const EMPTY_PROFILE_FORM: ProfileForm = {
  name: "",
  email: "",
  phone: "",
  avatar: "",
  bloodType: "",
  gender: "",
  age: "",
  weight: "",
  dateOfBirth: "",
  totalDonations: 0,
  lastDonationDate: "",
  totalReceived: 0,
  lastReceivedDate: "",
  isAvailable: false,
  isVerified: false,
  isDonorVerified: false,
  createdAt: "",
  updatedAt: "",
  role: "",
  location: {
    city: "",
    state: "",
    state_district: "",
    county: "",
    country: "",
    country_code: "",
    postcode: "",
    coordinates: { lat: null, lng: null },
  },
  socialLinks: {
    facebook: "",
    instagram: "",
    twitter: "",
  },
};

const getSocialHandle = (value: string | null | undefined) => {
  if (!value) return "";

  return value
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/^facebook\.com\//, "")
    .replace(/^instagram\.com\//, "")
    .replace(/^x\.com\//, "")
    .replace(/^twitter\.com\//, "")
    .replace(/\/$/, "");
};

const normalizeDateValue = (value: string | null | undefined) => {
  if (!value) return "";
  return value.includes("T") ? value.split("T")[0] : value;
};

const createProfileForm = (user?: ProfileApiUser | null): ProfileForm => {
  if (!user) return EMPTY_PROFILE_FORM;

  return {
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    avatar: user.avatar ?? "",
    bloodType: user.bloodType ?? "",
    gender:
      user.gender === "male" || user.gender === "female" ? user.gender : "",
    age: user.age != null ? String(user.age) : "",
    weight: user.weight != null ? String(user.weight) : "",
    dateOfBirth: normalizeDateValue(user.dateOfBirth),
    totalDonations: user.totalDonations ?? 0,
    lastDonationDate: user.lastDonationDate ?? "",
    totalReceived: user.totalReceived ?? 0,
    lastReceivedDate: user.lastReceivedDate ?? "",
    isAvailable: user.isAvailable ?? false,
    isVerified: user.isVerified ?? false,
    isDonorVerified: user.isDonorVerified ?? false,
    createdAt: normalizeDateValue(user.createdAt),
    updatedAt: normalizeDateValue(user.updatedAt),
    role: user.role ?? "",
    location: {
      city: user.location?.city ?? "",
      state: user.location?.state ?? "",
      state_district: user.location?.state_district ?? "",
      county: user.location?.county ?? "",
      country: user.location?.country ?? "",
      country_code: user.location?.country_code ?? "",
      postcode: user.location?.postcode ?? "",
      coordinates: {
        lat: user.location?.coordinates?.lat ?? null,
        lng: user.location?.coordinates?.lng ?? null,
      },
    },
    socialLinks: {
      facebook: getSocialHandle(user.socialLinks?.facebook),
      instagram: getSocialHandle(user.socialLinks?.instagram),
      twitter: getSocialHandle(user.socialLinks?.twitter),
    },
  };
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state: RootState) => state.user.user) as ProfileApiUser | null;
  const [form, setForm] = useState<ProfileForm>(() => createProfileForm(reduxUser));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingSection, setSaving] = useState<string | null>(null);
  const [editingPassword, setEditPwd] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(!reduxUser);
  const hasFetchedProfile = useRef(false);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const isDonor = form.role === "donor";
  const formatDate = (value: string) =>
    value
      ? new Date(value).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Never";
  const hasReceived = form.totalReceived > 0 || Boolean(form.lastReceivedDate);
  const stats = isDonor
    ? [
        { label: "Total donations", value: form.totalDonations },
        { label: "Last donation", value: formatDate(form.lastDonationDate) },
        { label: "Member since", value: formatDate(form.createdAt) },
        { label: "Last update profile", value: formatDate(form.updatedAt) },
        ...(hasReceived
          ? [
              { label: "Total received", value: form.totalReceived },
              { label: "Last received", value: formatDate(form.lastReceivedDate) },
            ]
          : []),
      ]
    : [
        { label: "Total received", value: form.totalReceived },
        { label: "Last received", value: formatDate(form.lastReceivedDate) },
        { label: "Member since", value: formatDate(form.createdAt) },
        { label: "Last update profile", value: formatDate(form.updatedAt) },
      ];

  useEffect(() => {
    if (reduxUser) {
      setForm(createProfileForm(reduxUser));
    }
  }, [reduxUser]);

  useEffect(() => {
    if (hasFetchedProfile.current) {
      return;
    }

    hasFetchedProfile.current = true;
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const profile = await getProfileApi();
        if (!isMounted) return;
        dispatch(setAuthUser(profile));
        setForm(createProfileForm(profile));
      } catch (err: unknown) {
        const error = err as ApiError;
        if (!reduxUser) {
          toast.error(error.response?.data?.message || "Failed to load profile");
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [dispatch, reduxUser]);

  // ── field setters ──────────────────────────────────
  const set = <K extends ProfileFieldKey>(field: K, val: ProfileForm[K]) => {
    setForm((p) => ({ ...p, [field]: val }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const setLoc = (field: LocationFieldKey, val: string) =>
    setForm((p) => ({ ...p, location: { ...p.location, [field]: val } }));

  const setSocial = (field: SocialFieldKey, val: string) =>
    setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [field]: val } }));

  const syncProfile = (profile: IReduxUser) => {
    dispatch(setAuthUser(profile));
    setForm(createProfileForm(profile as ProfileApiUser));
  };
  // ── save handlers ──────────────────────────────────
  const save = async (
    section: string,
    apiCall: () => Promise<void>,
    successMessage = "Saved successfully",
  ) => {
    setSaving(section);
    try {
      await apiCall();
      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
        return;
      }

      if (err instanceof Error) {
        toast.error(err.message);
        return;
      }

      toast.error("Save failed");
    } finally {
      setSaving(null);
    }
  };

  const savePersonal = () =>
    save("personal", async () => {
      const updatedProfile = await updateProfileApi({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender || null,
        dateOfBirth: form.dateOfBirth || null,
      });
      syncProfile(updatedProfile);
    });

  const saveHealth = () =>
    save("health", async () => {
      const updatedProfile = await updateProfileApi({
        bloodType: form.bloodType ? (form.bloodType as IReduxUser["bloodType"]) : null,
        age: form.age ? Number(form.age) : null,
        weight: form.weight ? Number(form.weight) : null,
      });
      syncProfile(updatedProfile);
    });

  const saveLocation = () =>
    save("location", async () => {
      const updatedProfile = await updateProfileApi({
        location: {
          city: form.location.city.trim(),
          state: form.location.state.trim(),
          state_district: form.location.state_district.trim(),
          county: form.location.county.trim(),
          country: form.location.country.trim(),
          country_code: form.location.country_code.trim(),
          postcode: form.location.postcode.trim(),
          coordinates: {
            lat: form.location.coordinates.lat,
            lng: form.location.coordinates.lng,
          },
        },
      });
      syncProfile(updatedProfile);
    });

  const saveSocials = () =>
    save("socials", async () => {
      const updatedProfile = await updateProfileApi({
        socialLinks: {
          facebook: form.socialLinks.facebook.trim() || null,
          instagram: form.socialLinks.instagram.trim() || null,
          twitter: form.socialLinks.twitter.trim() || null,
        },
      });
      syncProfile(updatedProfile);
    });

  const toggleAvailability = () =>
    save("availability", async () => {
      const updatedProfile = await updateProfileApi({
        isAvailable: !form.isAvailable,
      });
      syncProfile(updatedProfile);
    });

  const savePassword = () =>
    save(
      "password",
      async () => {
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
          setErrors({ confirmPassword: "Passwords do not match" });
          throw new Error("Passwords do not match");
        }
        if (pwdForm.newPassword.length < 8) {
          setErrors({ newPassword: "Min 8 characters" });
          throw new Error("Min 8 characters");
        }
        const message = await changePasswordApi({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword,
        });
        setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setEditPwd(false);
        toast.success(message);
      },
      "",
    );

  const isSaving = (section: string) => savingSection === section;

  if (loadingProfile) {
    return (
      <div style={s.page}>
        <div style={s.container}>
          <div style={s.pageHeader}>
            <h1 style={s.pageTitle}>My profile</h1>
            <p style={s.pageSubtitle}>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* ── page header ── */}
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>My profile</h1>
          <p style={s.pageSubtitle}>
            {isDonor
              ? "Manage your donor profile and account settings"
              : "Manage your profile and account settings"}
          </p>
        </div>

        {/* ── 1. avatar + overview ── */}
        <ProfileCard title={isDonor ? "Donor overview" : "Profile overview"}>
          <ProfileAvatar
            name={form.name}
            avatar={form.avatar}
            bloodType={form.bloodType}
            role={form.role}
            totalDonations={form.totalDonations}
            totalReceived={form.totalReceived}
            isAvailable={form.isAvailable}
            isDonorVerified={form.isDonorVerified}
            onUpload={() => toast("Avatar upload coming soon")}
          />

          {isDonor && (
            <AvailabilityToggle
              isAvailable={form.isAvailable}
              onChange={toggleAvailability}
              loading={isSaving("availability")}
            />
          )}

          {/* stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "#F7F5F2",
                  border: "1px solid #E8E2DA",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1A1A1A",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{ fontSize: "11px", color: "#999", marginTop: "3px" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </ProfileCard>

        {/* ── 2. personal info ── */}
        <ProfileCard
          title="Personal information"
          action={
            <SaveButton onClick={savePersonal} loading={isSaving("personal")} />
          }
        >
          <div style={s.grid2}>
            <ProfileField
              label="Full name"
              name="name"
              value={form.name}
              onChange={(v) => set("name", v)}
              placeholder="Mostak Ahmed"
              error={errors.name}
            />
            <ProfileField
              label="Phone number"
              name="phone"
              value={form.phone}
              onChange={(v) => set("phone", v)}
              placeholder="01712345678"
              error={errors.phone}
            />
          </div>
          <ProfileField
            label="Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={(v) => set("email", v)}
            placeholder="mostak@gmail.com"
            error={errors.email}
          />
          <div style={s.grid2}>
            <div style={{ marginBottom: "16px" }}>
              <label style={s.label}>Gender</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  marginTop: "6px",
                }}
              >
                {(["male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set("gender", g)}
                    style={{
                      height: "38px",
                      border: "1px solid",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.15s",
                      textTransform: "capitalize" as const,
                      background: form.gender === g ? "#C0392B" : "#F7F5F2",
                      color: form.gender === g ? "white" : "#666",
                      borderColor: form.gender === g ? "#C0392B" : "#E8E2DA",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <ProfileField
              label="Date of birth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={(v) => set("dateOfBirth", v)}
            />
          </div>
        </ProfileCard>

        {/* ── 3. health info ── */}
        <ProfileCard
          title="Health information"
          action={
            <SaveButton onClick={saveHealth} loading={isSaving("health")} />
          }
        >
          <BloodTypeSelector
            value={form.bloodType}
            onChange={(v) => set("bloodType", v)}
            error={errors.bloodType}
          />
          <div style={s.grid2}>
            <ProfileField
              label="Age"
              name="age"
              type="number"
              value={form.age}
              onChange={(v) => set("age", v)}
              placeholder="25"
              hint="Must be 18–65"
              error={errors.age}
            />
            <ProfileField
              label="Weight (kg)"
              name="weight"
              type="number"
              value={form.weight}
              onChange={(v) => set("weight", v)}
              placeholder="65"
              hint="Minimum 50 kg"
              error={errors.weight}
            />
          </div>
        </ProfileCard>

        {/* ── 4. location ── */}
        <ProfileCard
          title="Location"
          action={
            <SaveButton onClick={saveLocation} loading={isSaving("location")} />
          }
        >
          <div style={s.grid2}>
            <ProfileField
              label="City / Town"
              name="city"
              value={form.location.city}
              onChange={(v) => setLoc("city", v)}
              placeholder="Dhaka"
            />
            <ProfileField
              label="State / Division"
              name="state"
              value={form.location.state}
              onChange={(v) => setLoc("state", v)}
              placeholder="Dhaka Division"
            />
            <ProfileField
              label="District"
              name="state_district"
              value={form.location.state_district}
              onChange={(v) => setLoc("state_district", v)}
              placeholder="Dhaka District"
            />
            <ProfileField
              label="County"
              name="county"
              value={form.location.county}
              onChange={(v) => setLoc("county", v)}
              placeholder="Bangladesh"
            />
            <ProfileField
              label="Country"
              name="country"
              value={form.location.country}
              onChange={(v) => setLoc("country", v)}
              placeholder="Bangladesh"
            />
            <ProfileField
              label="Postcode"
              name="postcode"
              value={form.location.postcode}
              onChange={(v) => setLoc("postcode", v)}
              placeholder="1207"
            />
          </div>
          <div style={s.grid2}>
            <ProfileField
              label="Latitude"
              name="lat"
              type="number"
              value={String(form.location.coordinates.lat ?? "")}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  location: {
                    ...p.location,
                    coordinates: {
                      ...p.location.coordinates,
                      lat: v ? Number(v) : null,
                    },
                  },
                }))
              }
              placeholder="23.8103"
              hint="Auto-filled from GPS"
            />
            <ProfileField
              label="Longitude"
              name="lng"
              type="number"
              value={String(form.location.coordinates.lng ?? "")}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  location: {
                    ...p.location,
                    coordinates: {
                      ...p.location.coordinates,
                      lng: v ? Number(v) : null,
                    },
                  },
                }))
              }
              placeholder="90.4125"
              hint="Auto-filled from GPS"
            />
          </div>
        </ProfileCard>

        {/* ── 5. social links ── */}
        <ProfileCard
          title="Social links"
          action={
            <SaveButton onClick={saveSocials} loading={isSaving("socials")} />
          }
        >
          <SocialField
            platform="Facebook"
            prefix="facebook.com/"
            value={form.socialLinks.facebook}
            onChange={(v) => setSocial("facebook", v)}
            placeholder="yourprofile"
          />
          <SocialField
            platform="Instagram"
            prefix="instagram.com/"
            value={form.socialLinks.instagram}
            onChange={(v) => setSocial("instagram", v)}
            placeholder="yourhandle"
          />
          <SocialField
            platform="Twitter"
            prefix="x.com/"
            value={form.socialLinks.twitter}
            onChange={(v) => setSocial("twitter", v)}
            placeholder="yourhandle"
          />
        </ProfileCard>

        {/* ── 6. change password ── */}
        <ProfileCard
          title="Security"
          action={
            !editingPassword ? (
              <button
                type="button"
                onClick={() => setEditPwd(true)}
                style={s.btnOutline}
              >
                Change password
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditPwd(false);
                  setErrors({});
                }}
                style={s.btnOutline}
              >
                Cancel
              </button>
            )
          }
        >
          {!editingPassword ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#888",
                fontSize: "14px",
              }}
            >
              <span style={{ fontSize: "20px" }}>🔒</span>
              Password last changed: never
            </div>
          ) : (
            <>
              <ProfileField
                label="Current password"
                name="currentPassword"
                type="password"
                value={pwdForm.currentPassword}
                onChange={(v) =>
                  setPwdForm((p) => ({ ...p, currentPassword: v }))
                }
                placeholder="••••••••"
              />
              <div style={s.grid2}>
                <ProfileField
                  label="New password"
                  name="newPassword"
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(v) =>
                    setPwdForm((p) => ({ ...p, newPassword: v }))
                  }
                  placeholder="Min 8 characters"
                  hint="Min 8 chars, 1 uppercase, 1 number"
                  error={errors.newPassword}
                />
                <ProfileField
                  label="Confirm new password"
                  name="confirmPassword"
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={(v) =>
                    setPwdForm((p) => ({ ...p, confirmPassword: v }))
                  }
                  placeholder="Re-enter password"
                  error={errors.confirmPassword}
                />
              </div>
              <SaveButton
                onClick={savePassword}
                loading={isSaving("password")}
                label="Update password"
              />
            </>
          )}
        </ProfileCard>
      </div>
    </div>
  );
}

// ── SaveButton — reused in every card ─────────────────
function SaveButton({
  onClick,
  loading = false,
  label = "Save changes",
}: {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        ...profileStyles.btnPrimary,
        opacity: loading ? 0.7 : 1,
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {loading && (
        <svg
          style={{
            width: "14px",
            height: "14px",
            animation: "spin 0.7s linear infinite",
          }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            opacity="0.25"
          />
          <path
            fill="currentColor"
            opacity="0.75"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {loading ? "Saving..." : label}
    </button>
  );
}