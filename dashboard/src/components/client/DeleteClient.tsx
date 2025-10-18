import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
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

// Actual dialog component
export function DeleteClientDialog({
  clientId,
  children
}: {
  clientId: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: ["client", "delete"],
    mutationFn: () => apiService.deleteClient(clientId),
    onSuccess: () => {setOpen(false)}
  });

  const handleDelete = () => {mutate()};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button variant="destructive">Delete</Button>}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Client</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this client? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {isError && (
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : "Error deleting client."}
          </p>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteClientButton({ clientId }: { clientId: string }) {
  return (
    <DeleteClientDialog clientId={clientId}>
      <Button title="Delete Client" variant="ghost" size="icon"><Trash2Icon /></Button>
    </DeleteClientDialog>
  );
}
