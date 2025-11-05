import { create } from 'zustand';
import type { DateRange } from "react-day-picker";
import type { TTimeIntervalParam } from '@/schemas/api';

export type DateRangeState = {
  range: DateRange | undefined;
  interval: TTimeIntervalParam | undefined;
};
export type DateRangeActions = {
  setRange: (range: DateRange | undefined) => void;
  setInterval: (interval: TTimeIntervalParam | undefined) => void;
};
export type DateRangeStore = DateRangeState & DateRangeActions;

export const useDateRange = create<DateRangeStore>((set) => ({
  range: undefined,
  interval: undefined,
  setRange: (range) => {set({ range })},
  setInterval: (interval) => {set({ interval })},
}));

export default useDateRange;
