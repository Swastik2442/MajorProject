import { useQuery } from "@tanstack/react-query";
import type { TClientsParams } from "../../schemas/api";
import { apiService } from "../../services/api";

export default function StatusCards({ client_id = null, org_id = null }: TClientsParams) {
  const { data } = useQuery({
    queryKey: ["problemsCount", client_id, org_id],
    queryFn: () => apiService.fetchProblemsCount(client_id, org_id),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const counts = data?.data ?? {
    activeProblems: 0,
    problemsInLast24Hours: 0,
    problemsInLastWeek: 0,
    problemsInLastMonth: 0,
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Active Problems */}
      <div className="bg-gray-900 rounded-xl shadow-md p-5 border border-gray-700">
        <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Current Status
        </div>
        <div className="mt-2 text-5xl font-extrabold text-red-500">
          {counts.activeProblems}
        </div>
        <div className="mt-1 text-sm text-gray-300">
          Total Active Problems
        </div>
      </div>

      {/* Problems Today */}
      <div className="bg-gray-900 rounded-xl shadow-md p-5 border border-gray-700">
        <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Total
        </div>
        <div className="mt-2 text-5xl font-extrabold text-blue-500">
          {counts.problemsInLast24Hours}
        </div>
        <div className="mt-1 text-sm text-gray-300">
          Total Problems Today
        </div>
      </div>

      {/* Optional: Problems Last Week */}
      <div className="bg-gray-900 rounded-xl shadow-md p-5 border border-gray-700">
        <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Last Week
        </div>
        <div className="mt-2 text-5xl font-extrabold text-green-500">
          {counts.problemsInLastWeek}
        </div>
        <div className="mt-1 text-sm text-gray-300">
          Problems in Last 7 Days
        </div>
      </div>

      {/* Optional: Problems Last Month */}
      <div className="bg-gray-900 rounded-xl shadow-md p-5 border border-gray-700">
        <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Last Month
        </div>
        <div className="mt-2 text-5xl font-extrabold text-yellow-500">
          {counts.problemsInLastMonth}
        </div>
        <div className="mt-1 text-sm text-gray-300">
          Problems in Last 30 Days
        </div>
      </div>
    </div>
  );
}
