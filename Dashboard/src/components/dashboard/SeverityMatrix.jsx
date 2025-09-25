// src/components/dashboard/SeverityMatrix.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SeverityMatrix({ data = [] }) {
  // data: [{category, Critical, Warning, Information, Other}]
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">PROBLEM SEVERITY MATRIX</div>
      </div>

      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f1720" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="category" width={120} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Critical" stackId="a" fill="#ef4444" />
            <Bar dataKey="Warning" stackId="a" fill="#f59e0b" />
            <Bar dataKey="Information" stackId="a" fill="#10b981" />
            <Bar dataKey="Other" stackId="a" fill="#6b7280" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
