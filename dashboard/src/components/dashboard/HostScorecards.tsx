import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { apiService } from "../../services/api";

export default function HostScorecards() {
  const { data } = useQuery({
    queryKey: ["hostHealthScores"],
    queryFn: apiService.fetchHostsHealthScores,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  const hosts = data?.data ?? [];

  return (
    <div className="card">
      <div className="font-semibold mb-4">HOST HEALTH SCORECARDS</div>
      <div className="grid grid-cols-2 gap-4">
        {hosts.slice(0, 4).map((h) => (
          <div key={h._id} className="bg-[#0b1420] p-3 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-300">{h._id}</div>
                <div className="text-2xl font-bold">{Math.round(h.healthScore)}</div>
                <div className="small-muted">Score</div>
              </div>
              <div style={{ width: 140, height: 60 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[h]}>
                    <Bar dataKey="notClassified" fill="#3b82f6" />
                    <Bar dataKey="information" fill="#3b82f6" />
                    <Bar dataKey="warning" fill="#3b82f6" />
                    <Bar dataKey="average" fill="#3b82f6" />
                    <Bar dataKey="high" fill="#3b82f6" />
                    <Bar dataKey="disaster" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
