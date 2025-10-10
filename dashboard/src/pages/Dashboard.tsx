// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import AlertBanner from "../components/dashboard/AlertBanner";
import StatusCards from "../components/dashboard/StatusCards";
import ActivityStream from "../components/dashboard/ActivityStream";
import SeverityMatrix from "../components/dashboard/SeverityMatrix";
import TrendsChart from "../components/dashboard/TrendsChart";
import HostScorecards from "../components/dashboard/HostScorecards";
import KPIring from "../components/dashboard/KPIring";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  // small mount animation to avoid a flash
  useEffect(() => {
    const t = setTimeout(() => {setMounted(true);}, 40);
    return () => {clearTimeout(t)};
  }, []);

  return (
    <div
      className={`bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white transition-all duration-500 ease-out transform ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {/* Alert Banner */}
      <AlertBanner text="SQL Injection on DB-SRV01 - High" />

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Side */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Status Cards */}
          <StatusCards />

          {/* Activity Stream */}
          <ActivityStream />

          {/* Host Scorecard (bottom left) */}
          <HostScorecards />
        </div>

        {/* Right Side */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <SeverityMatrix />
          <TrendsChart />
          <KPIring />
        </div>
      </div>
    </div>
  );
}
