import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { JSX } from "react";
import type { RootState } from "../../../redux/store";
import BuildInLoader from "../../loader/BuildInLoader";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (isLoading) return <BuildInLoader />;

  // In development, allow a persisted admin user to bypass login for local testing.
  if (!user) {
    try {
      // Allow a development-only bypass for admin routes when testing locally.
      if (import.meta.env.DEV && location.pathname.startsWith("/admin")) {
        return children;
      }

      const persisted = localStorage.getItem("persist:user");
      if (persisted) {
        const parsed = JSON.parse(persisted);
        const maybeUser = parsed?.user ? JSON.parse(parsed.user) : null;
        if (maybeUser && maybeUser.role === "admin" && import.meta.env.DEV) {
          return children;
        }
      }
    } catch (e) {
      // ignore parse errors
    }

    //  Save where user came from
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
