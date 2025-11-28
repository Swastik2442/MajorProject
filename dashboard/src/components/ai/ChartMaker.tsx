/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Cell,
} from "recharts";
import type { TChartAndData } from "@/schemas/api";

// Truncate long labels but show full in tooltip
const formatLabel = (value: string) => {
  if (!value) return "";
  return value.length > 10 ? `${value.slice(0, 10)}…` : value;
};

export function ChartMaker({ data }: { data: TChartAndData }) {
  const colors = data.data_series.map((s) => s.color || "#4ade80");

  const glowShadow = {
    filter: "drop-shadow(0 0 6px rgba(0, 255, 180, 0.35))",
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold tracking-wide text-[#d8e1ec] truncate">
        {data.description}
      </h3>

      <div className="bg-[#0d1828] border border-[#1c2a3c] shadow-2xl rounded-xl p-4 backdrop-blur-xl transition hover:shadow-blue-900/40 hover:scale-[1.01]">
        <ResponsiveContainer width="100%" height={320}>
          <>
            {/* Gradients */}
            <defs>
              {colors.map((color, i) => (
                <linearGradient
                  key={i}
                  id={`grad-${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.25} />
                </linearGradient>
              ))}
            </defs>

            {/* ---------------- BAR CHART ---------------- */}
            {data.type === "bar" && (
              <BarChart
                data={data.data}
                margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="5 5" opacity={0.08} />
                <XAxis
                  stroke="#b5bcc7"
                  tickFormatter={formatLabel}
                  angle={-12}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis stroke="#b5bcc7" />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  formatter={(v: number, n: string) => [v, n]}
                  contentStyle={{
                    background: "#1c2a3c",
                    borderRadius: "8px",
                    border: "none",
                  }}
                />
                <Legend verticalAlign="top" height={36} />

                {data.data_series.map((s, i) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    fill="red"
                    radius={[10, 10, 0, 0]}
                    style={glowShadow}
                  />
                ))}
              </BarChart>
            )}

            {/* ---------------- LINE CHART ---------------- */}
            {data.type === "line" && (
              <LineChart
                data={data.data}
                margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="5 5" opacity={0.08} />
                <XAxis
                  dataKey="name"
                  stroke="#b5bcc7"
                  tickFormatter={formatLabel}
                  angle={-12}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis stroke="#b5bcc7" />
                <Tooltip
                  contentStyle={{
                    background: "#1c2a3c",
                    borderRadius: "8px",
                    border: "none",
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                {data.data_series.map((s, i) => (
                  <Line
                    key={s.key}
                    dataKey={s.key}
                    type="monotone"
                    stroke={`url(#grad-${i})`}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, stroke: colors[i] }}
                    activeDot={{ r: 7, style: glowShadow }}
                    style={glowShadow}
                  />
                ))}
              </LineChart>
            )}

            {/* ---------------- PIE CHART ---------------- */}
            {data.type === "pie" && (
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: "#1c2a3c",
                    borderRadius: "8px",
                    border: "none",
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Pie
                  data={data.data}
                  dataKey={data.data_series[0]?.key}
                  outerRadius={120}
                  paddingAngle={4}
                  animationBegin={100}
                  animationDuration={800}
                >
                  {colors.map((c, i) => (
                    <Cell key={i} fill={c} style={glowShadow} />
                  ))}
                </Pie>
              </PieChart>
            )}

            {/* ---------------- SCATTER CHART ---------------- */}
            {data.type === "scatter" && (
              <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="5 5" opacity={0.08} />
                <XAxis
                  dataKey="x"
                  stroke="#b5bcc7"
                  tickFormatter={formatLabel}
                  angle={-12}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis stroke="#b5bcc7" />
                <Tooltip
                  contentStyle={{
                    background: "#1c2a3c",
                    borderRadius: "8px",
                    border: "none",
                  }}
                />
                <Legend verticalAlign="top" height={36} />

                {data.data_series.map((s, i) => (
                  <Scatter
                    key={s.key}
                    data={data.data}
                    fill={colors[i]}
                    shape="circle"
                    strokeWidth={2}
                    style={glowShadow}
                  />
                ))}
              </ScatterChart>
            )}

            {data.type === "box" && (
              <div className="text-gray-400 text-center py-10">
                📦 BoxPlot coming soon!
              </div>
            )}
          </>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ChartMaker;
