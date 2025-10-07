import { useState } from "react";

export default function AlertBanner({ text = null }: { text: string | null }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="mb-6 rounded-xl bg-red-600/90 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-xl">⚠️</span>
        <span className="font-medium">
          CRITICAL SECURITY ALERT: ACTIVE! {text ?? "Check details"}
        </span>
      </div>
      <button
        className="text-white/70 hover:text-white"
        aria-label="Close alert"
        onClick={() => {setVisible(false)}}
        type="button"
      >
        ✕
      </button>
    </div>
  );
}
