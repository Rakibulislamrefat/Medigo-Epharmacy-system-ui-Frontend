import api from "../../../utilities/api";
import { type IReduxUser } from "../../../redux/slices/userSlice";

type UnknownRecord = Record<string, unknown>;

interface UserApiEnvelope {
  data?: unknown;
  user?: unknown;
  profile?: unknown;
  donorProfile?: unknown;
  message?: string;
}

// Extended to include all fields that extractUser returns and
// createProfileForm reads — these may be absent from IReduxUser's type.
export type ProfileApiUser = IReduxUser & {
  age?: number | null;
  weight?: number | null;
  gender?: "male" | "female" | null;
  dateOfBirth?: string | null;
  bloodType?: IReduxUser["bloodType"];
  isAvailable?: boolean;
  isDonorVerified?: boolean;
  totalDonations?: number;
  lastDonationDate?: string | null;
  totalReceived?: number;
  lastReceivedDate?: string | null;
  avatar?: string;
  socialLinks?: {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
  };
  location?: IReduxUser["location"];
};

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  bloodType?: IReduxUser["bloodType"];
  gender?: IReduxUser["gender"] | null;
  age?: number | null;
  weight?: number | null;
  dateOfBirth?: string | null;
  isAvailable?: boolean;
  location?: IReduxUser["location"];
  socialLinks?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
  };
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

const buildSocialUrl = (value: string | null | undefined, baseUrl: string) => {
  if (!value?.trim()) return null;
  const normalizedValue = value.trim();
  if (
    normalizedValue.includes(".com/") ||
    normalizedValue.includes("facebook.com/") ||
    normalizedValue.includes("instagram.com/") ||
    normalizedValue.includes("x.com/")
  ) {
    return normalizedValue.startsWith("http")
      ? normalizedValue
      : `https://${normalizedValue}`;
  }

  return `${baseUrl}/${normalizedValue.replace(/^@/, "")}`;
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const asNullableNumber = (value: unknown): number | null => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

const normalizeGender = (value: unknown): "male" | "female" | null => {
  const normalizedValue = asString(value)?.trim().toLowerCase();
  if (normalizedValue === "male" || normalizedValue === "female") {
    return normalizedValue;
  }

  return null;
};

const normalizeDateStr = (value: unknown): string | null => {
  const stringValue = asString(value)?.trim();
  if (!stringValue) return null;
  return stringValue.includes("T") ? stringValue.split("T")[0] : stringValue;
};

const extractSocialLinks = (
  ...sources: Array<unknown>
): { facebook: string | null; instagram: string | null; twitter: string | null } | undefined => {
  for (const source of sources) {
    if (!isRecord(source)) continue;

    const socialLinksSource = isRecord(source.socialLinks)
      ? source.socialLinks
      : isRecord(source.socialMediaLinks)
        ? source.socialMediaLinks
        : source;

    const facebook = asString(socialLinksSource.facebook) ?? null;
    const instagram = asString(socialLinksSource.instagram) ?? null;
    const twitter =
      asString(socialLinksSource.twitter) ??
      asString(socialLinksSource.x) ??
      null;

    if (facebook !== null || instagram !== null || twitter !== null) {
      return { facebook, instagram, twitter };
    }
  }

  return undefined;
};

const extractUser = (payload: UserApiEnvelope): ProfileApiUser => {
  const payloadRecord = isRecord(payload) ? payload : {};
  const dataRecord = isRecord(payloadRecord.data) ? payloadRecord.data : undefined;

  const baseUser =
    (isRecord(payloadRecord.user) ? payloadRecord.user : undefined) ??
    (dataRecord && isRecord(dataRecord.user) ? dataRecord.user : undefined) ??
    (dataRecord && "_id" in dataRecord && "email" in dataRecord ? dataRecord : undefined) ??
    // Fallback: treat the root payload itself as the user object
    (isRecord(payloadRecord) && "_id" in payloadRecord && "email" in payloadRecord
      ? payloadRecord
      : undefined);

  if (!baseUser) {
    throw new Error("Invalid profile response");
  }

  const nestedProfile: UnknownRecord | undefined =
    (dataRecord && isRecord(dataRecord.profile) ? dataRecord.profile : undefined) ??
    (dataRecord && isRecord(dataRecord.donorProfile) ? dataRecord.donorProfile : undefined) ??
    (isRecord(payloadRecord.profile) ? payloadRecord.profile : undefined) ??
    (isRecord(payloadRecord.donorProfile) ? payloadRecord.donorProfile : undefined) ??
    (isRecord(baseUser.profile) ? baseUser.profile : undefined) ??
    (isRecord(baseUser.donorProfile) ? baseUser.donorProfile : undefined);

  // Social links: check nested profile, then data record, then baseUser.socialLinks, then baseUser itself
  const socialLinks =
    extractSocialLinks(
      nestedProfile,
      dataRecord,
      isRecord(baseUser.socialLinks) ? baseUser.socialLinks : undefined,
      baseUser,
      payloadRecord,
    ) ?? { facebook: null, instagram: null, twitter: null };

  const location =
    (nestedProfile && isRecord(nestedProfile.location) ? nestedProfile.location : undefined) ??
    (dataRecord && isRecord(dataRecord.location) ? dataRecord.location : undefined) ??
    (isRecord(baseUser.location) ? baseUser.location : undefined);

  // Resolve scalar fields: prefer nestedProfile, fall back to baseUser
  const gender =
    normalizeGender(nestedProfile?.gender) ??
    normalizeGender(baseUser.gender);

  const age =
    asNullableNumber(nestedProfile?.age) ??
    asNullableNumber(baseUser.age);

  const weight =
    asNullableNumber(nestedProfile?.weight) ??
    asNullableNumber(baseUser.weight);

  const dateOfBirth =
    normalizeDateStr(nestedProfile?.dateOfBirth) ??
    normalizeDateStr(baseUser.dateOfBirth);

  const bloodType =
    (asString(nestedProfile?.bloodType) as IReduxUser["bloodType"]) ??
    (asString(baseUser.bloodType) as IReduxUser["bloodType"]) ??
    null;

  const isAvailable =
    typeof nestedProfile?.isAvailable === "boolean"
      ? nestedProfile.isAvailable
      : typeof baseUser.isAvailable === "boolean"
        ? baseUser.isAvailable
        : false;

  const totalDonations =
    asNullableNumber(nestedProfile?.totalDonations) ??
    asNullableNumber(baseUser.totalDonations) ??
    0;

  const lastDonationDate =
    normalizeDateStr(nestedProfile?.lastDonationDate) ??
    normalizeDateStr(baseUser.lastDonationDate);

  const totalReceived =
    asNullableNumber(nestedProfile?.totalReceived) ??
    asNullableNumber(baseUser.totalReceived) ??
    0;

  const lastReceivedDate =
    normalizeDateStr(nestedProfile?.lastReceivedDate) ??
    normalizeDateStr(baseUser.lastReceivedDate);

  const isDonorVerified =
    typeof nestedProfile?.isDonorVerified === "boolean"
      ? nestedProfile.isDonorVerified
      : typeof baseUser.isDonorVerified === "boolean"
        ? baseUser.isDonorVerified
        : false;

  const avatar =
    asString(nestedProfile?.avatar) ??
    asString(baseUser.avatar) ??
    "";

  return {
    ...(baseUser as unknown as IReduxUser),
    bloodType,
    gender,
    age,
    weight,
    dateOfBirth,
    socialLinks,
    location: (location as IReduxUser["location"]) ?? (baseUser.location as IReduxUser["location"]),
    isAvailable,
    totalDonations,
    lastDonationDate,
    totalReceived,
    lastReceivedDate,
    isDonorVerified,
    avatar,
  };
};

export const getProfileApi = async (): Promise<ProfileApiUser> => {
  const res = await api.get("/auth/me");
  
  return extractUser(res.data as UserApiEnvelope);
};

export const updateProfileApi = async (
  payload: ProfileUpdatePayload,
): Promise<ProfileApiUser> => {
  const normalizedPayload = {
    ...payload,
    socialLinks: payload.socialLinks
      ? {
          facebook: buildSocialUrl(
            payload.socialLinks.facebook,
            "https://facebook.com",
          ),
          instagram: buildSocialUrl(
            payload.socialLinks.instagram,
            "https://instagram.com",
          ),
          twitter: buildSocialUrl(
            payload.socialLinks.twitter,
            "https://x.com",
          ),
        }
      : undefined,
  };

  const res = await api.patch("/auth/me", normalizedPayload);
  return extractUser(res.data as UserApiEnvelope);
};

export const changePasswordApi = async (
  payload: ChangePasswordPayload,
): Promise<string> => {
  const res = await api.post("/auth/change-password", payload);
  const data = res.data as { message?: string; data?: { message?: string } };
  return data.message ?? data.data?.message ?? "Password updated successfully";
};