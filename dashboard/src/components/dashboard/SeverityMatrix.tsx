import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TSeveritySchema } from "@/schemas/others";
import { motion } from "framer-motion";

type SeverityMatrixData = {
  category: string;
} & Record<TSeveritySchema, number>;

export default function SeverityMatrix({ data = [] }: { data?: SeverityMatrixData[] }) {
  return (
    <motion.div
      initial={{ opacity: 0.0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
      viewport={{ once: true }}
      className="bg-card rounded-xl shadow-md p-5 border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-wider text-primary uppercase">
          Problem Severity Matrix
        </h2>
      </div>

      {/* Chart */}
      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, left: 10, right: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis
              type="category"
              dataKey="category"
              width={100}
              stroke="#9ca3af"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                color: "#f9fafb",
                fontSize: "0.8rem",
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "10px",
                fontSize: "0.75rem",
                color: "#d1d5db",
              }}
            />
            <Bar dataKey="Disaster" stackId="a" fill="#ef4444" /> {/* red */}
            <Bar dataKey="High" stackId="a" fill="#f59e0b" /> {/* amber */}
            <Bar dataKey="Average" stackId="a" fill="#3b82f6" /> {/* blue */}
            <Bar dataKey="Warning" stackId="a" fill="#eab308" /> {/* yellow */}
            <Bar dataKey="Information" stackId="a" fill="#10b981" /> {/* green */}
            <Bar dataKey="Not classified" stackId="a" fill="#6b7280" /> {/* gray */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
