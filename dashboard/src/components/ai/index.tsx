import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Bot, ChevronLeft, ChevronRight } from "lucide-react";
import type { TClientsParams, TDataResponseThreadParams, TResponse, TThreadLean } from "@/schemas/api";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import ChartMaker from "./ChartMaker";
import PromptHistory from "./promptHistory";
import AiEventShowcase from "./AiEventShowcase";
import { cn } from "@/utils/css";

// TODO: This is just a testing implementation and should be improved for actual use.
export default function LLMChatPage({ client_id = null, org_id = null }: TClientsParams) {
  const [thread, setThread] = useState<TThreadLean | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [tempData, setTempData] = useState<{ prompt: string; createdAt: string; } | null>(null);

  useEffect(() => {
    if (thread === null) {
      setIndex(null);
    } else {
      setIndex(thread.numberOfPrompts - 1);
    }
  }, [thread, setIndex]);

  const { data, refetch } = useQuery({
    queryKey: ["promptThreadDetails", client_id, org_id, thread, index],
    queryFn: async () => {
      if (thread === null) return null;
      const res = await apiService.getPromptChartThreadDetails({
        client_id,
        org_id,
        thread_id: thread._id,
        index: index ?? undefined,
      });
      return res.data;
    },
    enabled: thread !== null,
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
    onSuccess: (data, vars) => {
      if ("data" in data && data.data?.thread_id) {
        setThread({
          _id: data.data.thread_id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          title: vars.prompt,
          numberOfPrompts: 1
        });
        setLoading(true);
      }
      setIndex(null);
    },
    onError: (error, vars) => {
      console.error("Error submitting prompt:", error);
      setLoading(false);
      setTempData(null);
      setPrompt(vars.prompt);
    },
  });

  // Refetch response details when loading completes
  useEffect(() => {
    if (!loading) {
      setTempData(null);
      setIndex((prev) => {
        if (prev === null) void refetch();
        return null;
      });
    }
  }, [loading, refetch]);

  // Handle submitting a prompt
  const handleSubmit = (prompt: string): void => {
    const trimmed = prompt.trim();
    if (!trimmed || isPending || loading) return;

    setTempData({ prompt: trimmed, createdAt: new Date().toLocaleString() });
    mutate({ prompt: trimmed, thread_id: thread?._id ?? null });
  };

  return (
    <div className="w-full min-h-[78vh] grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-6">
      <PromptHistory thread={thread} setThread={setThread} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col bg-card-darker border rounded-xl shadow-lg p-5 md:p-6 h-[78vh]"
      >
        <ChatHeader enabled={thread === null} />

        {/* Chat Area */}
        <div className="flex flex-col flex-1 overflow-hidden justify-center">
          {thread !== null && (
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {data ? (<>
                  <UserMessage {...data} />

                  {/* AI RESPONSE */}
                  <div className="flex relative">
                    <div className="bg-card border rounded-xl px-4 py-3 shadow wrap-break-word w-full">
                      {data.charts?.map((chart, idx) => (
                        <ChartMaker key={`chart-${idx}`} data={chart} />
                      )) ?? (data.error ?? "No charts generated. Please refine your prompt.")}
                    </div>
                    {(index !== null && thread.numberOfPrompts > 1) && (
                      <div className="flex justify-center items-center absolute -bottom-5 z-10">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {setIndex((prev) => (prev === null ? null : Math.max(prev - 1, 0)))}}
                          disabled={index === 0}
                        >
                          <ChevronLeft />
                        </Button>
                        <span>{index + 1}/{thread.numberOfPrompts}</span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {setIndex((prev) => (prev === null ? null : Math.min(prev + 1, thread.numberOfPrompts - 1)))}}
                          disabled={index === thread.numberOfPrompts - 1}
                        >
                          <ChevronRight />
                        </Button>
                      </div>
                    )}
                  </div>
                </>) : (<>
                  {tempData && <UserMessage {...tempData} />}
                </>)}
              </motion.div>

              {(isPending || loading) && <LoadingAnimation />}
            </div>
          )}

          {thread ? <AiEventShowcase threadId={thread._id} setLoading={setLoading} /> : <div className="mt-4"></div>}

          {/* INPUT BAR */}
          <InputBar prompt={prompt} setPrompt={setPrompt} handleSubmit={handleSubmit} loading={isPending || loading} />
        </div>
      </motion.div>
    </div>
  );
}

const LoadingAnimation = () => (
  <div className="flex items-start gap-3 mt-2">
    <div className="w-9 h-9 rounded-md bg-card flex items-center justify-center">
      <Bot className="w-4 h-4 text-blue-400 animate-pulse" />
    </div>
    <div className="bg-card border rounded-xl px-4 py-3">
      <p className="text-muted-foreground text-sm">Generating response...</p>
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
);

const UserMessage = ({ prompt, createdAt }: { prompt: string; createdAt: string; }) => (
  <div className="flex justify-end">
    <div className="max-w-[75%] bg-card border rounded-xl px-4 py-2 shadow-sm wrap-break-word">
      <p className="text-sm whitespace-pre-wrap">
        {prompt}
      </p>
      <div className="text-[0.7rem] text-gray-500 text-right mt-1">
        {createdAt.toLocaleString()}
      </div>
    </div>
  </div>
);

const InputBar = ({ prompt, setPrompt, handleSubmit, loading }: { prompt: string; setPrompt: React.Dispatch<React.SetStateAction<string>>; handleSubmit: (prompt: string) => void; loading: boolean; }) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(prompt);
        setPrompt("");
      }}
      className="flex items-center gap-3 shrink-0"
    >
      <textarea
        ref={inputRef}
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value);
        }}
        rows={1}
        placeholder="Type your question..."
        className="w-full resize-none bg-card border rounded-lg text-primary placeholder-muted-foreground text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(prompt);
            setPrompt("");
          }
        }}
        disabled={loading} />
      <button
        type="button"
        onClick={() => {
          handleSubmit(prompt)
          setPrompt("");
        }}
        disabled={loading}
        aria-label="Send prompt"
        className="inline-flex items-center justify-center rounded-lg p-2 bg-linear-to-br from-indigo-500 to-cyan-400 shadow-lg hover:scale-105 transition"
      >
        <Send className="w-4 h-4 text-white" />
      </button>
    </form>
  );
}

const ChatHeader = ({ enabled }: { enabled: boolean }) => (
  <AnimatePresence>
    {enabled && (
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.25 }}
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        className={cn("flex items-center gap-3 mb-4", enabled && "absolute")}
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-md bg-linear-to-br from-indigo-600 to-cyan-400 shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-primary">AI Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Ask about network stats or analytics insights.
          </p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
