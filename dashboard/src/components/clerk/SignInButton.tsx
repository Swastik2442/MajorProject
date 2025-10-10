import { useNavigate } from "react-router";

export default function SignInButton() {
  const navigate = useNavigate();
  const handleSignIn = () => void navigate("/login");

  return (
    <button
      className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2 rounded-md transition"
      onClick={handleSignIn}
    >
      Sign In
    </button>
  )
}
