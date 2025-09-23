import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../providers/authProvider';

export default function PrivateRoutes() {
  const { user } = useAuth();
  return (
    user === null ? <Navigate to="/login" /> : <Outlet />
  );
}
