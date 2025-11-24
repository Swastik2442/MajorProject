import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";

const PromptHistory = ({ setThreadId }: { setThreadId: (id: string | null) => void }) => {
  const { data: raw } = useQuery({
    queryKey: ["promptHistory"],
    queryFn: () => apiService.getPromptChartThreads({ limit: 50 }),
    staleTime: 60 * 1000, // 1 minute
  });
  const history = raw?.data ?? [];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-[#0e1620] border border-[#1f2933] rounded-xl p-4 shadow-md flex flex-col h-[78vh] overflow-hidden"
    >
      <h3 className="text-lg font-semibold text-gray-100 mb-3">Prompt History</h3>

      {history.length === 0 ? (
        <p className="text-gray-400 text-sm italic flex-1 flex items-center justify-center text-center px-2">
          No history yet. Try submitting a prompt.
        </p>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex-1">
          <div
            onClick={() => {setThreadId(null)}}
            className="w-full text-left p-3 rounded-lg bg-[#0f1a26] border border-[#1b2732] hover:border-indigo-600 transition-colors cursor-default"
          >
            <p aria-label="New Chat" className="text-sm text-gray-100 font-medium truncate">New Chat</p>
          </div>
          {history.map((item) => (
            <div
              key={item._id}
              onClick={() => {setThreadId(item._id)}}
              className="w-full text-left p-3 rounded-lg bg-[#0f1a26] border border-[#1b2732] hover:border-indigo-600 transition-colors cursor-default group"
            >
              <div className="flex justify-between items-center gap-1">
                <p title={item.title} className="text-sm text-gray-100 font-medium truncate">
                  {item.title}
                </p>
                <div className="invisible group-hover:visible">
                  {/* TODO: Add thread delete functionality */}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-gray-400 hover:text-red-400"
                    title="Delete Thread"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.aside>
  );
};

export default PromptHistory;
