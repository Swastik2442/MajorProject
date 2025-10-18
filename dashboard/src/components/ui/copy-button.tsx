import { ClipboardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyButton({ text, ...props }: { text: string; } & Parameters<typeof Button>[0]) {
  const handleCopy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  return (
    <Button
      {...props}
      onClick={handleCopy}
      size="icon-sm"
      variant="ghost"
    >
      <ClipboardIcon className="size-4" />
    </Button>
  );
}
