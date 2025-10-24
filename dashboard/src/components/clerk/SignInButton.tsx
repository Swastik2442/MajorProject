import { Link } from "react-router";

export default function SignInButton() {
  return (
    <Link to="/login">
      <button className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2 rounded-md transition">
        Sign In
      </button>
    </Link>
  )
}
