import { useShallow } from "zustand/shallow";
import type { TClientsParams } from "@/schemas/api";
import useDateRange from "@/stores/dateRange";
import TopProblematicHostsChart from "@/components/charts/TopProblematicHostsChart";
import DurationOverThresholdChart from "@/components/charts/DurationOverThresholdChart";
import DurationSplitPieChart from "@/components/charts/DurationSplitPieChart";
import ProblemVsTotalChart from "@/components/charts/ProblemVsTotalChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function Charts({ client_id = null, org_id = null }: TClientsParams) {
  const { dateRange, interval } = useDateRange(useShallow((s) => ({
    dateRange: s.range,
    interval: s.interval
  })));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Problematic Hosts */}
      <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="uppercase">Top 10 Problematic Hosts</CardTitle>
        </CardHeader>
        <CardContent>
          <TopProblematicHostsChart client_id={client_id} org_id={org_id} dateRange={dateRange} />
        </CardContent>
      </Card>

      {/* Problem vs Total */}
      <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="uppercase">Problem Alerts vs Total Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <ProblemVsTotalChart client_id={client_id} org_id={org_id} dateRange={dateRange} interval={interval} />
        </CardContent>
      </Card>

      {/* TODO: Add Threshold changing option */}
      {/* Duration > 4 Hours */}
      <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="uppercase">Problems with Duration &gt; 4 Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <DurationOverThresholdChart client_id={client_id} org_id={org_id} dateRange={dateRange} />
        </CardContent>
      </Card>

      {/* Duration Split (Pie) */}
      <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="uppercase">Problem Duration Split</CardTitle>
        </CardHeader>
        <CardContent>
          <DurationSplitPieChart client_id={client_id} org_id={org_id} dateRange={dateRange} />
        </CardContent>
      </Card>
    </div>
  );
}
