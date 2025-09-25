import { useQuery } from "@tanstack/react-query";
import LogoutButton from "../components/LogoutButton.jsx";

// Dashboard components
import LoadingSpinner from "../components/dashboard/LoadingSpinner.jsx";
import AlertBanner from "../components/dashboard/AlertBanner.jsx";
import StatusCards from "../components/dashboard/StatusCards.jsx";
import ActivityStream from "../components/dashboard/ActivityStream.jsx";
import SeverityMatrix from "../components/dashboard/SeverityMatrix.jsx";
import TrendsChart from "../components/dashboard/TrendsChart.jsx";
import HostScorecards from "../components/dashboard/HostScorecards.jsx";
import KPIring from "../components/dashboard/KPIring.jsx";

// Local utilities
import {
  normalizeProblems,
  computeHostScores,
  computeSeverityMatrix,
  compute24hTrends,
} from "../utils/tranform.js";

// Fetch problems from backend
async function getProblems() {
  const response = await fetch("http://localhost:5000/api/problems");
  if (!response.ok) {
    throw new Error("Error fetching problems: " + response.statusText);
  }
  return response.json();
}

export default function Dashboard() {
  const { data, isError, error, isPending } = useQuery({
    queryKey: ["problems"],
    queryFn: getProblems,
  });

  if (isPending) {
    return (
      <div className="p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-red-500">
        Error loading problems: {error.message}
      </div>
    );
  }

  // --- Transform data ---
  const problems = normalizeProblems(data || []);
  const hostScores = computeHostScores(problems);
  const severityMatrix = computeSeverityMatrix(problems);
  const trends = compute24hTrends(problems);

  const totalActive = problems.filter((p) => p.isActive).length;
  const totalToday = problems.filter((p) => {
    if (!p.startAt) return false;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return p.startAt >= start;
  }).length;
  const resolvedCount = problems.filter((p) =>
    /recover/i.test(String(p.status))
  ).length;
  const resolutionRate = problems.length
    ? Math.round((resolvedCount / problems.length) * 100)
    : 0;

  // Pick a few problems for the activity stream
  const activityItems = problems.slice(0, 6).map((p) => ({
    id: p.id,
    message: p.message?.slice(0, 70) || "No message",
    host: p.host,
    severity: p.severity,
    startAt: p.startAt,
    durationSeconds: p.durationSeconds,
    spark: Array.from({ length: 6 }, () =>
      Math.round(Math.random() * 3)
    ), // placeholder sparkline
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">
          Unified Operations & Predictive Insight Dashboard
        </h1>
        <LogoutButton />
      </div>

      {/* Critical Alert Banner */}
      <AlertBanner text="CRITICAL SECURITY ALERT: ACTIVE! SQL Injection on DB-SRV01 - High Packet Loss" />

      {/* Layout grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-7 space-y-6">
          <StatusCards
            totalActive={totalActive}
            totalToday={totalToday}
          />
          <ActivityStream items={activityItems} />
        </div>

        {/* Right column */}
        <div className="col-span-5 space-y-6">
          <SeverityMatrix data={severityMatrix} />
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <TrendsChart data={trends} />
            </div>
            <div className="col-span-1">
              <KPIring percent={resolutionRate} label="Resolved" />
            </div>
          </div>
          <HostScorecards hosts={hostScores} />
        </div>
      </div>
    </div>
  );
}
