import { useUser } from "@clerk/react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  if (user?.id !== import.meta.env.VITE_ADMIN_USER_ID) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;