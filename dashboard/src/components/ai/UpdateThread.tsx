import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { PenBoxIcon } from "lucide-react";
import { ThreadUpdateSchema } from "@/schemas/api";
import type { TPaginatedThreadLeanDataResponse, TThreadLean, TThreadUpdate } from "@/schemas/api";
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

const queryKey = ['promptHistory'] as const;

export const UpdateThreadAlert = ({ thread, children }: { thread: TThreadLean; children?: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutate, isError, error } = useMutation({
    mutationFn: (body: TThreadUpdate) => apiService.updateThread(thread._id, body),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey });
      const threadsPreviously = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(
        queryKey,
        (old: TPaginatedThreadLeanDataResponse) => ({
            ...old,
            data: old.data ? old.data.map(t => t._id === thread._id ? { ...t, ...data } : t) : null
        })
      );
      return { threadsPreviously };
    },
    onSuccess: () => {
      setOpen(false);
    },
    onError: (err, _, ctx) => {
      if (ctx) queryClient.setQueryData(queryKey, ctx.threadsPreviously)
      if (import.meta.env.DEV)
        console.error("An error occurred while updating a Thread", err)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const form = useForm({
    resolver: zodResolver(ThreadUpdateSchema),
    defaultValues: thread,
  });
  const onSubmit = form.handleSubmit((values) => {
    mutate(values);
  });

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
          <form onSubmit={(e) => {void onSubmit(e)}} className="space-y-8">
            <div className="grid gap-4">
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Title" {...field} />
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
  );
}

export const UpdateThreadButton = ({ thread }: { thread: TThreadLean; }) => (
  <UpdateThreadAlert thread={thread}>
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-gray-400 hover:text-gray-300"
      title="Update Thread"
      type="button"
    >
      <PenBoxIcon className="w-4 h-4" />
    </Button>
  </UpdateThreadAlert>
);

export default UpdateThreadButton;
