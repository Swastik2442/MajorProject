// src/components/dashboard/HostScorecards.jsx
import React from "react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";

export default function HostScorecards({ hosts = [] }) {
  return (
    <div className="card">
      <div className="font-semibold mb-4">HOST HEALTH SCORECARDS</div>
      <div className="grid grid-cols-2 gap-4">
        {hosts.slice(0, 4).map((h) => (
          <div key={h.host} className="bg-[#0b1420] p-3 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-300">{h.host}</div>
                <div className="text-2xl font-bold">{Math.round(h.healthScore)}</div>
                <div className="small-muted">Score</div>
              </div>
              <div style={{ width: 140, height: 60 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ v: h.count, dummy: 0 }]}>
                    <Bar dataKey="v" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
