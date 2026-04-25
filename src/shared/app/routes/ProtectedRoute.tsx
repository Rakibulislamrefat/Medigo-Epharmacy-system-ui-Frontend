import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { JSX } from "react";
import type { RootState } from "../../../redux/store";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (isLoading) return null;

  if (!user) {
    //  Save where user came from
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;