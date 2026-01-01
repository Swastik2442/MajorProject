import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { TThreadLean } from "@/schemas/api";
import { apiService } from "@/services/api";
import { cn } from "@/utils/css";
import DeleteThreadButton from "./DeleteThread";
import UpdateThreadButton from "./UpdateThread";

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
      className="bg-[#0e1620] border border-[#1f2933] rounded-xl shadow-md flex flex-col h-[78vh] overflow-hidden"
    >
      <h3 className="text-lg font-semibold text-gray-100 mb-3 p-4 pb-0">Prompt History</h3>

      {history.length === 0 ? (
        <p className="text-gray-400 text-sm italic flex-1 flex items-center justify-center text-center py-4 px-6">
          No history yet. Try submitting a prompt.
        </p>
      ) : (
        <div className="space-y-3 overflow-y-auto pl-4 pb-4 pr-4 flex-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <NewThread onClick={() => {setThreadId(null)}} />
          {history.map((item) => (
            <ThreadItem key={item._id} thread={item} onClick={() => {setThreadId(item._id)}} onDelete={() => {setThreadId(null)}} />
          ))}
        </div>
      )}
    </motion.aside>
  );
};

const ThreadItemClass = "w-full text-left p-3 rounded-lg bg-[#0f1a26] border border-[#1b2732] hover:border-indigo-600 transition-colors cursor-default";

const NewThread = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(ThreadItemClass, className)}
    {...props}
  >
    <p aria-label="New Chat" className="text-sm text-gray-100 font-medium truncate">New Chat</p>
  </div>
);

const ThreadItem = ({
  thread,
  onDelete,
  className,
  ...props
}: {
  thread: TThreadLean;
  onDelete: () => void;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(ThreadItemClass, "group", className)}
      {...props}
    >
      <div className="flex justify-between items-center gap-1">
        <p title={thread.title} className="text-sm text-gray-100 font-medium truncate">
          {thread.title}
        </p>
        <div className="flex invisible group-hover:visible">
          <UpdateThreadButton thread={thread} />
          <DeleteThreadButton threadId={thread._id} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
};

export default PromptHistory;
