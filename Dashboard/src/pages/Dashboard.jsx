import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn !== "true") {
      navigate("/");
      return;
    }

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 text-center animate-fadeIn">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-600 my-4">
        Showing data from <span className="font-medium">nms_problems</span> collection
      </p>

      <h2 className="text-xl font-semibold mb-4">Problems:</h2>
      <div className="grid gap-4 w-full max-w-3xl">
        {problems.length > 0 ? (
          problems.map((problem) => (
            <div
              key={problem._id}
              className="bg-white p-4 rounded-xl shadow-md text-left border hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg mb-2">{problem.name}</h3>
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
          <p className="text-gray-500">No problems found</p>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-900 transition"
      >
        Logout
      </button>
    </div>
  );
}
