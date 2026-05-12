import { useEffect, useState } from "react";
import { profileStyles as s } from "../service/ProfileStyle";
import ProfileBadge from "./ProfileBadge";
import CustomButton from "../../../shared/button/CustomButton";

interface ProfileAvatarProps {
  name:            string;
  avatar?:         string;
  bloodType:       string;
  role:            string;
  totalDonations:  number;
  totalReceived:   number;
  isAvailable:     boolean;
  isDonorVerified: boolean;
  onUpload:        () => void;
  errorMessage?:   string;
}

export default function ProfileAvatar({
  name,
  avatar,
  bloodType,
  role,
  totalDonations,
  totalReceived,
  isAvailable,
  isDonorVerified,
  onUpload,
  errorMessage,
}: ProfileAvatarProps) {
  const isDonor = role === "donor";
  const donationLabel = `${totalDonations} donation${totalDonations !== 1 ? "s" : ""}`;
  const receivedLabel = `${totalReceived} received`;
  const metaText = isDonor
    ? `${donationLabel}${totalReceived > 0 ? ` · ${receivedLabel}` : ""}`
    : receivedLabel;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatar]);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const hasAvatar = Boolean(avatar) && !imageFailed;

  return (
    <div style={s.avatarSection}>
      {/* avatar */}
      <div style={s.avatarWrapper}>
        {hasAvatar ? (
          <img
            src={avatar}
            alt={name}
            style={s.avatar}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div style={s.avatarPlaceholder}>{initials}</div>
        )}
        <button
          type="button"
          onClick={onUpload}
          style={s.avatarUploadBtn}
          title={hasAvatar ? "Change photo" : "Upload photo"}
        >
          ✎
        </button>
      </div>
      <div style={s.avatarActions}>
        <CustomButton
          variant="primary"
          size="sm"
          radius="full"
          onClick={onUpload}
          className="w-fit"
        >
          {hasAvatar ? "Change photo" : "Upload photo"}
        </CustomButton>
        <p style={s.avatarHint}>
          {hasAvatar ? "Upload a new photo or click the pencil to edit." : "Add a profile picture to personalize your profile."}
        </p>
      </div>

      {/* info */}
      <div style={s.avatarInfo}>
        <h2 style={s.avatarName}>{name}</h2>
        <p style={s.avatarMeta}>
          {bloodType && `${bloodType}${isDonor ? " donor" : ""} · `}
          {metaText}
        </p>
        {errorMessage ? (
          <p style={s.avatarError}>{errorMessage}</p>
        ) : null}
        <div style={s.badgeRow}>
          {isDonor && isDonorVerified && (
            <ProfileBadge label="Verified donor" color="green" icon="✓" />
          )}
          {isDonor && (
            <ProfileBadge
              label={isAvailable ? "Available" : "Unavailable"}
              color={isAvailable ? "green" : "gray"}
              icon={isAvailable ? "●" : "○"}
            />
          )}
          {bloodType && (
            <ProfileBadge label={bloodType} color="red" icon="🩸" />
          )}
        </div>
      </div>
    </div>
  );
}