import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setDone(false), 1500);
        } catch {
          toast.error("Couldn't copy — please select and copy manually.");
        }
      }}
    >
      {done ? <Check className="size-4" /> : <Copy className="size-4" />}
      {done ? "Copied" : label}
    </Button>
  );
}

export function Thinking({ label = "Kate is thinking" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="flex gap-1">
        <span className="size-1.5 animate-bounce rounded-full bg-accent-strong [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-accent-strong [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-accent-strong" />
      </span>
      {label}…
    </div>
  );
}
