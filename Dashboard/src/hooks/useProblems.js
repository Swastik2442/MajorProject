// src/hooks/useProblems.js
import { useQuery } from "@tanstack/react-query";
import { fetchProblems } from "../services/api";
import {
  normalizeProblems,
  computeHostScores,
  computeSeverityMatrix,
  compute24hTrends,
} from "../utils/transform";

export default function useProblems() {
  return useQuery(
    ["problems"],
    async () => {
      const raw = await fetchProblems();
      const problems = normalizeProblems(raw || []);
      const hostScores = computeHostScores(problems);
      const severityMatrix = computeSeverityMatrix(problems);
      const trends = compute24hTrends(problems);

      const totalActive = problems.filter((p) => p.isActive).length;
      const totalToday = problems.filter((p) => {
        if (!p.startAt) return false;
        const start = new Date();
        start.setHours(0,0,0,0);
        return p.startAt >= start;
      }).length;
      const resolvedCount = problems.filter((p) => /recover/i.test(String(p.status))).length;
      const resolutionRate = problems.length ? Math.round((resolvedCount / problems.length) * 100) : 0;

      return {
        raw: problems,
        hostScores,
        severityMatrix,
        trends,
        totalActive,
        totalToday,
        resolutionRate,
      };
    },
    {
      staleTime: 1000 * 60 * 30,
      refetchInterval: 1000 * 60 * 60,
    }
  );
}
