import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import type { JSX } from "react";

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (isLoading) return null;

  if (!user) {
    // Development convenience: allow bypass when localStorage.DEV_ADMIN === '1'
    // This avoids needing a backend-authenticated admin while testing locally.
    try {
      if (import.meta.env.DEV && typeof window !== "undefined") {
        const dev = window.localStorage.getItem("DEV_ADMIN");
        if (dev === "1") {
          return children;
        }
      }
    } catch {}

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
