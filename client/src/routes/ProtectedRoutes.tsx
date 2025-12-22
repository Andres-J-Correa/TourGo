import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "contexts/GlobalAppContext";

const ProtectedRoutes = () => {
  const { user } = useAppContext();

  if (!user.current.isAuthenticated && !user.isLoading) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
