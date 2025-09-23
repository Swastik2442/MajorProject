import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn !== "true") {
      navigate("/");
      return;
    }

    // ✅ Fetch problems from backend
    fetch("http://localhost:5000/api/problems")
      .then((res) => res.json())
      .then((data) => setProblems(data))
      .catch((err) => console.error("Error fetching problems:", err));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Showing data from nms_problems collection</p>

      {/* Show problems */}
      <h2>Problems:</h2>
      <div className="problems-list">
        {problems.length > 0 ? (
          problems.map((problem) => (
            <div className="problem-card" key={problem._id}>
              <h3>{problem.name}</h3>
              <p><strong>ZID:</strong> {problem.zid}</p>
              <p><strong>Status:</strong> {problem.status}</p>
              <p><strong>Severity:</strong> {problem.severity}</p>
              <p><strong>Start:</strong> {problem.start_date} {problem.start_time}</p>
              <p><strong>Recovery:</strong> {problem.recovery_date} {problem.recovery_time}</p>
              <p><strong>Duration:</strong> {problem.duration}</p>
              <p><strong>Host:</strong> {problem.hostname}</p>
            </div>
          ))
        ) : (
          <p>No problems found</p>
        )}
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
