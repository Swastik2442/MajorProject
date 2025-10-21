import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import type { TClientsParams } from "@/schemas/api";
import { apiService } from "@/services/api";
import { LoadingSpinner } from "@/components/ui/icons";

function MiniSpark({ data = [] }: { data: { v: number }[] }) {
  return (
    <div style={{ width: 80, height: 28 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke="var(--chart-2)"
            strokeWidth={2}
            dot={false}
            strokeLinecap="round"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ActivityStream({ client_id = null, org_id = null }: TClientsParams) {
  const { data, isError, error, isPending } = useQuery({
    queryKey: ["problems", client_id, org_id],
    queryFn: () => apiService.fetchProblems({ client_id, org_id, page: 1, limit: 8 }),
  });

  if (isPending) {
    return (
      <div className="p-8 flex justify-center items-center">
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
    <motion.div
      initial={{ opacity: 0.0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
      viewport={{ once: true }}
      className="bg-card rounded-xl shadow-md p-5 border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wider text-primary uppercase">
          Problem Activity Stream
        </h2>
        <span className="text-xs text-muted-foreground">Latest</span>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((it) => (
          <div
            key={it.zid}
            className="flex items-center justify-between gap-4 bg-background rounded-lg px-3 py-2 hover:bg-background/50 transition"
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
                <div className="text-sm font-medium text-foreground/90">
                  {it.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {it.hostname}{" · "}
                  {new Date(it.startedAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Right side: spark + duration */}
            <div className="flex items-center gap-3">
              <MiniSpark
                data={[0, 1, 0, 2, 1, 0].map((v) => ({ v }))}
              />
              <span className="text-xs text-muted-foreground text-right">
                {it.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
