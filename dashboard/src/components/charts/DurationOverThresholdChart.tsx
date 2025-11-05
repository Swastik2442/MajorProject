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
  type TooltipContentProps
} from "recharts";
import type { TClientsParams } from "@/schemas/api";
import { apiService } from "@/services/api";
import ms from "ms";

const colors = ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#ffedd5"];

function CustomTooltip({ active, payload, label }: TooltipContentProps<number | string, string>) {
  if (active && payload.length) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { value }: { value: number } = payload[0];
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

export default function DurationOverThresholdChart({
  threshold = 14400, // 4 hours
  client_id = null,
  org_id = null,
  dateRange,
}: {
  threshold?: number;
  dateRange?: DateRange;
} & TClientsParams) {
  const { data: raw } = useQuery({
    queryKey: [
      "durationOver4hrs",
      client_id,
      org_id,
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(),
    ],
    queryFn: async () =>
      apiService.getAlertDurationPerHost({
        client_id,
        org_id,
        start: dateRange?.from?.toISOString(),
        end: dateRange?.to?.toISOString(),
      }),
  });

  const rows = raw?.data ?? [];

  const chartData = rows
    .map((r) => {
      const countLong = r.durationSeconds.filter((d) =>
        typeof d === "number" ? d > threshold : true
      ).length;
      return { clientId: r.clientId, name: r.hostname, long: countLong };
    })
    .sort((a, b) => b.long - a.long)
    .slice(0, 20);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const thresholdAsWords = ms(threshold * 1000, { long: true });
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl"
    >
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
          <Tooltip content={CustomTooltip} />
          <Legend
            wrapperStyle={{ color: "#94a3b8", fontSize: "13px" }}
            iconType="circle"
          />
          <Bar
            dataKey="long"
            name={`> ${thresholdAsWords}`}
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
