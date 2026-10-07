import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/research", label: "Research" },
  { to: "/chat", label: "Chat" },
  { to: "/email", label: "Email" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-primary font-display text-xl text-primary-foreground">
              K
            </span>
            <span className="font-display text-2xl tracking-tight">Kate AI</span>
          </Link>
          <nav className="flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: true }}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-primary text-primary-foreground hover:text-primary-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <span>Kate AI — your productivity assistant</span>
          <a href="mailto:nkhensokate@gmail.com" className="hover:text-foreground">
            nkhensokate@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}

export function PageHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">{eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{text}</p>
    </div>
  );
}
