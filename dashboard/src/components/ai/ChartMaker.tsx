/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
} from "recharts";
import type { TChartAndData } from "@/schemas/api"

export function ChartMaker({ data }: { data: TChartAndData }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold tracking-wide text-[#d8e1ec] truncate">
        {data.description}
      </h3>

      {/* Gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {colors.map((color, i) => (
            <linearGradient
              key={i}
              id={`grad${i}`}
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
      </svg>

      <div className="bg-[#0d1828] border border-[#1c2a3c] shadow-2xl rounded-xl p-4 backdrop-blur-xl transition hover:shadow-blue-900/40 hover:scale-[1.01]">
        <ResponsiveContainer width="100%" height={320}>
          <>
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
                    fill={colors[i]}
                    // fill={`url(#grad${i % colors.length})`}
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
                    stroke={`url(#grad${i})`}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, stroke: colors[i] }}
                    activeDot={{ r: 7, style: glowShadow }}
                    style={glowShadow}
                  />
                ))}
              </LineChart>
            )}

          {data.type === "pie" && (<>
            <PieChart>
              <Pie
                data={data.data}
                dataKey={data.dataSeries[0].key}
              >
                {data.dataSeries.map((s) => (
                  <Cell key={s.key} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </>)}

          {data.type === "scatter" && (<>
            <ScatterChart data={data.data}>
              {data.dataSeries.map((s) => (
                <Scatter
                  key={s.key}
                  dataKey={s.key}
                  fill={s.color}
                />
              ))}
            </ScatterChart>
          </>)}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ChartMaker;
