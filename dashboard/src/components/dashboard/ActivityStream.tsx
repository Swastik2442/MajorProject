import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { apiService } from "../../services/api";
import LoadingSpinner from "./LoadingSpinner";

function MiniSpark({ data = [] }: { data: { v: number }[] }) {
  return (
    <div style={{ width: 100, height: 36 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} strokeLinecap="round" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ActivityStream() {
  const { data, isError, error, isPending } = useQuery({
    queryKey: ["problems"],
    queryFn: () => apiService.fetchProblems(1, 8),
  });

  if (isPending) {
    return (
      <div className="p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || data?.status === "error") {
    return (
      <div className="p-8 text-red-500">
        Error loading problems: {error?.message ?? data?.message}
      </div>
    );
  }
  const items = data?.data ?? [];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">PROBLEM ACTIVITY STREAM</div>
        <div className="small-muted">latest</div>
      </div>

      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.zid} className="flex items-center justify-between gap-4 border border-gray-800 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-1 ${/crit/i.test(it.severity) ? "bg-red-500" : /warn/i.test(it.severity) ? "bg-yellow-500" : "bg-green-500"}`} />
              <div>
                <div className="font-medium">{it.name} </div>
                <div className="small-muted mt-1">{it.hostname} · {new Date(it.startedAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <MiniSpark data={([0,1,0,2,1,0]).map((v) => ({ v }))} />
              <div className="small-muted text-right">{it.duration}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
