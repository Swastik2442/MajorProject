import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { TThreadLean } from "@/schemas/api";
import { apiService } from "@/services/api";
import { cn } from "@/utils/css";
import DeleteThreadButton from "./DeleteThread";
import UpdateThreadButton from "./UpdateThread";

const PromptHistory = ({ thread, setThread }: { thread: TThreadLean | null; setThread: (thread: TThreadLean | null) => void }) => {
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
      className="bg-card border rounded-xl shadow-md flex flex-col h-[78vh] overflow-hidden"
    >
      {history.length === 0 ? (
        <p className="text-muted-foreground text-sm italic flex-1 flex items-center justify-center text-center px-6">
          No history yet. Try submitting a prompt.
        </p>
      ) : (<>
        <h4 className="text-md font-semibold text-muted-foreground px-7 pt-4 pb-3">History</h4>
        <div className="overflow-y-auto p-4 pt-0 flex-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <NewThread
            onClick={() => {setThread(null)}}
            className={thread === null ? "border-indigo-600" : ""}
          />
          {history.map((item) => (
            <ThreadItem
              key={item._id}
              thread={item}
              onClick={() => {setThread(item)}}
              onDelete={() => {setThread(null)}}
              className={(thread?._id === item._id) ? "border-indigo-600" : ""}
            />
          ))}
        </div>
      </>)}
    </motion.aside>
  );
};

const ThreadItemClass = "p-3 rounded-lg bg-card-darker border border-transparent hover:border-indigo-600 transition-colors cursor-default";

const NewThread = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(ThreadItemClass, className)}
    {...props}
  >
    <p aria-label="New Chat" className="text-sm text-primary font-medium truncate h-5">New Chat</p>
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
      <div className="flex justify-between items-center gap-1 h-5">
        <p title={thread.title} className="text-sm text-primary font-medium truncate">
          {thread.title}
        </p>
        <div className="hidden group-hover:flex">
          <UpdateThreadButton thread={thread} />
          <DeleteThreadButton threadId={thread._id} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
};

export default PromptHistory;
