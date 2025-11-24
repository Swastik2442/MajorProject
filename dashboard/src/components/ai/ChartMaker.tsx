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
    <div>
      <h3 className="text-lg font-semibold mb-2">{data.description}</h3>
      <div className="bg-[#0b1524] border border-[#1f2a37] rounded-lg p-4">
        <ResponsiveContainer width={80} height={28}>
          {data.type === "bar" && (<>
            <BarChart data={data.data}>
              {data.dataSeries.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  fill={s.color}
                />
              ))}
            </BarChart>
          </>)}

          {data.type === "box" && (<>Not implemented</>)}

          {data.type === "line" && (<>
            <LineChart data={data.data}>
              {data.dataSeries.map((s) => (
                <Line
                  key={s.key}
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                  strokeLinecap="round"
                />
              ))}
            </LineChart>
          </>)}

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
