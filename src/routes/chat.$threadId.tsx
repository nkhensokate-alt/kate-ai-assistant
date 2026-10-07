import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Plus, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton, Thinking } from "@/components/CopyButton";
import { friendlyError, textOf, useKate } from "@/lib/use-kate";
import { createThread, deleteThread, loadThreads, upsertThread, type Thread } from "@/lib/threads";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Chat with Kate — Kate AI" },
      { name: "description", content: "Your conversation with Kate, the AI workplace assistant." },
      { property: "og:title", content: "Chat with Kate — Kate AI" },
      { property: "og:description", content: "An interactive AI workplace assistant that remembers context." },
    ],
  }),
  component: ChatPage,
});

function useThreads() {
  const [threads, setThreads] = useState<Thread[] | null>(null);
  useEffect(() => {
    const sync = () => setThreads(loadThreads());
    sync();
    window.addEventListener("kate-threads", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("kate-threads", sync); window.removeEventListener("storage", sync); };
  }, []);
  return threads;
}

function ChatPage() {
  const { threadId } = Route.useParams();
  const threads = useThreads();
  const navigate = useNavigate();
  if (!threads) return <div className="mx-auto max-w-6xl px-4 py-10"><Thinking label="Loading" /></div>;
  const current = threads.find((t) => t.id === threadId);

  const newChat = () => {
    const t = createThread();
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };
  const remove = (id: string) => {
    deleteThread(id);
    if (id === threadId) navigate({ to: "/chat" });
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 md:h-[calc(100vh-9rem)] md:min-h-[520px]">
        <Button onClick={newChat} className="w-full"><Plus className="size-4" /> New chat</Button>
        <p className="mt-2 px-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Past chats</p>
        <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto md:max-h-none md:flex-1">
          {threads.map((t) => (
            <li key={t.id} className={`group flex items-center rounded-lg ${t.id === threadId ? "bg-secondary" : "hover:bg-secondary/60"}`}>
              <Link to="/chat/$threadId" params={{ threadId: t.id }} className="flex-1 truncate px-2 py-2 text-sm">{t.title}</Link>
              <button onClick={() => remove(t.id)} aria-label="Delete chat" className="p-2 text-muted-foreground opacity-60 hover:text-destructive group-hover:opacity-100">
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </aside>
      {current ? (
        <Chat key={threadId} thread={current} />
      ) : (
        <div className="grid place-items-center rounded-2xl border border-border bg-card p-10 text-center">
          <div>
            <p className="font-display text-2xl">This chat doesn't exist anymore.</p>
            <Button className="mt-4" onClick={newChat}>Start a new chat</Button>
          </div>
        </div>
      )}
    </div>
  );
}

const STARTERS = ["How do I ask my manager for a raise?", "Help me prioritise a busy week", "Tips for a great team meeting"];

function Chat({ thread }: { thread: Thread }) {
  const { messages, sendMessage, status, error, stop } = useKate("chat", thread.messages, thread.id);
  const [input, setInput] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if ((status === "ready" || status === "error") && messages.length !== thread.messages.length) upsertThread(thread.id, messages);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, thread.id, thread.messages.length]);
  useEffect(() => { if (!busy) ref.current?.focus(); }, [busy]);

  const send = (t: string) => {
    if (!t.trim() || busy) return;
    sendMessage({ text: t.trim() });
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] min-h-[520px] flex-col">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-primary font-display text-xl text-primary-foreground">K</span>
        <div>
          <h1 className="font-display text-2xl leading-none">Kate</h1>
          <p className="text-xs text-muted-foreground">Workplace assistant</p>
        </div>
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

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex items-end gap-2 rounded-2xl border border-border bg-card p-2">
        <textarea
          ref={ref}
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
