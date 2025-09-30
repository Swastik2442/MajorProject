import LogoutButton from "../components/LogoutButton";
import AlertBanner from "../components/dashboard/AlertBanner";
import StatusCards from "../components/dashboard/StatusCards";
import ActivityStream from "../components/dashboard/ActivityStream";
import SeverityMatrix from "../components/dashboard/SeverityMatrix";
import TrendsChart from "../components/dashboard/TrendsChart";
import HostScorecards from "../components/dashboard/HostScorecards";
import KPIring from "../components/dashboard/KPIring";

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6">
        Unified Operations & Predictive Insight Dashboard
      </h1>

      {/* Alert Banner */}
      <div className="mb-6 rounded-xl bg-red-600/90 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span className="font-medium">
            CRITICAL SECURITY ALERT: ACTIVE! SQL Injection on DB-SRV01 – High
            Packet Loss
          </span>
        </div>
        <button className="text-white/70 hover:text-white">✕</button>
      </div>

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