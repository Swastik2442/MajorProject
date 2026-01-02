import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { DateRange } from "react-day-picker";
import ms from "ms";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  type PieLabelRenderProps,
  type TooltipContentProps,
} from "recharts";
import type { TClientsParams } from "@/schemas/api";
import { apiService } from "@/services/api";

function CustomTooltip({ active, payload }: TooltipContentProps<number | string, string>) {
  if (active && payload.length) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { name, value } = payload[0];

    return (
      <div
        style={{
          background: "rgba(17, 24, 39, 0.85)",
          color: "#f8fafc",
          padding: "10px 14px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          backdropFilter: "blur(6px)",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{name}</p>
        <p style={{ color: "#0ef", margin: 0 }}>{value} alerts</p>
      </div>
    );
  }
  return null;
}

export default function DurationSplitPieChart({
  threshold = 14400, // 4 hours
  client_id = null,
  org_id = null,
  dateRange,
}: {
  threshold?: number;
  dateRange?: DateRange;
} & TClientsParams) {
  const { data: raw, isError, error } = useQuery({
    queryKey: [
      "durationSplit",
      client_id,
      org_id,
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(),
      threshold,
    ],
    queryFn: async () =>
      apiService.getTriggerAlertDurationSplit({
        client_id,
        org_id,
        start: dateRange?.from?.toISOString(),
        end: dateRange?.to?.toISOString(),
        threshold,
      }),
    retry: 1,
  });

  const data = raw?.data ?? {
    lesser: 0,
    greaterOrEqual: 0,
  };

  const thresholdAsWords = ms(threshold * 1000, { long: true });
  const chartData = [
    { name: `< ${thresholdAsWords}`, value: data.lesser },
    { name: `> ${thresholdAsWords}`, value: data.greaterOrEqual },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="p-4 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 shadow-xl"
    >
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <defs>
            <radialGradient id="greenGradient" cx="0.5" cy="0.5" r="0.8">
              <stop offset="0%" stopColor="#16f2a5" stopOpacity={1} />
              <stop offset="70%" stopColor="#0fb981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#046d4b" stopOpacity={0.85} />
            </radialGradient>

            <radialGradient id="redGradient" cx="0.5" cy="0.5" r="0.8">
              <stop offset="0%" stopColor="#ff4d4d" stopOpacity={1} />
              <stop offset="70%" stopColor="#e11d48" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity={0.85} />
            </radialGradient>
          </defs>

          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={50}
            label={(props: PieLabelRenderProps) => {
              const { name, percent } = props;
              if (typeof name !== "string" || typeof percent !== "number") {
                return "";
              }
              const percentage = (percent * 100).toFixed(1);
              return `${name} (${percentage}%)`;
            }}
            labelLine={false}
            isAnimationActive
            animationDuration={1000}
          >
            {chartData.map((_, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={idx === 0 ? "url(#greenGradient)" : "url(#redGradient)"}
                stroke="none"
              />
            ))}
          </Pie>

          <Tooltip content={CustomTooltip} />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ color: "#94a3b8", fontSize: "13px" }}
            iconType="circle"
          />
          {isError && (
            <text
              x='50%'
              y='50%'
              dy='-12'
              textAnchor='middle'
              fill="#cbd5e1"
            >
              {error instanceof Error ? error.message : "Error loading data"}
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
