import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell } from "recharts";
import type { TClientsParams } from "../../schemas/api";
import { apiService } from "../../services/api";

export default function KPIring({ client_id = null, org_id = null }: TClientsParams) {
  const { data: actual } = useQuery({
    queryKey: ["problemsCount", client_id, org_id],
    queryFn: () => apiService.fetchProblemsCount(client_id, org_id),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const counts = actual?.data ?? { activeProblemsInLast24Hours: 0, problemsInLast24Hours: 0 };

  // Safe percent calculation (avoid misleading 100% when denominator = 0)
  const resolvedCount = Math.max(
    0,
    counts.problemsInLast24Hours - counts.activeProblemsInLast24Hours
  );
  const denominator = counts.problemsInLast24Hours || 1;
  const percent = Math.round((resolvedCount / denominator) * 100);

  const data = [
    { name: "Resolved", value: percent },
    { name: "Open", value: 100 - percent },
  ];
  const COLORS = ["#10b981", "#e5e7eb"];

  return (
    <div className="card flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: 140, height: 140 }}>
        <PieChart width={140} height={140}>
          <Pie
            data={data}
            innerRadius={50}
            outerRadius={65}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{percent}%</span>
          <span className="text-xs text-gray-500">Resolved</span>
        </div>
      </div>

      {/* Optional subtitle */}
      <div className="mt-3 text-sm text-gray-400">
        In last 24 hours:{" "}
        <span className="font-medium text-gray-600">
          {counts.problemsInLast24Hours}
        </span>
      </div>
    </div>
  );
}
