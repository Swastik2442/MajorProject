import useDateRange from "@/stores/dateRange";
import TopProblematicHostsChart from "@/components/charts/TopProblematicHostsChart";
import DurationOver4HrsChart from "@/components/charts/DurationOver4HrsChart";
import DurationSplitPieChart from "@/components/charts/DurationSplitPieChart";
import ProblemVsTotalChart from "@/components/charts/ProblemVsTotalChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function Charts() {
  const dateRange = useDateRange((s) => s.range);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Problematic Hosts */}
      <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="uppercase">Top 10 Problematic Hosts</CardTitle>
        </CardHeader>
        <CardContent>
          <TopProblematicHostsChart date={dateRange} />
        </CardContent>
      </Card>

      {/* Problem vs Total */}
      <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="uppercase">Problem Alerts vs Total Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <ProblemVsTotalChart date={dateRange} />
        </CardContent>
      </Card>

      {/* Duration > 4 Hours */}
      <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="uppercase">Problems with Duration &gt; 4 Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <DurationOver4HrsChart date={dateRange} />
        </CardContent>
      </Card>

      {/* Duration Split (Pie) */}
      <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="uppercase">Problem Duration Split</CardTitle>
        </CardHeader>
        <CardContent>
          <DurationSplitPieChart date={dateRange} />
        </CardContent>
      </Card>
    </div>
  );
}
