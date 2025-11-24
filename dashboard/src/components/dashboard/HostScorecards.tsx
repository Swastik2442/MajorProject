import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import type { TClientsParams } from "@/schemas/api";
import { apiService } from "@/services/api";

export default function HostScorecards({ client_id = null, org_id = null }: TClientsParams) {
  const { data } = useQuery({
    queryKey: ["hostHealthScores", client_id, org_id],
    queryFn: () => apiService.getHostsHealthScores({ client_id, org_id }),
    staleTime: 300000, // 5 minutes
  });
  const hosts = data?.data ?? [];

  return (
    <div className="card">
      <div className="font-semibold mb-4 text-primary uppercase">Host Health Scorecards</div>
      <div className="grid grid-cols-2 gap-4">
        {hosts.slice(0, 4).map((h) => (
          <motion.div
            key={h._id}
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="bg-card p-3 rounded-xl border"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-foreground/75">{h._id}</div>
                <div className="text-2xl font-bold">{Math.round(h.healthScore)}</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div className="w-[140px] h-[60px]">
                <ResponsiveContainer width={140} height={60}>
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
          </motion.div>
        ))}
      </div>
    </div>
  );
}
