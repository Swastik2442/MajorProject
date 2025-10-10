import { useState } from "react";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query";
import { PencilIcon } from "lucide-react";
import { ClientUpdateSchema, type TClientUpdate } from "@/schemas/api";
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

export function UpdateClientDialog({ clientId, children }: { clientId: string; children?: React.ReactNode; }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { mutate, error, isError } = useMutation({
    mutationKey: ['client', 'update'],
    mutationFn: (update: TClientUpdate) => apiService.updateClient(clientId, update),
    onSuccess: () => {
      setOpen(false);
      form.reset();
      void navigate(0);
    },
    onError: (error) => {
      if (import.meta.env.DEV)
        console.error("Error updating client:", error);
    }
  });

  const form = useForm<TClientUpdate>({
    resolver: zodResolver(ClientUpdateSchema),
    defaultValues: {
      name: "",
      description: ""
    },
  });
  const onSubmit = (values: TClientUpdate) => {
    mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button variant="outline">Open Dialog</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Client Details</DialogTitle>
          <DialogDescription>
            Update the Client with the following details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(e) => {void form.handleSubmit(onSubmit)(e)}} className="space-y-8">
            <div className="grid gap-4">
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Client" {...field} value={field.value === null ? undefined : field.value} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="XYZ Corporation" {...field} value={field.value === null ? undefined : field.value} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {isError && (
                <div className="text-sm text-red-600">
                  Error: {error instanceof Error ? error.message : "An unknown error occurred. Please try again."}
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function UpdateClientButton({ clientId }: { clientId: string }) {
  return (
    <UpdateClientDialog clientId={clientId}>
      <Button variant="ghost" size="icon"><PencilIcon /></Button>
    </UpdateClientDialog>
  )
}
