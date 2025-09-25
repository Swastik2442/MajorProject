// src/components/dashboard/KPIring.jsx
import React from "react";
import { PieChart, Pie, Cell } from "recharts";

export default function KPIring({ percent = 0, label = "Resolved" }) {
  const data = [{ name: "resolved", value: percent }, { name: "open", value: 100 - percent }];
  const COLORS = ["#10b981", "#1f2937"];
  return (
    <div className="card flex items-center justify-center flex-col">
      <div style={{ width: 120, height: 120 }}>
        <PieChart width={120} height={120}>
          <Pie data={data} innerRadius={40} outerRadius={56} dataKey="value" startAngle={90} endAngle={-270}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </div>
      <div className="text-xl font-bold mt-2">{percent}%</div>
      <div className="small-muted">{label}</div>
    </div>
  );
}
