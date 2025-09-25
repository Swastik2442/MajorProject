import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { apiService } from "../../services/api";

export default function TrendsChart() {
  const { data } = useQuery({
    queryKey: ["problemTrends"],
    queryFn: () => apiService.fetchProblemsTrends(
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), new Date().toISOString(), "hour"
    ),
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
  const trends = (data?.data ?? []).map((t) => ({
    ...t,
    timestamp: new Date(t.timestamp).toLocaleString(),
  }));
  // TODO: Format the timestamp to a more readable format if needed

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">PROBLEM TRENDS (Last 24 Hours)</div>
      </div>
      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f1720" />
            <XAxis dataKey="timestamp" minTickGap={10} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="new" name="New Problems" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="active" name="Active Problems" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="resolved" name="Resolved Problems" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
