import { useState } from "react";
import { FiX, FiAlertTriangle } from "react-icons/fi";

export default function AlertBanner({ text = null }: { text: string | null }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="w-full rounded-xl p-3 bg-accent-red/90 text-white shadow-md mb-6">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <FiAlertTriangle className="w-6 h-6" />
        <div className="font-medium flex-1">{text ?? "CRITICAL SECURITY ALERT: ACTIVE! Check details"}</div>
        <button
          className="ml-auto hover:text-red-200 hover:cursor-pointer transition-colors"
          aria-label="Close alert"
          onClick={() => {setVisible(false)}}
          type="button"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
