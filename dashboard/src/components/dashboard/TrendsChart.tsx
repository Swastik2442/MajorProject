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
import { apiService } from "../../services/api";

export default function TrendsChart() {
  const { data } = useQuery({
    queryKey: ["problemTrends"],
    queryFn: () =>
      apiService.fetchProblemsTrends(
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString(),
        "hour"
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
    <div className="bg-gray-900 rounded-xl shadow-md p-5 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
          Problem Trends (Last 24 Hours)
        </h2>
      </div>

      {/* Chart */}
      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="timestamp"
              stroke="#9ca3af"
              tick={{ fontSize: 10 }}
              minTickGap={20}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fontSize: 10 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                color: "#f9fafb",
                fontSize: "0.8rem",
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "10px",
                fontSize: "0.75rem",
                color: "#d1d5db",
              }}
            />
            <Line
              type="monotone"
              dataKey="new"
              name="New Problems"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="active"
              name="Active Problems"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="resolved"
              name="Resolved Problems"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
