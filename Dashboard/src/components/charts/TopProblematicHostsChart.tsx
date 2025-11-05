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
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import { apiService } from "@/services/api";
import { motion } from "framer-motion";

type HostCount = {
  clientId?: string;
  hostname?: string;
  severity?: string;
  count?: number;
};

function normalizeApiResult<T>(res: unknown): T[] {
  if (Array.isArray(res)) {
    return res as T[];
  }

  if (
    typeof res === "object" &&
    res !== null &&
    Array.isArray((res as { data?: unknown }).data)
  ) {
    return (res as { data: T[] }).data;
  }

  return [];
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload?.length) {
    const value = payload[0]?.value ?? 0;
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
  date,
}: {
  date?: DateRange;
}) {
  const { data: raw } = useQuery({
    queryKey: [
      "hostsProblemsCount",
      date?.from?.toISOString(),
      date?.to?.toISOString(),
    ],
    queryFn: async () =>
      apiService.getHostsProblemsCount({
        start: date?.from?.toISOString(),
        end: date?.to?.toISOString(),
      }),
  });

  const results = normalizeApiResult<HostCount>(raw);

  const agg = results.reduce<Record<string, number>>((acc, item) => {
    const host = item.hostname ?? "<unknown>";
    const count = item.count ?? 0;
    acc[host] = (acc[host] ?? 0) + count;
    return acc;
  }, {});

  const chartData = Object.entries(agg)
    .map(([hostname, count]) => ({ name: hostname, problems: count }))
    .sort((a, b) => b.problems - a.problems)
    .slice(0, 10);

  const colors = [
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#fb7185",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl"
    >
      <h2 className="text-xl font-semibold text-cyan-400 mb-3">
        Top Problematic Hosts
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} barSize={28}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#0f172a" stopOpacity={0.2} />
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
          <Tooltip content={<CustomTooltip />} />
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
