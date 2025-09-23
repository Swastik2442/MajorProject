import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NetworkBackground from "../components/NetworkBackground";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "nms" && password === "nms") {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } else {
      setError("Invalid username or password!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen font-sans relative overflow-hidden">
      <NetworkBackground /> {/* Animated background */}

      <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl w-80 text-center animate-fadeIn">
        <img
          src="vite.jpeg"
          alt="Logo"
          className="w-20 h-20 mb-5 mx-auto rounded-full bg-white/70 p-2 shadow"
        />

        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          NMS <span className="text-green-600">LOGIN</span>
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 mb-4 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg border border-gray-300 bg-white/80 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 p-3 rounded-lg border border-gray-300 bg-white/80 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition"
          >
            LOG IN
          </button>
        </form>

        <a
          href="/forgot-password"
          className="block mt-4 text-sm text-blue-600 hover:text-green-600 hover:underline"
        >
          Forgot Password?
        </a>
      </div>
    </div>
  );
}
