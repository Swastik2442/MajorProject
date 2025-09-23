import { useNavigate } from "react-router-dom";
import { useMutation } from '@tanstack/react-query';
import { useAuth } from "../providers/authProvider.jsx";

export default function LogoutButton() {
  const navigate = useNavigate();

  const { logoutUser } = useAuth();
  const { mutate: handleLogout } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => navigate("/")
  });

  return (
      <button
        onClick={handleLogout}
        className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-900 transition"
      >
        Logout
      </button>
  );
}
