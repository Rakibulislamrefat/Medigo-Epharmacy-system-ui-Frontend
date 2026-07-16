import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import type { JSX } from "react";

const PharmacistRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (isLoading) return null;

  if (!user) {
    try {
      if (import.meta.env.DEV && typeof window !== "undefined") {
        const dev = window.localStorage.getItem("DEV_PHARMACIST");
        if (dev === "1") {
          return children;
        }
      }
    } catch {}

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const normalizedRole = user.role?.toLowerCase();

  if (normalizedRole !== "pharmacist") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PharmacistRoute;
