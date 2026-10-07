import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, RotateCcw, Square } from "lucide-react";
import type { UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { CopyButton, Thinking } from "@/components/CopyButton";
import { friendlyError, textOf, useKate } from "@/lib/use-kate";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat with Kate — Kate AI" },
      { name: "description", content: "Ask Kate, your AI workplace assistant, anything about work." },
      { property: "og:title", content: "Chat with Kate — Kate AI" },
      { property: "og:description", content: "An interactive AI workplace assistant that remembers context." },
    ],
  }),
  component: ChatPage,
});

const KEY = "kate-chat-v1";

function ChatPage() {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  useEffect(() => {
    try {
      setInitial(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {
      setInitial([]);
    }
  }, []);
  if (!initial) return <div className="mx-auto max-w-3xl px-4 py-10"><Thinking label="Loading" /></div>;
  return <Chat initial={initial} />;
}

const STARTERS = ["How do I ask my manager for a raise?", "Help me prioritise a busy week", "Tips for a great team meeting"];

function Chat({ initial }: { initial: UIMessage[] }) {
  const { messages, sendMessage, setMessages, status, error, stop } = useKate("chat", initial);
  const [input, setInput] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready" || status === "error") localStorage.setItem(KEY, JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);
  useEffect(() => { if (!busy) ref.current?.focus(); }, [busy]);

  const send = (t: string) => {
    if (!t.trim() || busy) return;
    sendMessage({ text: t.trim() });
    setInput("");
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] min-h-[520px] max-w-3xl flex-col px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary font-display text-xl text-primary-foreground">K</span>
          <div>
            <h1 className="font-display text-2xl leading-none">Kate</h1>
            <p className="text-xs text-muted-foreground">Workplace assistant</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" disabled={busy || !messages.length} onClick={() => { setMessages([]); localStorage.removeItem(KEY); }}>
          <RotateCcw className="size-4" /> New conversation
        </Button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto rounded-2xl border border-border bg-card p-4 sm:p-6">
        {!messages.length && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-display text-3xl">Hi, I'm Kate. What's on your plate?</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => {
          const t = textOf(m);
          return m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground">{t}</div>
            </div>
          ) : (
            t && (
              <div key={m.id} className="group">
                <div className="prose prose-neutral max-w-none prose-p:my-2"><ReactMarkdown>{t}</ReactMarkdown></div>
                <div className="mt-1 opacity-70 group-hover:opacity-100"><CopyButton text={t} /></div>
              </div>
            )
          );
        })}
        {status === "submitted" && <Thinking />}
        {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{friendlyError(error)}</p>}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-4 flex items-end gap-2 rounded-2xl border border-border bg-card p-2">
        <textarea
          ref={ref}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          rows={1}
          placeholder="Message Kate…"
          className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 outline-none"
        />
        {busy ? (
          <Button type="button" size="icon" variant="outline" onClick={stop} aria-label="Stop"><Square className="size-4" /></Button>
        ) : (
          <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send"><ArrowUp className="size-4" /></Button>
        )}
      </form>
    </div>
  );
}
