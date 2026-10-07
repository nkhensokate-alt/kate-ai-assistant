import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createResponsesCall } from "@/lib/ai/responses.server";

const PROMPTS: Record<string, string> = {
  chat: "You are Kate, a warm, sharp and practical workplace assistant inside Kate AI. Answer workplace questions clearly and concisely, use markdown when helpful, and remember earlier context in the conversation. Introduce yourself as Kate if asked who you are.",
  research:
    "You are Kate's Research Assistant. For the given topic or article, respond in markdown with these sections: '## Summary' (a tight paragraph), '## Key points' (bullets), '## Insights' (bullets of non-obvious takeaways), '## Recommendations' (actionable bullets). Be accurate; say when information may be outdated or uncertain.",
  email:
    "You are Kate's Smart Email Generator. Write one complete professional email in the requested tone. Start with 'Subject: ...' on the first line, then a blank line, then the email body with greeting and sign-off. Output plain text only, no markdown and no commentary.",
};

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });
        let body: { messages?: UIMessage[]; mode?: string };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }
        const mode = body.mode && PROMPTS[body.mode] ? body.mode : "chat";
        const messages = (body.messages ?? []).slice(-40);
        if (!messages.length) return Response.json({ error: "No message provided." }, { status: 400 });
        const call = createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          await convertToModelMessages(messages),
          PROMPTS[mode],
        );
        return call.response();
      },
    },
  },
});
