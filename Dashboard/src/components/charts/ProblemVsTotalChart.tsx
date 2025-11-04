import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import { apiService } from "@/services/api";

type TrendRow = { timestamp: string; problematic: number; total: number };

function normalizeApiResult<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (res?.data && Array.isArray(res.data)) return res.data as T[];
  return [];
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


  const rows: TrendRow[] = normalizeApiResult<TrendRow>(raw);

  const chartData = rows.map((r) => ({
    timestamp: new Date(r.timestamp).toLocaleDateString(),
    problematic: r.problematic,
    total: r.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
        <XAxis dataKey="timestamp" tick={{ fill: "var(--muted)" }} />
        <YAxis tick={{ fill: "var(--muted)" }} />
        <Tooltip />
        <Bar dataKey="problematic" name="Problematic" fill="#ef4444" />
        <Bar dataKey="total" name="Total" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}
