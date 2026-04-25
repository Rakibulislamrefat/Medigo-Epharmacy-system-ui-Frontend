import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { JSX } from "react";
import type { RootState } from "../../../redux/store";

const HospitalRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (isLoading) return null;

  if (!user || user.role !== "hospital") {
    return <Navigate to="/hospital/login" state={{ from: location }} replace />;
  }

  return children;
};

export default HospitalRoute;
