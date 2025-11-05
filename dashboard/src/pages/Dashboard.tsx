import { useState } from "react";
import { useOrganization } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";
import { useShallow } from "zustand/shallow";
import useClientele from "@/stores/clientele";
import useDateRange from "@/stores/dateRange";
import DashboardComponent from "@/components/dashboard";
import AlertBanner from "@/components/AlertBanner";
import Metadata from "@/components/Metadata";
import SetClientele from "@/components/SetClientele";
import ChartsDashboard from "@/components/charts";
import DateRangeFilter from "@/components/DateRangeFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const Views = ["Dashboard", "Charts", "AI"] as const;
type View = (typeof Views)[number];

const SelectView = ({ view, setView }: {
  view: View;
  setView: (view: View) => void;
}) => (
  <Select value={view} onValueChange={(v) => {
    if (!Views.includes(v as View)) throw new Error(`Invalid view selected: ${v}`);
    setView(v as View);
  }}>
    <SelectTrigger className="w-32">
      <SelectValue placeholder="View" />
    </SelectTrigger>
    <SelectContent>
      {Views.map((view) => (
        <SelectItem key={view} value={view}>
          {view}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default function Dashboard() {
  const [view, setView] = useState<View>("Dashboard");
  const { organization } = useOrganization();
  const clients = useClientele((s) => s.clients);
  const { dateRange, setDateRange } = useDateRange(useShallow((s) => ({
    dateRange: s.range,
    setDateRange: s.setRange
  })));

  const pageTitle =
    clients === null
      ? view
      : Array.isArray(clients)
      ? `${view} - Selected Clients`
      : `${view} - ${clients.name}`;

  const clientIds =
    Array.isArray(clients)
      ? clients.map((c) => c._id).filter((id): id is string => id != null)
      : (clients?._id ?? null);
  const organizationId =
    clients === null ||
    (Array.isArray(clients) && clients.length === 0)
      ? (organization?.id ?? null)
      : null;

  return (
    <>
      <Metadata title={`${pageTitle} | ${import.meta.env.VITE_APP_TITLE}`} />

      {/* Top Navigation Bar */}
      <nav className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <SelectView view={view} setView={setView} />
          <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
        </div>
        <SetClientele />
      </nav>

      <div className="relative w-full min-h-screen no-scrollbar">
        {/* Alert Banner */}
        <AlertBanner text="SQL Injection on DB-SRV01 - High" />

        {/* View Switcher */}
        <AnimatePresence mode="wait" initial={false}>
          {view === "Dashboard" && (
            <motion.div
              key="main-dashboard"
              initial={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 70, damping: 20 }}
            >
              <DashboardComponent client_id={clientIds} org_id={organizationId} />
            </motion.div>
          )}
          {view === "Charts" && (
            <motion.div
              key="charts-dashboard"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 70, damping: 20 }}
            >
              <ChartsDashboard client_id={clientIds} org_id={organizationId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
