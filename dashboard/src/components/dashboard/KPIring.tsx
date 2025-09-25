import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell } from "recharts";
import { apiService } from "../../services/api";

export default function KPIring() {
  const { data: actual } = useQuery({
    queryKey: ["problemsCount"],
    queryFn: apiService.fetchProblemsCount,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
  const counts = actual?.data ?? { activeProblems: 0, problemsInLast24Hours: 0 };

  // BUG: If there are no problems in last 24 hours, it shows 100% resolved which is misleading
  const percent = Math.round((counts.problemsInLast24Hours === 0 ? 1 : counts.problemsInLast24Hours - counts.activeProblems) / (counts.problemsInLast24Hours === 0 ? 1 : counts.problemsInLast24Hours) * 100);
  const data = [{ name: "resolved", value: percent }, { name: "open", value: 100 - percent }];
  const COLORS = ["#10b981", "#1f2937"];

  return (
    <div className="card flex items-center justify-center flex-col">
      <div style={{ width: 120, height: 120 }}>
        <PieChart width={120} height={120}>
          <Pie data={data} innerRadius={40} outerRadius={56} dataKey="value" startAngle={90} endAngle={-270}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </div>
      <div className="text-xl font-bold mt-2">{percent}%</div>
      <div className="small-muted">Resolved</div>
    </div>
  );
}
