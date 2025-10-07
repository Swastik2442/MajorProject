import { useNavigate } from "react-router";
import { useMutation } from '@tanstack/react-query';
import { useAuth } from "../providers/authProvider.js";

export default function LogoutButton() {
  const navigate = useNavigate();

  const { logoutUser } = useAuth();
  const { mutate: handleLogout } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => navigate("/")
  });

  return (
      <button
        className="px-6 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-900 transition"
        aria-label="Logout"
        onClick={() => {handleLogout()}}
        type="button"
      >
        Logout
      </button>
  );
}
