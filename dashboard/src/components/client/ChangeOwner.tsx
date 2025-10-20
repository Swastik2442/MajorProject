import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EditIcon } from "lucide-react";
import { ClientOwnerUpdateSchema, type TClientOwnerUpdate } from "@/schemas/api";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function ChangeOwnerDialog({
  clientId,
  children
}: {
  clientId: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: ["client", clientId, "change-owner"],
    mutationFn: (update: TClientOwnerUpdate) => apiService.changeClientOwner(clientId, update),
    onSuccess: () => {setOpen(false)}
  });

  const form = useForm<TClientOwnerUpdate>({
    resolver: zodResolver(ClientOwnerUpdateSchema),
    defaultValues: { new_owner_id: "" }
  });
  const onSubmit = (values: TClientOwnerUpdate) => {
    mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button variant="outline">Change Owner</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Client Owner</DialogTitle>
          <DialogDescription>
            Enter the new organization or user ID to transfer ownership of this
            client.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="space-y-6"
          > {/* TODO: Replace with Select Dropdown from the Orgs in which the current user is Admin */}
            <FormField
              control={form.control}
              name="new_owner_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Owner ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter new owner ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isError && (
              <p className="text-sm text-red-600">
                {error instanceof Error
                  ? error.message
                  : "Error changing owner."}
              </p>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>Change</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function ChangeOwnerButton({ clientId }: { clientId: string }) {
  return (
    <ChangeOwnerDialog clientId={clientId}>
      <Button title="Change Owner" variant="ghost" size="icon"><EditIcon /></Button>
    </ChangeOwnerDialog>
  );
}
