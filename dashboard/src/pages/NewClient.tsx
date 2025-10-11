import { useEffect, useState } from "react";
import { DownloadIcon } from "lucide-react";
import { API_KEY_TEMP_STORAGE_KEY } from "@/config";
import data from "@/zbx-mediatype-template.json";

const messageTemplates = data.zabbix_export.media_types[0].message_templates;

export function SetupInstructions({ url, apiKey }: { url: string; apiKey: string | null; }) {
  return (
    <div>
      <h2 className="text-lg">Setup Instructions</h2>
      <p>
        <span>To get started,</span>
        <span>setup a Webhook Media Type in your Zabbix Server,</span>
        <span>either via importing this</span>
        <a href="/zbx-mediatype-template.json" className="inline-flex items-center px-1 gap-2" download>
          <span>Media Type template</span>
          <DownloadIcon className="size-4" />
        </a>
        <span>or following these steps manually-</span>
      </p>
      <ol className="list-decimal ml-5 my-3"> {/* TODO: Make the code blocks copy-able? */}
        <li>Create a new Webhook Media Type.</li>
        <li>Add a new Parameter <code>URL</code> set to: <code>{url}</code></li>
        <li>
          Add a new Parameter <code>API_KEY</code> set
          {apiKey ? <> to: <code>{apiKey}</code></> : " to the API Key retrieved earlier"}
        </li>
        <li className="flex flex-col">
          <span>Write the following code into the Script text box-</span>
          <code className="whitespace-pre-line">{data.zabbix_export.media_types[0].script}</code>
        </li>
        <li>
          <span>Add the Message Templates as the JSON strings for each Message Type-</span>
          <ul className="list-disc ml-5"> {/* BUG: List Disc is not visible */}
            {messageTemplates.map(v => (
              <li className="flex flex-col">
                <span>{`${v.event_source} ${v.operation_mode}- ${v.subject}`}</span>
                <code className="whitespace-pre-line">{v.message}</code>
              </li>
            ))}
          </ul>
        </li>
        <li>Enable the Media Type.</li>
      </ol>
      <p>
        Furthermore, create a new Media for a user with the type as the created Media Type.
        Lastly, create a new Trigger Action and a new Service Action with the operation
        as the created Media Type and User as selected earlier.
      </p>
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
