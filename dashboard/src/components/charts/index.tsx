import { useState } from "react";
import { addDays } from "date-fns";
import type { DateRange } from "react-day-picker";

import DateRangeFilter from "@/components/DateRangeFilter"; // ✅ new Zabbix-style date/time filter
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import TopProblematicHostsChart from "@/components/charts/TopProblematicHostsChart";
import DurationOver4HrsChart from "@/components/charts/DurationOver4HrsChart";
import DurationSplitPieChart from "@/components/charts/DurationSplitPieChart";
import ProblemVsTotalChart from "@/components/charts/ProblemVsTotalChart";

export default function Charts() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  return (
    <div className="relative w-full min-h-screen p-4 md:p-6 space-y-6 overflow-visible bg-background text-foreground">
      {/* === Top Bar === */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-20 bg-background/80 backdrop-blur-md pb-2 border-b border-border">
        <div></div>
        {/* === Date / Time Range Filter === */}
        <div className="w-full md:w-auto">
          <DateRangeFilter date={date} setDate={setDate} />
        </div>
      </div>

      {/* === Charts Grid === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {/* Top Problematic Hosts */}
        <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle>Top 10 Problematic Hosts</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProblematicHostsChart date={date} />
          </CardContent>
        </Card>

        {/* Problem vs Total */}
        <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle>Problem Alerts vs Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ProblemVsTotalChart date={date} />
          </CardContent>
        </Card>

        {/* Duration > 4 Hours */}
        <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle>Problems with Duration &gt; 4 Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <DurationOver4HrsChart date={date} />
          </CardContent>
        </Card>

        {/* Duration Split (Pie) */}
        <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle>Problem Duration Split</CardTitle>
          </CardHeader>
          <CardContent>
            <DurationSplitPieChart date={date} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
