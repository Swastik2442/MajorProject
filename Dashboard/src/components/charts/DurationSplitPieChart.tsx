import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
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

export default function DurationSplitPieChart({ date }: { date?: DateRange }) {
  const { data: raw } = useQuery({
    queryKey: ["durationSplit", date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: async () =>
      apiService.getAlertDurationPerHost({
        start: date?.from?.toISOString(),
        end: date?.to?.toISOString(),
      }),
  });

  const rows: DurationHost[] = normalizeApiResult<DurationHost>(raw);

  const less4 = rows.reduce((acc: number, host) => {
    const n = (host.durationSeconds || []).filter((d) => typeof d === "number" && d <= 14400).length;
    return acc + n;
  }, 0);

  const more4 = rows.reduce((acc: number, host) => {
    const n = (host.durationSeconds || []).filter((d) => (typeof d === "number" ? d > 14400 : true)).length;
    return acc + n;
  }, 0);

  const chartData = [
    { name: "< 4 Hours", value: less4 },
    { name: "> 4 Hours", value: more4 },
  ];

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {chartData.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
