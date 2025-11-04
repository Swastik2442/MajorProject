import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Dashboard from "@/pages/Dashboard";
import ChartsDashboard from "@/pages/ChartsDashboard";

export default function DashboardContainer() {
  const [showCharts, setShowCharts] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-background text-foreground overflow-y-auto">

      <AnimatePresence mode="wait" initial={false}>
        {!showCharts ? (
          <motion.div
            key="main-dashboard"
            initial={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 70, damping: 20 }}
            className="absolute inset-0 w-full h-full overflow-y-auto"
          >
            <Dashboard onShowCharts={() => setShowCharts(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="charts-dashboard"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 20 }}
            className="absolute inset-0 w-full h-full overflow-y-auto"
          >
            <ChartsDashboard onBack={() => setShowCharts(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
