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
import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import { apiService } from "@/services/api";
import { motion } from "framer-motion";

type TrendRow = { timestamp: string; problematic: number; total: number };

function normalizeApiResult<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (
    typeof res === "object" &&
    res !== null &&
    Array.isArray((res as { data?: unknown }).data)
  ) {
    return (res as { data: T[] }).data;
  }
  return [];
}

interface TooltipPayload {
  name: string;
  value: number;
  fill: string;
}
interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: "rgba(17, 24, 39, 0.85)",
          color: "#f8fafc",
          padding: "10px 14px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          backdropFilter: "blur(6px)",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ margin: 0, color: entry.fill }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function ProblemVsTotalChart({ date }: { date?: DateRange }) {
  const { data: raw } = useQuery({
    queryKey: ["problemVsTotal", date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: async () =>
      apiService.getProblematicTriggerAlertTrends({
        start: date?.from?.toISOString() ?? new Date().toISOString(),
        end: date?.to?.toISOString() ?? new Date().toISOString(),
      }),
  });

  const rows = normalizeApiResult<TrendRow>(raw);

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
      <h2 className="text-xl font-semibold text-emerald-400 mb-3">
        Problematic vs Total Alerts
      </h2>
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
          <Tooltip content={<CustomTooltip />} />
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
