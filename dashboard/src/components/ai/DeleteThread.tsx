import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { apiService } from "@/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { TPaginatedThreadLeanDataResponse } from "@/schemas/api";

const queryKey = ['promptHistory'] as const;

export const DeleteThreadAlert = ({
  threadId,
  children,
  onDelete,
}: {
  threadId: string;
  children?: React.ReactNode;
  onDelete: () => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (threadId: string) => apiService.deleteThread(threadId),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey });
      const threadsPreviously = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(
        queryKey,
        (old: TPaginatedThreadLeanDataResponse) => ({
          ...old,
          data: old.data ? old.data.filter(thread => thread._id !== data) : null
        })
      );
      onDelete();
      return { threadsPreviously };
    },
    onError: (err, _, ctx) => {
      if (ctx) queryClient.setQueryData(queryKey, ctx.threadsPreviously);
      if (import.meta.env.DEV)
        console.error("An error occurred while deleting a Thread", err);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? <Button variant="destructive">Delete</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the thread and all its responses.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => { mutate(threadId) }}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const DeleteThreadButton = ({ threadId, onDelete }: { threadId: string; onDelete: () => void; }) => (
  <DeleteThreadAlert threadId={threadId} onDelete={onDelete}>
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-gray-400 hover:text-red-400"
      title="Delete Thread"
      type="button"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  </DeleteThreadAlert>
);

export default DeleteThreadButton;
