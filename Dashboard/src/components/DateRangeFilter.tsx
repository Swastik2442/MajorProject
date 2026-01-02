import { useState } from "react";
import {
  subMinutes,
  subHours,
  subDays,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfWeek,
  endOfMonth,
  endOfYear,
  min
} from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, CheckIcon, Clock3, RotateCcwIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";

const quickRanges: { label: string; range: () => Required<DateRange> }[] = [
  { label: "Last 5 minutes", range: () => ({ from: subMinutes(new Date(), 5), to: new Date() }) },
  { label: "Last 15 minutes", range: () => ({ from: subMinutes(new Date(), 15), to: new Date() }) },
  { label: "Last 30 minutes", range: () => ({ from: subMinutes(new Date(), 30), to: new Date() }) },
  { label: "Last 1 hour", range: () => ({ from: subHours(new Date(), 1), to: new Date() }) },
  { label: "Last 3 hours", range: () => ({ from: subHours(new Date(), 3), to: new Date() }) },
  { label: "Last 6 hours", range: () => ({ from: subHours(new Date(), 6), to: new Date() }) },
  { label: "Last 12 hours", range: () => ({ from: subHours(new Date(), 12), to: new Date() }) },
  { label: "Last 1 day", range: () => ({ from: subDays(new Date(), 1), to: new Date() }) },
  { label: "Last 7 days", range: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 days", range: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "This week", range: () => ({ from: startOfWeek(new Date()), to: min([new Date(), endOfWeek(new Date())]) }) },
  { label: "This month", range: () => ({ from: startOfMonth(new Date()), to: min([new Date(), endOfMonth(new Date())]) }) },
  { label: "This year", range: () => ({ from: startOfYear(new Date()), to: min([new Date(), endOfYear(new Date())]) }) },
];

export default function DateRangeFilter({
  dateRange,
  setDateRange
}: {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [openCustom, setOpenCustom] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(quickRanges.length);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* === Trigger Button === */}
      <PopoverTrigger asChild>
      <Button
        className="text-muted-foreground"
        variant="outline"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        <Clock3 size={16} /> Select Time Range
      </Button>
      </PopoverTrigger>

      {/* === Floating Panel (Dropdown) === */}
      <PopoverContent
        side="bottom"
        align="center"
        className="w-auto p-3 bg-card rounded-xl shadow-lg border border-border"
      >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold">Select Date & Time Range</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setOpen(false);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </Button>
          </div>

          {/* === Quick Range Buttons === */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-2 rounded-xl border border-border bg-background/60">
            {quickRanges.map((item, idx) => (
              <Button
                key={item.label}
                variant={idx == selectedIndex ? "default" : "outline"}
                className="text-xs px-2 py-1 hover:scale-[1.02] transition"
                onClick={() => {
                  setSelectedIndex(idx);
                  setDateRange(item.range());
                  setOpen(false);
                }}
              >
                {item.label}
              </Button>
            ))}

            {/* === Custom Range Button === */}
            <Popover modal={false} open={openCustom} onOpenChange={setOpenCustom}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="text-xs px-2 py-1 flex items-center gap-1 hover:bg-accent/40 transition"
                >
                  <CalendarIcon size={14} />
                  Custom Range
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="center"
                className="w-auto p-3 bg-card rounded-xl shadow-lg border border-border"
              >
                <div className="absolute left-3.25 bottom-4.5 z-10 flex flex-col">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:cursor-pointer"
                    aria-label="Clear Selection"
                    onClick={() => {
                      setDateRange(undefined);
                    }}
                  >
                    <RotateCcwIcon />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:cursor-pointer"
                    aria-label="Apply Selection"
                    onClick={() => {
                      setSelectedIndex(quickRanges.length);
                      setOpenCustom(false);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon />
                  </Button>
                </div>
                <DatePicker
                  mode="range"
                  numberOfMonths={2}
                  min={1}
                  excludeDisabled={true}
                  disabled={{ after: new Date() }}
                  selected={dateRange}
                  onSelect={setDateRange}
                />
              </PopoverContent>
            </Popover>
          </div>
      </PopoverContent>
    </Popover>
  );
}
