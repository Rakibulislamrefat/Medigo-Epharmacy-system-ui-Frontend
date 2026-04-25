import { profileStyles as s } from "../service/ProfileStyle";

interface ProfileCardProps {
  title:       string;
  children:    React.ReactNode;
  action?:     React.ReactNode;
}

export default function ProfileCard({ title, children, action }: ProfileCardProps) {
  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <p style={s.cardTitle}>{title}</p>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}