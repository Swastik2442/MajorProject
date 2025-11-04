import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import { apiService } from "@/services/api";

type HostCount = { clientId: string; hostname: string; severity: string; count: number };

function normalizeApiResult<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (res?.data && Array.isArray(res.data)) return res.data as T[];
  return [];
}

export default function TopProblematicHostsChart({ date }: { date?: DateRange }) {
  const { data: raw } = useQuery({
    queryKey: ["hostsProblemsCount", date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: async () =>
      apiService.getHostsProblemsCount({
        start: date?.from?.toISOString(),
        end: date?.to?.toISOString(),
      }),
  });

  const results: HostCount[] = normalizeApiResult<HostCount>(raw);

  // Aggregate counts by hostname (sum severities)
  const agg = results.reduce<Record<string, number>>((acc, item) => {
    const host = item.hostname ?? "<unknown>";
    acc[host] = (acc[host] || 0) + (item.count ?? 0);
    return acc;
  }, {});

  const chartData = Object.entries(agg)
    .map(([hostname, count]) => ({ hostname, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((it) => ({ name: it.hostname, problems: it.count }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
        <XAxis dataKey="name" tick={{ fill: "var(--muted)" }} />
        <YAxis tick={{ fill: "var(--muted)" }} />
        <Tooltip />
        <Bar dataKey="problems" fill="#06b6d4" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
