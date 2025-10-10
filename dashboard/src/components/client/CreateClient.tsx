import { useState } from "react";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { PlusIcon } from "lucide-react";
import { ClientCreateSchema } from "@/schemas/api";
import { apiService } from "@/services/api";
import { API_KEY_TEMP_STORAGE_KEY } from "@/config";
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

const formSchema = ClientCreateSchema.pick({ name: true, description: true }).extend({
  description: ClientCreateSchema.shape.description.unwrap().unwrap()
});

export function CreateClientDialog({ ownerId, children }: { ownerId: string; children?: React.ReactNode; }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { mutate, error, isError } = useMutation({
    mutationKey: ['client', 'new'],
    mutationFn: apiService.createClient,
    onSuccess: (data) => {
      const apiKey = data?.data?.apiKey;
      if (!apiKey) throw new Error("API key not generated");

      // Store the API key temporarily in local storage
      localStorage.setItem(API_KEY_TEMP_STORAGE_KEY, apiKey);

      setOpen(false);
      form.reset();
      void navigate('/client/new');
    },
    onError: (error) => {
      console.error("Error creating client:", error);
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: ""
    },
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate({ ...values, ownerId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button variant="outline">Open Dialog</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Create a new Client with the following details.
            An API Key will be generated for you to use.
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
                        <Input placeholder="Client" {...field} />
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
                        <Input placeholder="XYZ Corporation" {...field} />
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
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function CreateClientButton({ ownerId }: { ownerId: string }) {
  return (
    <CreateClientDialog ownerId={ownerId}>
      <Button variant="ghost" size="icon"><PlusIcon /></Button>
    </CreateClientDialog>
  )
}
