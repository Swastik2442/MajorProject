import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PromptBoxProps {
  onSubmit: (prompt: string) => void;
}

const PromptBox: React.FC<PromptBoxProps> = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
      setPrompt("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-[#101827] border border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100">
            AI Assistant
          </CardTitle>
          <p className="text-sm text-gray-400">
            Ask about network stats, predictions, or analytics insights.
          </p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <textarea
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); }}
              placeholder="e.g., Show top 10 hosts by traffic usage..."
              className="w-full bg-[#1E293B] text-gray-200 rounded-lg p-3 text-sm border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              rows={4}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PromptBox;
