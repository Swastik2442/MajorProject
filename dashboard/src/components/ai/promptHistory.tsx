import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PromptHistoryItem {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
}

interface PromptHistoryProps {
  history: PromptHistoryItem[];
  onClear?: () => void;
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
              <div className="flex justify-between items-center group">
                <p title={item.prompt} className="text-sm text-gray-100 font-medium truncate">
                  {item.prompt}
                </p>
                <div className="invisible group-hover:visible">
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
