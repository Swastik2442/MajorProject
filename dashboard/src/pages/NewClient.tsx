import { API_KEY_TEMP_STORAGE_KEY } from "@/config";
import { useEffect, useState } from "react";

export function SetupInstructions({ url, apiKey }: { url: string; apiKey: string | null; }) {
  return (
    <div>
      <h2>Setup Instructions</h2>
      <p>To get started, follow these steps:</p>
      <ol>
        <li>Set your URL to: <code>{url}</code></li>
        <li>Set the API_KEY{apiKey ?<>: <code>{apiKey}</code></> : " to the API Key retrieved earlier"}</li>
      </ol>
    </div>
  )
}

export default function NewClient() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_TEMP_STORAGE_KEY);
    setApiKey(storedApiKey);
    if (storedApiKey) {
      // Remove the API key from local storage after retrieving it
      localStorage.removeItem(API_KEY_TEMP_STORAGE_KEY);
    }
  }, []);

  return (
    <div>
      <SetupInstructions url={import.meta.env.VITE_API_URL} apiKey={apiKey} />
    </div>
  )
}
