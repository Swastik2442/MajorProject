import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../providers/authProvider.js";
import NetworkBackground from "../components/NetworkBackground.js";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser } = useAuth();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: loginUser,
    onSuccess: () => navigate("/"),
  });

  const handleLogin: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    mutate({ username, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen font-sans relative overflow-hidden bg-[#0a0f1c]">
      <NetworkBackground />

      <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_0_40px_rgba(0,255,200,0.1)] w-80 text-center border border-white/20 animate-fadeIn relative z-10 transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,255,255,0.3)]">
        <img
          src="logo.jpeg"
          alt="Logo"
          className="w-20 h-20 mb-5 mx-auto rounded-full bg-white/20 p-2 shadow-lg"
        />

        <h2 className="text-2xl font-semibold mb-6 text-white tracking-wide">
          NMS <span className="text-cyan-400">LOGIN</span>
        </h2>

        {isError && (
          <div className="bg-red-500/20 text-red-300 px-3 py-2 mb-4 rounded text-sm border border-red-400/30">
            {error.message}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 outline-none transition-all duration-200"
            disabled={isPending}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 p-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 outline-none transition-all duration-200"
            disabled={isPending}
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transform hover:-translate-y-0.5 transition-all duration-300"
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "LOG IN"}
          </button>
        </form>

        <a
          href="/forgot-password"
          className="block mt-4 text-sm text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
        >
          Forgot Password?
        </a>
      </div>
    </div>
  );
}
