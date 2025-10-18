import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const formSchema = z.object({
  newOwnerId: z.string().min(1, "New owner ID is required")
});

export function ChangeOwnerDialog({
  clientId,
  children
}: {
  clientId: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { mutate, isError, error } = useMutation({
    mutationKey: ["client", "change-owner"],
    mutationFn: (values: { clientId: string; newOwnerId: string }) =>
      apiService.changeClientOwner(values.clientId, values.newOwnerId),
    onSuccess: () => setOpen(false)
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { newOwnerId: "" }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) =>
    mutate({ clientId, ...values });

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
          >
            <FormField
              control={form.control}
              name="newOwnerId"
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
              <Button type="submit">Change</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ✅ Wrapper for compatibility with index.tsx
export function ChangeOwnerButton({ clientId }: { clientId: string }) {
  return <ChangeOwnerDialog clientId={clientId} />;
}
