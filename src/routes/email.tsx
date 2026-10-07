import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/SiteShell";
import { CopyButton, Thinking } from "@/components/CopyButton";
import { friendlyError, textOf, useKate } from "@/lib/use-kate";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Kate AI" },
      { name: "description", content: "Write formal, friendly or persuasive professional emails in seconds with Kate AI." },
      { property: "og:title", content: "Smart Email Generator — Kate AI" },
      { property: "og:description", content: "AI-written professional emails you can edit, copy and regenerate." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [points, setPoints] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [draft, setDraft] = useState("");
  const { messages, sendMessage, setMessages, status, error, stop } = useKate("email");
  const busy = status === "submitted" || status === "streaming";
  const answer = [...messages].reverse().find((m) => m.role === "assistant");
  const streamed = answer ? textOf(answer) : "";

  useEffect(() => { setDraft(streamed); }, [streamed]);

  const generate = () => {
    if (!purpose.trim() || busy) return;
    setMessages([]);
    sendMessage({
      text: `Tone: ${tone}\nRecipient: ${recipient || "not specified"}\nPurpose: ${purpose}\nKey details to include: ${points || "none"}`,
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader eyebrow="Tool 03" title="Smart Email Generator" text="Tell Kate what you need to say. Pick a tone, then edit, copy or regenerate the result." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <label className="block text-sm font-medium">Recipient
            <Input className="mt-1.5" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. My manager, Thandi" />
          </label>
          <label className="block text-sm font-medium">What is the email about?
            <Textarea className="mt-1.5" rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Request to move Friday's meeting to Monday" />
          </label>
          <label className="block text-sm font-medium">Key details (optional)
            <Textarea className="mt-1.5" rows={3} value={points} onChange={(e) => setPoints(e.target.value)} placeholder="Dates, names, numbers…" />
          </label>
          <div>
            <p className="text-sm font-medium">Tone</p>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {TONES.map((t) => (
                <button key={t} onClick={() => setTone(t)} className={`rounded-lg border px-3 py-2 text-sm transition-colors ${tone === t ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>{t}</button>
              ))}
            </div>
          </div>
          {busy ? (
            <Button variant="outline" className="w-full" onClick={stop}>Stop</Button>
          ) : (
            <Button className="w-full" onClick={generate} disabled={!purpose.trim()}><Wand2 className="size-4" /> Generate email</Button>
          )}
        </div>

        <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-2xl">Your email</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={busy || !purpose.trim()} onClick={generate}><RefreshCw className="size-4" /> Regenerate</Button>
              <CopyButton text={draft} />
            </div>
          </div>
          {error && <p className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{friendlyError(error)}</p>}
          {status === "submitted" ? (
            <div className="grid min-h-80 flex-1 place-items-center"><Thinking label="Kate is writing" /></div>
          ) : (
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} readOnly={busy} placeholder="Your generated email will appear here. You can edit it freely." className="min-h-80 flex-1 resize-y font-[inherit] leading-relaxed" />
          )}
        </div>
      </div>
    </div>
  );
}
