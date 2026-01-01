import {
  type TooltipContentProps
} from "recharts";

interface TooltipPayload {
  name: string;
  value: number;
  fill: string;
}

export function CustomTooltip({ active, payload, label }: TooltipContentProps<number | string, string>) {
  if (active && payload.length) {
    return (
      <div
        style={{
          background: "rgba(17, 24, 39, 0.85)",
          color: "#f8fafc",
          padding: "10px 14px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          backdropFilter: "blur(6px)",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
        {(payload as TooltipPayload[]).map((entry, index) => (
          <p key={`item-${index}`} style={{ margin: 0, color: entry.fill }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default CustomTooltip;
