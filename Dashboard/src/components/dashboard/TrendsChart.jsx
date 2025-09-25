// src/components/dashboard/TrendsChart.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

export default function TrendsChart({ data = [] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">PROBLEM TRENDS (Last 24 Hours)</div>
      </div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f1720" />
            <XAxis dataKey="label" minTickGap={10} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="newProblems" name="New Problems" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="activeProblems" name="Active Problems" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
