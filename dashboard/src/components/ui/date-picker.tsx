import { DayPicker, type DayPickerProps } from "react-day-picker";
import "react-day-picker/style.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type DatePickerProps = DayPickerProps;

const PreviousMonthButton = (props: React.ComponentPropsWithoutRef<"button">) => (
  <Button variant="ghost" size="icon" {...props}>
    <ChevronLeft />
  </Button>
);
const NextMonthButton = (props: React.ComponentPropsWithoutRef<"button">) => (
  <Button variant="ghost" size="icon" {...props}>
    <ChevronRight />
  </Button>
);

export function DatePicker({
  classNames,
  showOutsideDays = true,
  ...props
}: DatePickerProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      classNames={{
        month_caption: "flex justify-center h-[2.75rem] font-medium",
        nav: "flex flex-col",
        button_previous: "hover:cursor-pointer",
        button_next: "hover:cursor-pointer",
        ...classNames,
      }}
      components={{
        PreviousMonthButton,
        NextMonthButton,
      } as unknown as DayPickerProps["components"]}
      {...props}
    />
  );
}
