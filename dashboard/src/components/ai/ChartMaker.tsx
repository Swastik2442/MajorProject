import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
} from "recharts";
import type { TChartAndData } from "@/schemas/api"

function ChartMaker({ data }: { data: TChartAndData }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{data.description}</h3>
      <div className="bg-[#0b1524] border border-[#1f2a37] rounded-lg p-4">
        <ResponsiveContainer width={80} height={28}>
          {data.type === "bar" && (<>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            <BarChart data={data.data}>
              <Bar dataKey="notClassified" fill="#3b82f6" />
              <Bar dataKey="information" fill="#3b82f6" />
              <Bar dataKey="warning" fill="#3b82f6" />
              <Bar dataKey="average" fill="#3b82f6" />
              <Bar dataKey="high" fill="#3b82f6" />
              <Bar dataKey="disaster" fill="#3b82f6" />
            </BarChart>
          </>)}

          {data.type === "box" && (<>Not implemented</>)}

          {data.type === "line" && (<>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            <LineChart data={data.data}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
                strokeLinecap="round"
              />
            </LineChart>
          </>)}

          {data.type === "pie" && (<>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            <PieChart data={data.data}>
              <Pie
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={10}
                fill="var(--chart-2)"
              />
            </PieChart>
          </>)}

          {data.type === "scatter" && (<>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            <ScatterChart data={data.data}>
              <Scatter
                dataKey="value"
                cx="50%"
                cy="50%"
                fill="var(--chart-2)"
              />
            </ScatterChart>
          </>)}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ChartMaker
