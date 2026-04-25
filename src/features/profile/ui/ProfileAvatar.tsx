import { profileStyles as s } from "../service/ProfileStyle";
import ProfileBadge from "./ProfileBadge";

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
}: ProfileAvatarProps) {
  const isDonor = role === "donor";
  const donationLabel = `${totalDonations} donation${totalDonations !== 1 ? "s" : ""}`;
  const receivedLabel = `${totalReceived} received`;
  const metaText = isDonor
    ? `${donationLabel}${totalReceived > 0 ? ` · ${receivedLabel}` : ""}`
    : receivedLabel;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div style={s.avatarSection}>
      {/* avatar */}
      <div style={s.avatarWrapper}>
        {avatar ? (
          <img src={avatar} alt={name} style={s.avatar} />
        ) : (
          <div style={s.avatarPlaceholder}>{initials}</div>
        )}
        <button
          type="button"
          onClick={onUpload}
          style={s.avatarUploadBtn}
          title="Change photo"
        >
          ✎
        </button>
      </div>

      {/* info */}
      <div style={s.avatarInfo}>
        <h2 style={s.avatarName}>{name}</h2>
        <p style={s.avatarMeta}>
          {bloodType && `${bloodType}${isDonor ? " donor" : ""} · `}
          {metaText}
        </p>
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