import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/SiteShell";
import { CopyButton, Thinking } from "@/components/CopyButton";
import { friendlyError, textOf, useKate } from "@/lib/use-kate";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — Kate AI" },
      { name: "description", content: "Summarise topics and articles, extract key points and get insights with Kate AI." },
      { property: "og:title", content: "Research Assistant — Kate AI" },
      { property: "og:description", content: "AI summaries, key points, insights and recommendations." },
    ],
  }),
  component: Research,
});

const EXAMPLES = ["Remote work productivity trends", "Benefits of a four-day work week", "How to run effective one-on-ones"];

function Research() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, setMessages, status, error, stop } = useKate("research");
  const busy = status === "submitted" || status === "streaming";
  const answer = [...messages].reverse().find((m) => m.role === "assistant");
  const text = answer ? textOf(answer) : "";

  const run = (q: string) => {
    if (!q.trim() || busy) return;
    setMessages([]);
    sendMessage({ text: `Research this topic or article:\n\n${q.trim()}` });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader eyebrow="Tool 01" title="Research Assistant" text="Paste an article or type a topic. Kate returns a summary, key points, insights and recommendations." />
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={6} placeholder="e.g. The impact of AI on customer service — or paste an article…" className="resize-y border-0 bg-transparent shadow-none focus-visible:ring-0" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button key={e} onClick={() => setInput(e)} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
                {e}
              </button>
            ))}
          </div>
          {busy ? (
            <Button variant="outline" onClick={stop}>Stop</Button>
          ) : (
            <Button onClick={() => run(input)} disabled={!input.trim()}>
              <Search className="size-4" /> Research
            </Button>
          )}
        </div>
      </div>

      {error && <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{friendlyError(error)}</p>}
      {status === "submitted" && <div className="mt-8"><Thinking label="Kate is researching" /></div>}
      {text && (
        <article className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="mb-4 flex justify-end gap-2">
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => run(input)}><RefreshCw className="size-4" /> Regenerate</Button>
            <CopyButton text={text} />
          </div>
          <div className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:font-normal">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        </article>
      )}
    </div>
  );
}
