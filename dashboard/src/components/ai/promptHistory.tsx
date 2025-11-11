import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Clock } from "lucide-react";

export interface PromptHistoryItem {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
}

interface PromptHistoryProps {
  history: PromptHistoryItem[];
}

const PromptHistory: React.FC<PromptHistoryProps> = ({ history }) => {
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
          {history.map((item) => (
            <div
              key={item.id}
              className="w-full text-left p-3 rounded-lg bg-[#0f1a26] border border-[#1b2732] hover:border-indigo-600 transition-colors cursor-default"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-cyan-400 rounded-md shadow">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-100 font-medium truncate">{item.prompt}</p>
                  <p className="text-[0.75rem] text-gray-400 line-clamp-2 break-words">
                    {item.response}
                  </p>
                  <div className="flex items-center justify-end mt-1">
                    <Clock className="w-3 h-3 text-gray-500 mr-1" />
                    <span className="text-[0.7rem] text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
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
