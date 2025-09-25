// src/components/dashboard/ActivityStream.jsx
import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

function MiniSpark({ data = [] }) {
  return (
    <div style={{ width: 100, height: 36 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} strokeLinecap="round" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ActivityStream({ items = [] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">PROBLEM ACTIVITY STREAM</div>
        <div className="small-muted">latest</div>
      </div>

      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between gap-4 border border-gray-800 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-1 ${it.severity && /crit/i.test(it.severity) ? "bg-red-500" : it.severity && /warn/i.test(it.severity) ? "bg-yellow-500" : "bg-green-500"}`} />
              <div>
                <div className="font-medium">{it.message || "(no message)"} </div>
                <div className="small-muted mt-1">{it.host} · {it.startAt ? it.startAt.toLocaleString() : "unknown"}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <MiniSpark data={(it.spark || [0,1,0,2,1,0]).map((v, i) => ({ v }))} />
              <div className="small-muted text-right">{it.durationSeconds ? `${Math.round((it.durationSeconds/60))}m` : ""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
