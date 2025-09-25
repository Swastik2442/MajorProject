// src/components/dashboard/StatusCards.jsx
import React from "react";

export default function StatusCards({ totalActive = 0, totalToday = 0 }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <div className="text-sm text-gray-300">CURRENT STATUS</div>
        <div className="mt-3 text-4xl font-bold">{totalActive}</div>
        <div className="small-muted mt-1">Total Active Problems</div>
      </div>

      <div className="card">
        <div className="text-sm text-gray-300">TOTAL</div>
        <div className="mt-3 text-4xl font-bold">{totalToday}</div>
        <div className="small-muted mt-1">Total Problems Today</div>
      </div>
    </div>
  );
}
