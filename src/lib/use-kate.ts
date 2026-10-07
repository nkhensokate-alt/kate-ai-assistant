import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useMemo } from "react";

export function textOf(m: UIMessage) {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

export function friendlyError(err: Error | undefined) {
  if (!err) return null;
  const msg = err.message || "";
  if (msg.includes("429")) return "Kate is getting a lot of requests. Please wait a moment and try again.";
  if (msg.includes("402") || msg.toLowerCase().includes("credit"))
    return "AI credits have run out for this workspace. Please add credits and try again.";
  return "Something went wrong while Kate was thinking. Please try again.";
}

export function useKate(mode: "chat" | "research" | "email", initialMessages?: UIMessage[], chatId?: string) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/ai", body: { mode } }), [mode]);
  return useChat({ id: chatId ?? `kate-${mode}`, transport, ...(initialMessages ? { messages: initialMessages } : {}) });
}
