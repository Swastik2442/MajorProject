import NetworkBackground from "./NetworkBackground";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

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
    <div className="login-container">
      <NetworkBackground /> {/* Animated background */}

      <div className="login-box">
        <img src="vite.jpeg" alt="Logo" className="login-logo" />

        <h2 className="login-heading">
          NMS <span className="highlight">LOGIN</span>
        </h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />
          <button type="submit" className="login-button">
            LOG IN
          </button>
        </form>

        <a href="/forgot-password" className="forgot-link">
          Forgot Password?
        </a>
      </div>
    </div>
  );
}
