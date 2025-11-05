import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import type { TClientsParams } from "@/schemas/api";
import useDateRange from "@/stores/dateRange";
import StatusCards from "./StatusCards";
import ActivityStream from "./ActivityStream";
import SeverityMatrix from "./SeverityMatrix";
import TrendsChart from "./TrendsChart";
import HostScorecards from "./HostScorecards";
import KPIring from "./KPIring";

export default function Dashboard({ client_id = null, org_id = null }: TClientsParams) {
  const [mounted, setMounted] = useState(false);
  const { dateRange, interval } = useDateRange(useShallow((s) => ({
    dateRange: s.range,
    interval: s.interval
  })));

  // small mount animation to avoid a flash
  useEffect(() => {
    const t = setTimeout(() => {setMounted(true);}, 40);
    return () => {clearTimeout(t)};
  }, []);

  return (
    <div
      className={`transition-all duration-500 ease-out transform ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Side */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Status Cards */}
          <StatusCards client_id={client_id} org_id={org_id} />

          {/* Activity Stream */}
          <ActivityStream client_id={client_id} org_id={org_id} />

          {/* Host Scorecard (bottom left) */}
          <HostScorecards client_id={client_id} org_id={org_id} />
        </div>

        {/* Right Side */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <TrendsChart client_id={client_id} org_id={org_id} dateRange={dateRange} interval={interval} />
          <SeverityMatrix />
          <KPIring client_id={client_id} org_id={org_id} />
        </div>
      </div>
    </div>
  );
}
