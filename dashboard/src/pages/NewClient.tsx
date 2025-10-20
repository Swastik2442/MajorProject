import { useEffect, useState } from "react";
import { DownloadIcon } from "lucide-react";
import { API_KEY_TEMP_STORAGE_KEY } from "@/config";
import { CopyButton } from "@/components/ui/copy-button";
import data from "@/zbx-mediatype-template.json";

export function SetupInstructions({ url, apiKey }: { url: string; apiKey: string | null }) {
  data.zabbix_export.media_types[0].parameters[0].value = apiKey ?? "<YOUR_API_KEY_HERE>";
  data.zabbix_export.media_types[0].parameters[4].value = url;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Zabbix Setup Instructions</h2>
      <p className="">
        To get started, setup a Webhook Media Type in your Zabbix Server by importing this{" "}
        <a
          download
          href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`}
          className="inline-flex items-center gap-1 text-blue-600 underline hover:text-blue-800"
        >
          Media Type template <DownloadIcon className="w-4 h-4" />
        </a>.
        {apiKey === null && " Make sure to set the API Key, to the one retrieved earlier, in the template."}
      </p>

      <details className="border rounded-xl animate-collapsible-down">
        <summary className="cursor-pointer p-4">Follow these steps if you cannot import the template.</summary>
        <ol className="list-decimal list-inside space-y-3 border-t p-4">
          <li>Create a new Webhook Media Type.</li>
          <li>
            Add a new Parameter <code className="bg-background px-1 py-0.5 rounded">URL</code> set to:{" "}
            <span className="bg-background px-1 py-0.5 rounded">{url}</span>
            <CopyButton text={url} />
          </li>
          <li>
            Add a new Parameter <code className="bg-background px-1 py-0.5 rounded">API_KEY</code> set{" "}
            {apiKey ? (
              <>
                to: <span className="bg-background px-1 py-0.5 rounded">{apiKey}</span>
                <CopyButton text={apiKey} />
              </>
            ) : (
              "to the API Key retrieved earlier."
            )}
          </li>
          <li>
            Write the following code into the <strong>Script</strong> text box:
            <div className="relative mt-2 group">
              <pre className="bg-background p-3 pr-10 rounded overflow-x-auto whitespace-pre-wrap text-sm shadow-sm">
                {data.zabbix_export.media_types[0].script}
              </pre>
              <CopyButton
                text={data.zabbix_export.media_types[0].script}
                className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </li>
          <li>
            Add the Subject and Message Templates as the JSON strings for each Message Type:
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
              {data.zabbix_export.media_types[0].message_templates.map((v, idx) => (
                <li key={idx}>
                  <span className="font-semibold">{v.event_source} {v.operation_mode}</span>
                  <div className="ml-4">
                    <div className="relative mt-1 group">
                      <pre className="bg-background p-2 pr-10 rounded overflow-x-auto whitespace-pre-wrap text-sm shadow-sm">
                        {v.subject}
                      </pre>
                      <CopyButton
                        text={v.subject}
                        className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                    <div className="relative mt-1 group">
                      <pre className="bg-background p-2 pr-10 rounded overflow-x-auto whitespace-pre-wrap text-sm shadow-sm">
                        {v.message}
                      </pre>
                      <CopyButton
                        text={v.message}
                        className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </li>
          <li>Enable the Media Type.</li>
        </ol>
      </details>

      <p>
        Furthermore, create a new Media for a user with the type as the created Media Type. Lastly,
        create a new Trigger Action and a new Service Action with the operation as the created Media Type
        and User as selected earlier.
      </p>
    </div>
  );
}

export default function NewClient() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_TEMP_STORAGE_KEY);
    setApiKey(storedApiKey);
    if (storedApiKey) {
      localStorage.removeItem(API_KEY_TEMP_STORAGE_KEY);
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-card border rounded-xl shadow-md">
      <SetupInstructions url={`${import.meta.env.VITE_API_URL}/zabbix/webhook`} apiKey={apiKey} />
    </div>
  );
}
