import type { UIMessage } from "ai";

export type Thread = { id: string; title: string; updatedAt: number; messages: UIMessage[] };
const KEY = "kate-threads-v1";

export function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const t = JSON.parse(localStorage.getItem(KEY) || "[]") as Thread[];
    return t.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveThreads(threads: Thread[]) {
  localStorage.setItem(KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event("kate-threads"));
}

export function createThread(): Thread {
  const threads = loadThreads();
  const empty = threads.find((t) => t.messages.length === 0);
  if (empty) return empty;
  const t: Thread = { id: crypto.randomUUID().slice(0, 8), title: "New conversation", updatedAt: Date.now(), messages: [] };
  saveThreads([t, ...threads]);
  return t;
}

export function upsertThread(id: string, messages: UIMessage[]) {
  const threads = loadThreads();
  const firstUser = messages.find((m) => m.role === "user");
  const firstText = firstUser?.parts.map((p) => (p.type === "text" ? p.text : "")).join("") ?? "";
  const title = firstText ? firstText.slice(0, 48) + (firstText.length > 48 ? "…" : "") : "New conversation";
  const existing = threads.find((t) => t.id === id);
  const next: Thread = { id, title, messages, updatedAt: existing && existing.messages.length === messages.length ? existing.updatedAt : Date.now() };
  saveThreads([next, ...threads.filter((t) => t.id !== id)]);
}

export function deleteThread(id: string) {
  saveThreads(loadThreads().filter((t) => t.id !== id));
}
