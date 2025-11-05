import { useState, useRef, useEffect } from "react";
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
} from "date-fns";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock3, X } from "lucide-react";

interface DateRangeFilterProps {
  date: DateRange | undefined;
  setDate: (range: DateRange | undefined) => void;
}

export default function DateRangeFilter({ date, setDate }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [openCustom, setOpenCustom] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // ✅ Handle click outside dropdown (fixed lint rule)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return (): void => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // ✅ Correct range definitions
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
    { label: "This week", range: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }) },
    { label: "This month", range: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: "This year", range: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
  ];

  return (
    <div className="relative">
      {/* === Trigger Button === */}
      <Button
        variant="outline"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md transition"
      >
        <Clock3 size={16} /> Select Time Range
      </Button>

      {/* === Floating Panel (Dropdown) === */}
      {open && (
        <div
          ref={ref}
          className="absolute right-0 mt-2 z-40 w-[640px] max-w-[95vw] bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-5 animate-fadeIn"
        >
          <div className="flex justify-between items-center mb-4">
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
            {quickRanges.map((item) => {
              const range = item.range();
              const isActive =
                date?.from &&
                date?.to &&
                range.from &&
                range.to &&
                date.from.toDateString() === range.from.toDateString() &&
                date.to.toDateString() === range.to.toDateString();

              return (
                <Button
                  key={item.label}
                  variant={isActive ? "default" : "outline"}
                  className="text-xs px-2 py-1 hover:scale-[1.02] transition"
                  onClick={() => {
                    setDate(range);
                    setOpen(false);
                  }}
                >
                  {item.label}
                </Button>
              );
            })}

            {/* === Custom Range Button === */}
            <Popover open={openCustom} onOpenChange={setOpenCustom}>
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
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={date}
                  onSelect={(d) => {
                    setDate(d);
                    setOpenCustom(false);
                    setOpen(false);
                  }}
                  className="rounded-md bg-background"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
}
