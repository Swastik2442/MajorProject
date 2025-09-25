// src/utils/transform.js
// Normalization + light aggregation (used while backend aggregation endpoints are not present)

const severityWeight = {
  Critical: 10,
  critical: 10,
  Warning: 5,
  warning: 5,
  Information: 1,
  information: 1,
  "Not classified": 1,
};

function safeGet(obj, keys) {
  for (const k of keys) {
    if (obj && typeof obj[k] !== "undefined") return obj[k];
  }
  return null;
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  // common ISO or convertible formats:
  const iso = Date.parse(value);
  if (!Number.isNaN(iso)) return new Date(iso);
  // specific format '2025.09.16 15:59:24' -> convert
  const transformed = String(value).replace(/\./g, "-").replace(" ", "T");
  const parsed = Date.parse(transformed);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

export function normalizeProblems(rawList = []) {
  return rawList.map((r, i) => {
    const id = safeGet(r, ["_id", "ZID", "id"]) || `p_${i}_${Math.random().toString(36).slice(2,6)}`;
    const status = safeGet(r, ["Status", "status"]) || r.state || "Unknown";
    const severity = safeGet(r, ["Severity", "severity"]) || "Information";
    const host = safeGet(r, ["Host", "host"]) || safeGet(r, ["Linux", "hostname"]) || r.host || "unknown";
    const message = safeGet(r, ["Linux", "message"]) || safeGet(r, ["Message", "message", "Description"]) || r.message || "";
    const startAt = parseDate(safeGet(r, ["Start", "start", "startAt"]));
    const recoveredAt = parseDate(safeGet(r, ["Recovery", "recovery", "recoveredAt"]));
    const durationSeconds = safeGet(r, ["Duration", "duration"]) || (startAt && recoveredAt ? Math.round((recoveredAt - startAt) / 1000) : null);
    const isActive = !recoveredAt && /start|started|problem|active/i.test(String(status));
    return {
      id,
      status,
      severity,
      host,
      message,
      startAt,
      recoveredAt,
      durationSeconds,
      isActive,
      raw: r,
    };
  });
}

export function categorizeProblemText(txt = "") {
  const s = String(txt).toLowerCase();
  if (s.includes("cpu") || s.includes("utilization") || s.includes("high cpu")) return "Linux CPU";
  if (s.includes("fs") || s.includes("filesystem") || s.includes("disk")) return "Linux FS";
  if (s.includes("firewall") || s.includes("HA-Pair")) return "Firewall";
  if (s.includes("sql") || s.includes("injection")) return "SQL Injection";
  if (s.includes("zabbix")) return "Zabbix";
  return "Other";
}

export function computeHostScores(problems = []) {
  const map = {};
  problems.forEach((p) => {
    const host = p.host || "unknown";
    if (!map[host]) map[host] = { host, score: 0, count: 0, examples: [] };
    const w = severityWeight[p.severity] || 1;
    map[host].score += w;
    map[host].count += 1;
    if (map[host].examples.length < 3) map[host].examples.push(p.message || "");
  });
  return Object.values(map).map((h) => ({
    ...h,
    healthScore: Math.max(0, 100 - h.score),
  })).sort((a, b) => b.score - a.score);
}

export function computeSeverityMatrix(problems = []) {
  // grouped by category and by severity
  const groups = {};
  problems.forEach((p) => {
    const cat = categorizeProblemText(p.message || p.host || "");
    if (!groups[cat]) groups[cat] = { category: cat, Critical: 0, Warning: 0, Information: 0, Other: 0 };
    const sevKey = /crit/i.test(p.severity) ? "Critical" : /warn/i.test(p.severity) ? "Warning" : /info/i.test(p.severity) ? "Information" : "Other";
    groups[cat][sevKey] += 1;
  });
  return Object.values(groups);
}

export function compute24hTrends(problems = []) {
  const now = new Date();
  // build 24-buckets (older .. now)
  const buckets = Array.from({ length: 24 }, (_, i) => {
    const date = new Date(now.getTime() - (23 - i) * 3600 * 1000);
    return { ts: date, label: `${date.getHours()}:00`, newProblems: 0, activeProblems: 0 };
  });

  problems.forEach((p) => {
    if (p.startAt) {
      const diffH = Math.floor((now - p.startAt) / (3600 * 1000));
      if (diffH >= 0 && diffH < 24) {
        const idx = 23 - diffH;
        buckets[idx].newProblems += 1;
      }
    }
    if (p.isActive) {
      // place active count in the bucket of its start or current hour if no start
      const ref = p.startAt || now;
      const diffH = Math.floor((now - ref) / (3600 * 1000));
      if (diffH >= 0 && diffH < 24) {
        const idx = 23 - diffH;
        buckets[idx].activeProblems += 1;
      } else {
        buckets[buckets.length - 1].activeProblems += 1;
      }
    }
  });

  return buckets;
}
