import { useState } from "react";
import { useOrganization } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";
import useClientele from "@/stores/clientele";
import DashboardComponent from "@/components/dashboard";
import Metadata from "@/components/Metadata";
import SetClientele from "@/components/SetClientele";
import ChartsDashboard from "@/components/charts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function Dashboard() {
  const { organization } = useOrganization();
  const clients = useClientele((s) => s.clients);
  const [currentView, setCurrentView] = useState<"Dashboard" | "Charts" | "AI" | (string & {})>("Dashboard");

  const dashboardTitle =
    clients === null
      ? currentView
      : Array.isArray(clients)
      ? `${currentView} - Selected Clients`
      : `${currentView} - ${clients.name}`;

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <Metadata title={`${dashboardTitle} | ${import.meta.env.VITE_APP_TITLE}`} />
        <h1 className="text-2xl font-bold leading-tight">{dashboardTitle}</h1>
        <div className="flex items-center gap-2">
          <Select defaultValue="Dashboard" onValueChange={setCurrentView}>
            <SelectTrigger>
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dashboard">Dashboard</SelectItem>
              <SelectItem value="Charts">Charts</SelectItem>
              <SelectItem value="AI">AI</SelectItem>
            </SelectContent>
          </Select>

          <SetClientele />
        </div>
      </div>

      <div className="relative w-full min-h-screen no-scrollbar">
        <AnimatePresence mode="wait" initial={false}>
          {currentView === "Dashboard" && (
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
          {currentView === "Charts" && (
            <motion.div
              key="charts-dashboard"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 70, damping: 20 }}
            >
              <ChartsDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
