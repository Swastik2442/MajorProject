import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
  Cell,
  type TooltipContentProps,
} from "recharts";
import type { TClientsParams } from "@/schemas/api";
import { apiService } from "@/services/api";

const colors = [
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#1e40af",
  "#1e3a8a",
  "#0ea5e9",
  "#0284c7",
  "#0369a1",
  "#0c4a6e",
  "#164e63",
] as const;

function CustomTooltip({ active, payload, label }: TooltipContentProps<number | string, string>) {
  if (active && payload.length) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { value }: { value: number } = payload[0];
    return (
      <div
        style={{
          background: "rgba(20, 24, 36, 0.9)",
          color: "#fff",
          padding: "10px 14px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          backdropFilter: "blur(8px)",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        <p style={{ margin: 0, color: "#0ef" }}>Problems: {value}</p>
      </div>
    );
  }
  return null;
}

export default function TopProblematicHostsChart({
  client_id = null,
  org_id = null,
  dateRange,
}: {
  dateRange?: DateRange;
} & TClientsParams) {
  const { data: raw } = useQuery({
    queryKey: [
      "hostsProblemsCount",
      client_id,
      org_id,
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(),
    ],
    queryFn: async () =>
      apiService.getHostsProblemsCount({
        client_id,
        org_id,
        start: dateRange?.from?.toISOString(),
        end: dateRange?.to?.toISOString(),
      }),
  });

  const results = raw?.data ?? [];

  const agg = results.reduce<Record<string, number>>((acc, item) => {
    acc[item.hostname] = (acc[item.hostname] ?? 0) + item.count;
    return acc;
  }, {});

  const chartData = Object.entries(agg)
    .map(([hostname, count]) => ({ name: hostname, problems: count }))
    .sort((a, b) => b.problems - a.problems)
    .slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="p-4 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 shadow-xl"
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} barSize={28}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" opacity={0.2} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#cbd5e1", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#cbd5e1", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={CustomTooltip} />
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "13px" }} />
          <Bar
            dataKey="problems"
            fill="url(#barGradient)"
            radius={[10, 10, 0, 0]}
            animationDuration={900}
          >
            {chartData.map((_, i) => (
              <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
