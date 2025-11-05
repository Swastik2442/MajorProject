import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import type { TClientsParams, TTimeIntervalParam } from "@/schemas/api";
import { apiService } from "@/services/api";

export default function TrendsChart({
  client_id = null,
  org_id = null,
  dateRange,
  interval,
}: {
  dateRange?: DateRange;
  interval?: TTimeIntervalParam;
} & TClientsParams) {
  const { data } = useQuery({
    queryKey: [
      "alertTrends",
      client_id,
      org_id,
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(),
      interval
    ],
    queryFn: () =>
      apiService.getCommonAlertTrends({
        client_id,
        org_id,
        start: dateRange?.from?.toISOString() ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end: dateRange?.to?.toISOString() ?? new Date().toISOString(),
        interval: interval ?? "hour"
    }),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const trends = (data?.data ?? []).map((t) => ({
    ...t,
    timestamp: new Date(t.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return (
    <motion.div
      initial={{ opacity: 0.0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
      viewport={{ once: true }}
      className="bg-card rounded-xl shadow-md p-5 border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-wider text-primary uppercase">
          Alert Trends (Last 24 Hours)
        </h2>
      </div>

      {/* Chart */}
      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
            <XAxis
              dataKey="timestamp"
              stroke="var(--ring)"
              tick={{ fontSize: 10 }}
              minTickGap={20}
            />
            <YAxis
              stroke="var(--ring)"
              tick={{ fontSize: 10 }}
              domain={[0, 'auto']}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--ring)",
                borderRadius: "0.5rem",
                fontSize: "0.8rem",
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "10px",
                fontSize: "0.75rem",
              }}
            />
            <Line
              type="monotone"
              dataKey="activeProblems"
              name="Active Problems"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="activeServiceOutages"
              name="Active Service Outages"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
