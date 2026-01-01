import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import type { TClientsParams } from "@/schemas/api";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import CustomTooltip from "@/components/CustomTooltip";

export default function HostScorecards({ client_id = null, org_id = null }: TClientsParams) {
  const [indices, setIndices] = useState<number[]>([0, 4]);
  const { data } = useQuery({
    queryKey: ["hostHealthScores", client_id, org_id],
    queryFn: () => apiService.getHostsHealthScores({ client_id, org_id }),
    staleTime: 300000, // 5 minutes
  });
  const hosts = (data?.data ?? []).filter(h => h.healthScore < 100).sort((a, b) => a.healthScore - b.healthScore);

  return (
    <div className="card">
      <div className="font-semibold mb-4 text-primary uppercase flex justify-between items-center">
        <span>Host Health Scorecards</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Toggle between showing 4 hosts each time the button is clicked
            if (indices[1] >= hosts.length) {
              setIndices([0, 4]);
            } else {
              setIndices([indices[0] + 4, indices[1] + 4]);
            }
          }}
          disabled={hosts.length <= 4}
        >
          {Math.min(4, hosts.length)}/{hosts.length}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {hosts.slice(indices[0], indices[1]).map((h) => (
          <motion.div
            key={h._id}
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="bg-card p-3 rounded-xl border"
          >
            <div className="flex items-center justify-between">
              <div className="truncate">
                <div className="text-sm text-foreground/75">{h._id}</div>
                <div className="text-2xl font-bold">{Math.round(h.healthScore)}</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div className="w-[140px] h-[60px]">
                <ResponsiveContainer width={140} height={60}>
                  <BarChart data={[h]}>
                    <Tooltip content={CustomTooltip} />
                    <Bar dataKey="notClassified" fill="#6b7280" />
                    <Bar dataKey="information" fill="#10b981" />
                    <Bar dataKey="warning" fill="#eab308" />
                    <Bar dataKey="average" fill="#3b82f6" />
                    <Bar dataKey="high" fill="#f59e0b" />
                    <Bar dataKey="disaster" fill="#ef4444" />
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
