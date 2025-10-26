import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { TClientsParams } from "@/schemas/api";
import { apiService } from "@/services/api";

export default function StatusCards({ client_id = null, org_id = null }: TClientsParams) {
  const { data } = useQuery({
    queryKey: ["alertsCount", client_id, org_id],
    queryFn: () => apiService.fetchCommonAlertsCount({ client_id, org_id }),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const counts = data?.data ? {
    totalActiveProblems: data.data.problems.totalActiveProblems + data.data.services.totalActiveProblems,
    activeProblemsInLast24Hours: data.data.problems.activeProblemsInLast24Hours + data.data.services.activeProblemsInLast24Hours,
    problemsInLast24Hours: data.data.problems.problemsInLast24Hours + data.data.services.problemsInLast24Hours,
    problemsInLastWeek: data.data.problems.problemsInLastWeek + data.data.services.problemsInLastWeek,
    problemsInLastMonth: data.data.problems.problemsInLastMonth + data.data.services.problemsInLastMonth,
  } : {
    totalActiveProblems: 0,
    activeProblemsInLast24Hours: 0,
    problemsInLast24Hours: 0,
    problemsInLastWeek: 0,
    problemsInLastMonth: 0,
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Active Problems */}
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="bg-card rounded-xl shadow-md p-5 border"
      >
        <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Current Status
        </div>
        <div className="mt-2 text-5xl font-extrabold text-red-500">
          {counts.totalActiveProblems}
        </div>
        <div className="mt-1 text-sm">
          Total Active Problems
        </div>
      </motion.div>

      {/* Problems Today */}
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="bg-card rounded-xl shadow-md p-5 border"
      >
        <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Total
        </div>
        <div className="mt-2 text-5xl font-extrabold text-blue-500">
          {counts.problemsInLast24Hours}
        </div>
        <div className="mt-1 text-sm">
          Total Problems Today
        </div>
      </motion.div>

      {/* Optional: Problems Last Week */}
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="bg-card rounded-xl shadow-md p-5 border"
      >
        <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Last Week
        </div>
        <div className="mt-2 text-5xl font-extrabold text-green-500">
          {counts.problemsInLastWeek}
        </div>
        <div className="mt-1 text-sm">
          Problems in Last 7 Days
        </div>
      </motion.div>

      {/* Optional: Problems Last Month */}
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="bg-card rounded-xl shadow-md p-5 border"
      >
        <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Last Month
        </div>
        <div className="mt-2 text-5xl font-extrabold text-yellow-500">
          {counts.problemsInLastMonth}
        </div>
        <div className="mt-1 text-sm">
          Problems in Last 30 Days
        </div>
      </motion.div>
    </div>
  );
}
