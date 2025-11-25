import { useEffect, useState, useCallback } from "react";
import { EventSource, type EventSourceInit } from 'eventsource';

type EventData = Record<string, unknown>;

export const useSse = (url: string, options?: EventSourceInit & { disabled?: boolean }) => {
  const [connectionState, setConnectionState] = useState<"CONNECTING" | "OPEN" | "CLOSED">("CONNECTING");
  const [connectionError, setConnectionError] = useState<Event | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [eventData, setEventData] = useState<EventData>({});

  // open the connection once and tidy up on unmount or when url / options change
  useEffect(() => {
    if (options?.disabled) return;
    const es = new EventSource(url, options);
    setEventSource(es);

    es.onopen = () => {setConnectionState("OPEN")};
    es.onerror = (err: Event) => {
      setConnectionState("CLOSED");
      setConnectionError(err);
    };

    return () => {es.close()};
  }, [url, options]);

  // register a listener for a specific event name
  const addListener = useCallback(
    (eventName: string, handler: (data: unknown) => void) => {
      if (!eventSource) return;

      const listener = (evt: MessageEvent) => {
        setEventData(prev => ({
          ...prev,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          [eventName]: evt.data,
        }));
        handler(evt.data);
      };

      eventSource.addEventListener(eventName, listener);
      return () => {eventSource.removeEventListener(eventName, listener)};
    },
    [eventSource],
  );

  const getEventData = useCallback(
    (eventName: string) => eventData[eventName],
    [eventData],
  );

  const closeConnection = useCallback(
    () => eventSource?.close(),
    [eventSource]
  );

  return {
    connectionState,
    connectionError,
    addListener,
    getEventData,
    closeConnection,
  };
};

export default useSse;
