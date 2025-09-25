import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../services/api";

export default function StatusCards() {
  const { data } = useQuery({
    queryKey: ["problemsCount"],
    queryFn: apiService.fetchProblemsCount,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
  const counts = data?.data ?? { activeProblems: 0, problemsInLast24Hours: 0, problemsInLastMonth: 0, problemsInLastWeek: 0 };
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <div className="text-sm text-gray-300">CURRENT STATUS</div>
        <div className="mt-3 text-4xl font-bold">{counts.activeProblems}</div>
        <div className="small-muted mt-1">Total Active Problems</div>
      </div>

      <div className="card">
        <div className="text-sm text-gray-300">TOTAL</div>
        <div className="mt-3 text-4xl font-bold">{counts.problemsInLast24Hours}</div>
        <div className="small-muted mt-1">Total Problems Today</div>
      </div>

      {/* TODO: Add cards for Last Week and Last Month if needed */}
    </div>
  );
}
