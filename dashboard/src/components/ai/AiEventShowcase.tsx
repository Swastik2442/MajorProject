import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUserEvents } from "@/contexts/userEvents";
import {
  SSEResponseAiEventSchema,
  type TAiEvent
} from "@/schemas/api";

export type LastAiEvent = TAiEvent & { timestamp: number; type: "out" | "err" };

const EVENT_TIMEOUT_MS = 30000;

export function AiEventShowcase({ threadId, setLoading }: { threadId: string; setLoading: React.Dispatch<React.SetStateAction<boolean>>; }) {
  const { addListener } = useUserEvents();
  const [tick, setTick] = useState(new Date().getTime());
  const [lastAiEvent, setLastAiEvent] = useState<LastAiEvent | null>(null);
  const eventTimedOut = lastAiEvent ? (tick - lastAiEvent.timestamp > EVENT_TIMEOUT_MS) : false;

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(new Date().getTime());
    }, 1000);
    return () => {clearInterval(interval)};
  }, [setTick]);

  useEffect(() => {
    if (eventTimedOut) {
      setLoading(false);
    }
  }, [eventTimedOut, setLoading]);

  useEffect(() => {
    const onOut = (data: unknown) => {
      const parsed = SSEResponseAiEventSchema.parse(data);
      setLastAiEvent({ ...parsed.data, timestamp: new Date().getTime(), type: "out" });
      if (parsed.data.entity_type === "agent" && parsed.data.entity_state === "end") {
        setLoading(false);
      } else {
        setLoading(true);
      }
    };
    const onErr = (data: unknown) => {
      const parsed = SSEResponseAiEventSchema.parse(data);
      setLastAiEvent({ ...parsed.data, timestamp: new Date().getTime(), type: "err" });
    };

    const removeOutListener = addListener(`thread_${threadId}|out`, onOut);
    const removeErrListener = addListener(`thread_${threadId}|err`, onErr);

    return () => {
      removeOutListener?.();
      removeErrListener?.();
    };
  }, [addListener, threadId, setLoading]);

  return (
    <div className="h-4 p-1 pl-3 text-xs text-gray-400">
      {lastAiEvent && !eventTimedOut && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1 mt-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ y: ["0%", "-40%", "0%"] }}
                transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
                className="w-2 h-2 rounded-full bg-gray-400"
              />
            ))}
          </div>
          <strong className={lastAiEvent.type === "err" ? "text-red-400" : ""}>
            {lastAiEvent.message}
          </strong>
        </div>
      )}
    </div>
  );
}

export default AiEventShowcase;
