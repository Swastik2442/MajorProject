import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  TopProblematicHostsChart,
  ProblemVsTotalChart,
  DurationOver4HrsChart,
  DurationSplitPieChart
} from "@/components/charts";

export default function ChartsDashboard({ onBack }: { onBack: () => void }) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Dashboard
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon size={18} />
              {date?.from && date?.to
                ? `${date.from.toLocaleDateString()} - ${date.to.toLocaleDateString()}`
                : "Select Date Range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="range" selected={date} onSelect={setDate} numberOfMonths={2} />
          </PopoverContent>
        </Popover>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/60 backdrop-blur-xl border-border">
          <CardHeader><CardTitle>Top 10 Problematic Hosts</CardTitle></CardHeader>
          <CardContent><TopProblematicHostsChart date={date} /></CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-xl border-border">
          <CardHeader><CardTitle>Problem Alerts vs Total Alerts</CardTitle></CardHeader>
          <CardContent><ProblemVsTotalChart date={date} /></CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-xl border-border">
          <CardHeader><CardTitle>Problems with Duration &gt; 4 Hours</CardTitle></CardHeader>
          <CardContent><DurationOver4HrsChart date={date} /></CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-xl border-border">
          <CardHeader><CardTitle>Problem Duration Split</CardTitle></CardHeader>
          <CardContent><DurationSplitPieChart date={date} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
