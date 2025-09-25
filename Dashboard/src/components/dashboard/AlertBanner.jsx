// src/components/dashboard/AlertBanner.jsx
import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default function AlertBanner({ text }) {
  return (
    <div className="w-full rounded-xl p-3 bg-accent-red/90 text-white shadow-md mb-6">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <FiAlertTriangle className="w-6 h-6" />
        <div className="font-medium">{text || "CRITICAL SECURITY ALERT: ACTIVE! Check details"}</div>
      </div>
    </div>
  );
}
