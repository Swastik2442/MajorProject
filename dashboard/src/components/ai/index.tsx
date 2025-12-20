import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Send, Bot, ChevronLeft, ChevronRight } from "lucide-react";
import type { TClientsParams, TDataResponseThreadParams, TResponse } from "@/schemas/api";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import ChartMaker from "./ChartMaker";
import PromptHistory from "./PromptHistory";

// TODO: This is just a testing implementation and should be improved for actual use.
export default function LLMChatPage({ client_id = null, org_id = null }: TClientsParams) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const { data } = useQuery({
    queryKey: ["promptThreadDetails", client_id, org_id, threadId, index],
    queryFn: async () => {
      if (threadId === null) return null;
      const res = await apiService.getPromptChartThreadDetails({
        client_id,
        org_id,
        thread_id: threadId,
        index: index ?? undefined,
      });
      return res.data ?? null;
    },
    enabled: threadId !== null,
    staleTime: 30 * 1000, // 30 seconds
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["aiPrompt"],
    mutationFn: ({ prompt, thread_id = null }: { prompt: string; thread_id?: string | null }) => {
      if (thread_id === null) {
        return apiService.startPromptChart({ prompt }) as Promise<TDataResponseThreadParams | TResponse>;
      }
      return apiService.continuePromptChart({ prompt, thread_id }) as Promise<TDataResponseThreadParams | TResponse>;
    },
    onSuccess: (data) => {
      if ("data" in data && data.data?.thread_id) {
        setThreadId(data.data.thread_id);
      }
      setIndex(null);
    },
  });

  // Auto-focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle submitting a prompt
  const handleSubmit = (): void => {
    const trimmed = prompt.trim();
    if (!trimmed || isPending) return;

    mutate({ prompt: trimmed, thread_id: threadId });
    setPrompt("");
  };

  return (
    <div className="w-full min-h-[78vh] grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-6">
      <PromptHistory setThreadId={setThreadId} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col bg-[#0f1720] border border-[#1b2430] rounded-xl shadow-lg p-5 md:p-6 h-[78vh]"
      >
        {/* Chat Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-cyan-400 shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-100">AI Assistant</h2>
            <p className="text-sm text-gray-400">
              Ask about network stats, predictions, or analytics insights.
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {history.length === 0 && !isPending && (
              <p className="text-gray-500 italic mt-10 text-center">
                No analysis yet. Start by typing a prompt below.
              </p>
            )}

            {data && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {/* USER MESSAGE */}
                <div className="flex justify-end">
                  <div className="max-w-[75%] bg-[#111c2b] border border-[#1f2b3b] text-gray-100 rounded-xl px-4 py-2 shadow-sm break-words">
                    <p className="text-sm whitespace-pre-wrap">
                      {data.prompt}
                    </p>
                    <div className="text-[0.7rem] text-gray-500 text-right mt-1">
                      {data.createdAt.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* AI RESPONSE */}
                <div className="flex relative">
                  <div className="bg-[#071522] border border-[#0d2940] rounded-xl px-4 py-3 shadow break-words">
                    {data.charts?.map((chart, idx) => (
                      <ChartMaker key={`chart-${idx}`} data={chart} />
                    )) ?? "No charts generated. Please refine your prompt."}
                  </div>
                  {index !== null && <div className="flex justify-center items-center absolute -bottom-5 z-10">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {console.log("Not Implemented Yet")}}
                    >
                      <ChevronLeft />
                    </Button>
                    <span>{index}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {console.log("Not Implemented Yet")}}
                    >
                      <ChevronRight />
                    </Button>
                  </div>}
                </div>
              </motion.div>
            )}

            {/* LOADING ANIMATION */}
            {isPending && (
              <div className="flex items-start gap-3 mt-2">
                <div className="w-9 h-9 rounded-md bg-[#081523] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-400 animate-pulse" />
                </div>
                <div className="bg-[#071522] border border-[#0d2940] rounded-xl px-4 py-3">
                  <p className="text-gray-300 text-sm">Generating response...</p>
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

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="mt-4 flex items-center gap-3 flex-shrink-0"
          >
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
              }}
              rows={1}
              placeholder="Type your question..."
              className="w-full resize-none bg-[#0b1524] border border-[#1f2a37] rounded-lg text-gray-200 placeholder-gray-400 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => {
                handleSubmit();
              }}
              disabled={isPending}
              aria-label="Send prompt"
              className="inline-flex items-center justify-center rounded-lg p-2 bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg hover:scale-105 transition"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
