import { useQuery } from "@tanstack/react-query";
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
import type { TClientsParams } from "@/schemas/api";
import { apiService } from "@/services/api";

export default function TrendsChart({ client_id = null, org_id = null }: TClientsParams) {
  const { data } = useQuery({
    queryKey: ["problemTrends", client_id, org_id],
    queryFn: () =>
      apiService.fetchProblemsTrends(
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        undefined,
        "hour",
        client_id,
        org_id
      ),
    staleTime: 60 * 60 * 1000,
  });

  const trends = (data?.data ?? []).map((t) => ({
    ...t,
    timestamp: new Date(t.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return (
    <div className="bg-card rounded-xl shadow-md p-5 border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-wider text-primary uppercase">
          Problem Trends (Last 24 Hours)
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
              dataKey="new"
              name="New Problems"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="active"
              name="Active Problems"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="resolved"
              name="Resolved Problems"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
