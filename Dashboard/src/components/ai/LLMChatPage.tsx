import React, { useState, type JSX } from "react";
import { motion } from "framer-motion";
import PromptHistory from "./promptHistory";
import { Send, Bot } from "lucide-react";

export default function LLMChatPage(): JSX.Element {
  const [history, setHistory] = useState<
    { id: string; prompt: string; response: string; timestamp: string }[]
  >([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    const id = crypto.randomUUID();

    // simulate backend call
    window.setTimeout(() => {
      const resp = `🔍 AI Analysis Result:\n\nYou asked: "${trimmed}"\n\nHere’s a summary or predicted insight based on your query.`;
      setHistory((prev) => [
        { id, prompt: trimmed, response: resp, timestamp: new Date().toISOString() },
        ...prev,
      ]);
      setIsLoading(false);
    }, 1300);

    setPrompt("");
  };

  return (
    <div className="w-full min-h-[78vh] grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-6">
      {/* LEFT - HISTORY */}
      <PromptHistory history={history} />

      {/* RIGHT - CHAT */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col bg-[#0f1720] border border-[#1b2430] rounded-xl shadow-lg p-5 md:p-6 overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-cyan-400 shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-100">AI Chat Assistant</h2>
            <p className="text-sm text-gray-400">
              Ask about network stats, predictions, or analytics insights.
            </p>
          </div>
        </div>

        {/* CHAT MESSAGES */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {history.length === 0 && !isLoading && (
            <p className="text-gray-500 italic mt-10 text-center">
              No conversation yet. Start by typing a prompt below.
            </p>
          )}

          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {/* USER */}
              <div className="flex justify-end">
                <div className="max-w-[75%] bg-[#111c2b] border border-[#1f2b3b] text-gray-100 rounded-xl px-4 py-2 shadow-sm break-words">
                  <p className="text-sm whitespace-pre-wrap break-words">{item.prompt}</p>
                  <div className="text-[0.7rem] text-gray-500 text-right mt-1">You</div>
                </div>
              </div>

              {/* AI */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-gradient-to-br from-indigo-600 to-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#071522] border border-[#0d2940] rounded-xl px-4 py-3 shadow max-w-[80%] break-words">
                  <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {item.response}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 mt-2">
              <div className="w-9 h-9 rounded-md bg-[#081523] flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400 animate-pulse" />
              </div>
              <div className="bg-[#071522] border border-[#0d2940] rounded-xl px-4 py-3">
                <p className="text-gray-300 text-sm">Generating visualization...</p>
                <div className="flex gap-1 mt-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ y: ["0%", "-40%", "0%"] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
                      className="w-2 h-2 rounded-full bg-blue-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mt-5 flex items-center gap-3"
        >
          <textarea
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); }}
            rows={1}
            placeholder="Type your question..."
            className="w-full resize-none bg-[#0b1524] border border-[#1f2a37] rounded-lg text-gray-200 placeholder-gray-400 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => { handleSubmit(); }}
            disabled={isLoading}
            aria-label="Send prompt"
            className="inline-flex items-center justify-center rounded-lg p-2 bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg hover:scale-105 transform transition"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
