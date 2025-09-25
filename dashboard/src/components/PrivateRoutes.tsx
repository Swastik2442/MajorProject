import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../providers/authProvider';

export default function PrivateRoutes() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user === null) {
    navigate("/login");
  }
  return <Outlet />;
}
