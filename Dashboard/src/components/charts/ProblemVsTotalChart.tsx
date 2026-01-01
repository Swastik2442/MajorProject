import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { TTimeIntervalParam, TClientsParams } from "@/schemas/api";
import { apiService } from "@/services/api";
import CustomTooltip from "@/components/CustomTooltip";

export default function ProblemVsTotalChart({
  client_id = null,
  org_id = null,
  dateRange,
  interval,
}: {
  dateRange?: DateRange;
  interval?: TTimeIntervalParam;
} & TClientsParams) {
  const { data: raw } = useQuery({
    queryKey: [
      "problemVsTotal",
      client_id,
      org_id,
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(),
      interval
    ],
    queryFn: async () =>
      apiService.getProblematicTriggerAlertTrends({
        client_id,
        org_id,
        start: dateRange?.from?.toISOString() ?? subDays(new Date(), 1).toISOString(),
        end: dateRange?.to?.toISOString() ?? new Date().toISOString(),
        interval
      }),
  });

  const rows = raw?.data ?? [];

  const chartData = rows.map((r) => ({
    timestamp: new Date(r.timestamp).toLocaleDateString(),
    problematic: r.problematic,
    total: r.total,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg"
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} barGap={6}>
          <defs>
            <linearGradient id="problematicGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#064e3b" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" opacity={0.2} vertical={false} />
          <XAxis
            dataKey="timestamp"
            tick={{ fill: "#cbd5e1", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#cbd5e1", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={CustomTooltip} />
          <Legend
            wrapperStyle={{ color: "#94a3b8", fontSize: "13px" }}
            iconType="circle"
          />
          <Bar
            dataKey="problematic"
            name="Problematic"
            fill="url(#problematicGradient)"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
          <Bar
            dataKey="total"
            name="Total"
            fill="url(#totalGradient)"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
