import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
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

  const { mutate, isError, error } = useMutation({
    mutationKey: ["client", "regen-api-key"],
    mutationFn: () => apiService.regenerateClientApiKey(clientId),
    onSuccess: (data) => {
      if (data && "data" in data) setApiKey(data.data);
    }
  });

  const handleRegen = () => mutate();

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
            <div className="bg-muted p-2 rounded-md break-all text-sm">
              <strong>New API Key:</strong> {apiKey}
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button onClick={handleRegen}>Regenerate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ✅ Wrapper for compatibility with index.tsx
export function RegenApiKeyButton({ clientId }: { clientId: string }) {
  return <RegenApiKeyDialog clientId={clientId} />;
}
