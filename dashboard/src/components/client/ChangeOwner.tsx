import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/clerk-react";
import { EditIcon } from "lucide-react";
import { ClientOwnerUpdateSchema, type TClientOwnerUpdate } from "@/schemas/api";
import { apiService } from "@/services/api";
import { OrganizationSelect } from "@/components/clerk";
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

export function ChangeOwnerDialog({
  clientId,
  children
}: {
  clientId: string;
  children?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { organization, isLoaded } = useOrganization();

  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: ["client", clientId, "change-owner"],
    mutationFn: (update: TClientOwnerUpdate) => apiService.changeClientOwner(clientId, update),
    onSuccess: () => {
      setOpen(false);
      form.reset();
      void navigate(0);
    },
    onError: (error) => {
      if (import.meta.env.DEV)
        console.error("Error updating client owner:", error);
    }
  });

  const form = useForm<TClientOwnerUpdate>({
    resolver: zodResolver(ClientOwnerUpdateSchema),
    defaultValues: { ownerId: isLoaded ? organization?.id : undefined }
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
          >
            <FormField
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Owner</FormLabel>
                  <FormControl>
                    <OrganizationSelect
                      className="w-full"
                      placeholder="Select new Owner"
                      filter={(v) => v.role === "org:admin"}
                      onValueChange={field.onChange}
                      {...field}
                    />
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
