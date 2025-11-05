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

interface DurationHost {
  clientId?: string;
  hostname?: string;
  durationSeconds: (number | "Infinity")[];
}

interface ChartDatum {
  name: string;
  long: number;
}

interface TooltipPayload {
  value?: number | null; 
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

// --- Safe Normalizer ---
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

// --- Custom Tooltip ---
function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload?.length) {
    const value = payload[0]?.value ?? 0;
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
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        <p style={{ color: "#facc15", margin: 0 }}>
          {`> 4 hrs Alerts: ${String(value)}`}
        </p>
      </div>
    );
  }
  return null;
}

export default function DurationOver4HrsChart({ date }: { date?: DateRange }) {
  const { data: raw } = useQuery({
    queryKey: [
      "durationOver4hrs",
      date?.from?.toISOString(),
      date?.to?.toISOString(),
    ],
    queryFn: async () =>
      apiService.getAlertDurationPerHost({
        start: date?.from?.toISOString(),
        end: date?.to?.toISOString(),
      }),
  });

  const rows = normalizeApiResult<DurationHost>(raw);

  const chartData: ChartDatum[] = rows
    .map((r) => {
      const countLong = r.durationSeconds.filter((d) =>
        typeof d === "number" ? d > 14400 : true
      ).length;
      return { name: r.hostname ?? "<unknown>", long: countLong };
    })
    .sort((a, b) => b.long - a.long)
    .slice(0, 20);

  const colors = ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#ffedd5"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl"
    >
      <h2 className="text-xl font-semibold text-amber-400 mb-3">
        Hosts with Alerts Lasting Over 4 Hours
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} barSize={28}>
          <defs>
            <linearGradient id="barGradientYellow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#78350f" stopOpacity={0.25} />
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
          <Legend
            wrapperStyle={{ color: "#94a3b8", fontSize: "13px" }}
            iconType="circle"
          />
          <Bar
            dataKey="long"
            name="> 4 Hours"
            fill="url(#barGradientYellow)"
            radius={[8, 8, 0, 0]}
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
