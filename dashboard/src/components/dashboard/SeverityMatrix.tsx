import { useMemo } from "react";
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
import { motion } from "framer-motion";

const SEVERITY_KEYS = [
  "Disaster",
  "High",
  "Average",
  "Warning",
  "Information",
  "Not classified",
] as const;
type TSeveritySchema = typeof SEVERITY_KEYS[number];

type Problem = {
  name: string;
  severity: string;
};

type SeverityMatrixData = {
  category: string;
} & Record<TSeveritySchema, number>;

function deriveCategory(name: string): string {
  const lower = name.toLowerCase();

  if (
    lower.includes("system name has changed") ||
    lower.includes("operating system description has changed") ||
    lower.includes("number of installed packages has been changed") ||
    lower.includes("system time is out of sync")
  ) {
    return "System Configuration / Info";
  }
  if (
    lower.includes("max number of open filedescriptors is too low") ||
    lower.includes("max number of processes is too low") ||
    lower.includes("getting closer to process limit")
  ) {
    return "Resource Limits";
  }
  if (
    lower.includes("fs [") ||
    lower.includes("filesystem has become read-only") ||
    lower.includes("running out of free inodes") ||
    lower.includes("space is critically low")
  ) {
    return "Filesystem Issues (FS)";
  }
  if (lower.includes("high cpu utilization") || lower.includes("load average is too high")) {
    return "CPU / Load";
  }
  if (
    lower.includes("high memory utilization") ||
    lower.includes("high swap space usage") ||
    lower.includes("lack of available memory")
  ) {
    return "Memory / Swap";
  }
  if (
    lower.includes("interface eth0: ethernet has changed") ||
    lower.includes("interface eth0: high bandwidth usage") ||
    lower.includes("interface eth0: high error rate") ||
    lower.includes("interface eth0: link down")
  ) {
    return "Network Interface (Eth0)";
  }
  if (
    lower.includes("zabbix agent is not available") ||
    lower.includes("has been restarted")
  ) {
    return "Agent / Service Status";
  }
  if (
    name.startsWith("Zabbix server: Excessive") ||
    lower.includes("zabbix server: more than 100 items") ||
    name.startsWith("Zabbix server: Utilization of")
  ) {
    return "Zabbix Server Cache / Performance";
  }

  return "General / Other";
}

function normalizeSeverity(severity: string): TSeveritySchema {
  const sev = severity.trim().toLowerCase();

  switch (sev) {
    case "disaster":
      return "Disaster";
    case "high":
      return "High";
    case "average":
      return "Average";
    case "warning":
      return "Warning";
    case "information":
      return "Information";
    case "not classified":
    case "not_classified":
    case "notclassified":
      return "Not classified";
    default:
      return "Not classified";
  }
}

function calculateSeverityMatrix(problems: Problem[]): SeverityMatrixData[] {
  const categoryMap: Record<
    string,
    Record<TSeveritySchema, number>
  > = {};

  problems.forEach(({ name, severity }) => {
    const category = deriveCategory(name);
    const normalizedSeverity = normalizeSeverity(severity);

    if (!categoryMap[category]) {
      categoryMap[category] = SEVERITY_KEYS.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {} as Record<TSeveritySchema, number>);
    }

    categoryMap[category][normalizedSeverity]++;
  });

  return Object.entries(categoryMap).map(([category, counts]) => ({
    category,
    ...counts,
  }));
}

export default function SeverityMatrix({
  problems = [],
}: {
  problems?: Problem[];
}) {
  const data = useMemo(() => calculateSeverityMatrix(problems), [problems]);

  return (
    <motion.div
      initial={{ opacity: 0.0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
      viewport={{ once: true }}
      className="bg-card rounded-xl shadow-md p-5 border"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-wider text-primary uppercase">
          Problem Severity Matrix
        </h2>
      </div>

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
              width={150}
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
            <Bar dataKey="Disaster" stackId="a" fill="#ef4444" />
            <Bar dataKey="High" stackId="a" fill="#f59e0b" />
            <Bar dataKey="Average" stackId="a" fill="#3b82f6" />
            <Bar dataKey="Warning" stackId="a" fill="#eab308" />
            <Bar dataKey="Information" stackId="a" fill="#10b981" />
            <Bar dataKey="Not classified" stackId="a" fill="#6b7280" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
