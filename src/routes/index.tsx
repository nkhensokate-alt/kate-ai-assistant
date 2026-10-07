import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenText, MessagesSquare, Mail } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kate AI — Research, Chat & Email Assistant" },
      { name: "description", content: "Kate AI helps you research topics, answer workplace questions and write professional emails." },
      { property: "og:title", content: "Kate AI — Research, Chat & Email Assistant" },
      { property: "og:description", content: "Your AI productivity assistant for research, workplace questions and emails." },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  { to: "/research", icon: BookOpenText, title: "Research Assistant", text: "Summarise topics and articles, pull out key points, and get insights and recommendations." },
  { to: "/chat", icon: MessagesSquare, title: "Chat with Kate", text: "Ask workplace questions and talk things through. Kate remembers the conversation." },
  { to: "/email", icon: Mail, title: "Smart Email Generator", text: "Draft formal, friendly or persuasive emails — then edit, copy or regenerate." },
] as const;

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <section className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">Good to see you</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] sm:text-7xl">
            Less busywork.
            <br />
            <em className="text-accent-strong">More good work.</em>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Kate is your AI assistant for research, everyday workplace questions and polished professional emails.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="font-display text-2xl">"Hi, I'm Kate."</p>
          <p className="mt-2 text-sm text-muted-foreground">Pick a tool below or jump straight into a chat — no sign-up needed.</p>
          <Link to="/chat" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Start chatting <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-3">
        {TOOLS.map((t, i) => (
          <Link key={t.to} to={t.to} className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                <t.icon className="size-5" />
              </span>
              <span className="font-display text-3xl text-muted-foreground/40">0{i + 1}</span>
            </div>
            <h2 className="mt-6 font-display text-2xl">{t.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{t.text}</p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
