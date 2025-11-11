import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

interface PromptOutputProps {
  output: string | null;
  isLoading?: boolean;
}

const PromptOutput: React.FC<PromptOutputProps> = ({ output, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-[#101827] border border-gray-700 shadow-lg mt-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100">
            LLM Output
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-3 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing your request...</span>
            </div>
          ) : output ? (
            <div className="flex items-start gap-3 text-gray-200">
              <Search className="w-5 h-5 mt-1 text-indigo-400 flex-shrink-0" />
              <p className="leading-relaxed whitespace-pre-wrap">{output}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No response yet. Submit a prompt to get AI insights.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PromptOutput;
