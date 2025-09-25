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
          <StatusCards />
          <ActivityStream />
        </div>

        {/* Right column */}
        <div className="col-span-5 space-y-6">
          <SeverityMatrix />
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <TrendsChart />
            </div>
            <div className="col-span-1">
              <KPIring />
            </div>
          </div>
          <HostScorecards />
        </div>
      </div>
    </div>
  );
}
