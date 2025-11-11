import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bot } from "lucide-react";

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
  if (history.length === 0) {
    return (
      <Card className="bg-[#101827] border border-gray-700 shadow-lg mt-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100">
            Prompt History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 italic">No history yet. Try submitting a prompt!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6"
    >
      <Card className="bg-[#101827] border border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100">
            Prompt History
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="border border-gray-700 rounded-lg p-3 bg-[#1E293B] shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <p className="text-gray-300 text-sm font-medium">
                  {item.prompt}
                </p>
              </div>
              <div className="flex items-start gap-2 mt-2">
                <Bot className="w-4 h-4 text-emerald-400 mt-1" />
                <p className="text-gray-400 text-sm whitespace-pre-wrap">
                  {item.response}
                </p>
              </div>
              <p className="text-[0.7rem] text-gray-500 mt-2 text-right">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PromptHistory;
