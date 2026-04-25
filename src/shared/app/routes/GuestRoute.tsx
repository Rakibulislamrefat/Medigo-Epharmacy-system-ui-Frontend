import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import type { JSX } from "react";

const GuestRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (isLoading) return null;

  if (user) {
    // redirect back to previous page OR home
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return children;
};

export default GuestRoute;