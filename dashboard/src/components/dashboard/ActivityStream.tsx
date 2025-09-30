import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { apiService } from "../../services/api";
import LoadingSpinner from "./LoadingSpinner";

function MiniSpark({ data = [] }: { data: { v: number }[] }) {
  return (
    <div style={{ width: 80, height: 28 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke="#22c55e" // green for activity trend
            strokeWidth={2}
            dot={false}
            strokeLinecap="round"
          />
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
    <div className="bg-gray-900 rounded-xl shadow-md p-5 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
          Problem Activity Stream
        </h2>
        <span className="text-xs text-gray-500">Latest</span>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((it) => (
          <div
            key={it.zid}
            className="flex items-center justify-between gap-4 bg-gray-800 rounded-lg px-3 py-2 hover:bg-gray-700 transition"
          >
            {/* Left side: severity + text */}
            <div className="flex items-start gap-3">
              <div
                className={`w-3 h-3 rounded-full mt-1 ${
                  /crit/i.test(it.severity)
                    ? "bg-red-500"
                    : /warn/i.test(it.severity)
                    ? "bg-yellow-400"
                    : "bg-green-500"
                }`}
              />
              <div>
                <div className="text-sm font-medium text-gray-200">
                  {it.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {it.hostname} ·{" "}
                  {new Date(it.startedAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Right side: spark + duration */}
            <div className="flex items-center gap-3">
              <MiniSpark
                data={[0, 1, 0, 2, 1, 0].map((v) => ({ v }))}
              />
              <span className="text-xs text-gray-400 text-right">
                {it.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
