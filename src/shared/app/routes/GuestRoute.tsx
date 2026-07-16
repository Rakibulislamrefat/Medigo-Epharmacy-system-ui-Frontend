import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import type { JSX } from "react";
import BuildInLoader from "../../loader/BuildInLoader";

const GuestRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (isLoading) return <BuildInLoader />;

  if (user) {
    const normalizedRole = user.role?.toLowerCase();
    const roleRedirect =
      normalizedRole === "admin"
        ? "/admin"
        : normalizedRole === "pharmacist"
        ? "/pharmacist"
        : undefined;
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={roleRedirect ?? from} replace />;
  }

  return children;
};

export default GuestRoute;
