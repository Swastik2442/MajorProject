import { useState } from "react";
import { addDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
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

  const formatted =
    date?.from && date.to
      ? `${format(date.from, "dd/MM/yyyy")} - ${format(date.to, "dd/MM/yyyy")}`
      : "Select Date Range";

  return (
    <div className="relative w-full min-h-screen p-4 md:p-6 space-y-6 overflow-visible">
      {/* === Top Bar === */}
      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md transition"
          >
            <CalendarIcon size={18} />
            {formatted}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="p-3 bg-card shadow-xl border border-border rounded-xl w-fit mx-auto"
        >
          <div className="flex justify-center items-center">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={date}
              onSelect={setDate}
              className="rounded-lg border-none bg-background text-foreground"
            />
          </div>
        </PopoverContent>
      </Popover>

      {/* === Charts Grid === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        {/* Top Problematic Hosts */}
        <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle>Top 10 Problematic Hosts</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProblematicHostsChart date={date} />
          </CardContent>
        </Card>

        {/* Problems Over Time */}
        <Card className="bg-card/70 backdrop-blur-lg border-border shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle>Problems Over Time</CardTitle>
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
