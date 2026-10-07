import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Thinking } from "@/components/CopyButton";
import { createThread, loadThreads } from "@/lib/threads";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [
      { title: "Chat with Kate — Kate AI" },
      { name: "description", content: "Ask Kate, your AI workplace assistant, anything about work." },
      { property: "og:title", content: "Chat with Kate — Kate AI" },
      { property: "og:description", content: "An interactive AI workplace assistant that remembers context." },
    ],
  }),
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = loadThreads()[0] ?? createThread();
    navigate({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
  }, [navigate]);
  return <div className="mx-auto max-w-3xl px-4 py-10"><Thinking label="Opening your chats" /></div>;
}
