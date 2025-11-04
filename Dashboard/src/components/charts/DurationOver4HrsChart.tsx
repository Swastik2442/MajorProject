import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import { apiService } from "@/services/api";

type DurationHost = { clientId: string; hostname: string; durationSeconds: Array<number | "Infinity"> };

function normalizeApiResult<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (res?.data && Array.isArray(res.data)) return res.data as T[];
  return [];
}

export default function DurationOver4HrsChart({ date }: { date?: DateRange }) {
  const { data: raw } = useQuery({
    queryKey: ["durationOver4hrs", date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: async () =>
      apiService.getAlertDurationPerHost({
        start: date?.from?.toISOString(),
        end: date?.to?.toISOString(),
      }),
  });

  const rows: DurationHost[] = normalizeApiResult<DurationHost>(raw);

  const chartData = rows
    .map((r) => {
      const countLong = (r.durationSeconds || []).filter((d) => (typeof d === "number" ? d > 14400 : true)).length;
      return { name: r.hostname ?? "<unknown>", long: countLong };
    })
    .sort((a, b) => b.long - a.long)
    .slice(0, 20);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
        <XAxis dataKey="name" tick={{ fill: "var(--muted)" }} />
        <YAxis tick={{ fill: "var(--muted)" }} />
        <Tooltip />
        <Bar dataKey="long" name="> 4 hrs" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
}
