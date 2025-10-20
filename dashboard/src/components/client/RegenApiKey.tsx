import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { WebhookIcon } from "lucide-react";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

export function RegenApiKeyDialog({
  clientId,
  children
}: {
  clientId: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: ["client", "regen-api-key"],
    mutationFn: () => apiService.regenerateClientApiKey(clientId),
    onSuccess: (data) => {
      setApiKey(data.data);
    }
  });

  const handleRegen = () => {mutate()};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button variant="outline">Regenerate API Key</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Regenerate API Key</DialogTitle>
          <DialogDescription>
            This will generate a new API key for the client. The old key will
            become invalid immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isError && (
            <p className="text-sm text-red-600">
              {error instanceof Error
                ? error.message
                : "Error regenerating API key."}
            </p>
          )}
          {apiKey && (
            <div className="flex flex-col gap-2 break-all text-sm">
              <strong>New API Key:</strong>
              <div className="bg-muted p-2 rounded-md relative group">
                <code>{apiKey}</code>
                <CopyButton
                  text={apiKey}
                  className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button onClick={handleRegen} disabled={isPending}>Regenerate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RegenApiKeyButton({ clientId }: { clientId: string }) {
  return (
    <RegenApiKeyDialog clientId={clientId}>
      <Button title="Regenerate API Key" variant="ghost" size="icon"><WebhookIcon /></Button>
    </RegenApiKeyDialog>
  );
}
