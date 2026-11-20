import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, RotateCcw, UserSearch, AlertTriangle } from "lucide-react";

export const OUTCOME = {
  passed: { label: "Passed listing checks", cls: "ok", Icon: CheckCircle2, short: "Passed" },
  retake_requested: { label: "Retake requested", cls: "retake", Icon: RotateCcw, short: "Retake" },
  manual_review: { label: "Manual review", cls: "review", Icon: UserSearch, short: "Review" },
} as const;

export function Shell({ children, back, title }: { children: ReactNode; back?: string; title?: string }) {
  return (
    <div className="min-h-[100dvh] bench-grid">
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-xl items-center gap-3 px-4">
          {back ? (
            <a href={back} data-testid="link-back" className="-ml-2 grid h-11 w-11 place-items-center rounded-full active:bg-muted" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </a>
          ) : null}
          <a href="/" data-testid="link-home" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary font-mono text-[11px] font-bold text-primary-foreground">LC</span>
            <span className="font-display text-[17px] font-bold">{title ?? "Listing Check"}</span>
          </a>
          <nav className="ml-auto flex gap-1 text-sm">
            <a href="/demo" data-testid="link-demo" className="rounded-full px-3 py-2 font-medium hover:bg-muted">Demo</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 pb-28 pt-5">{children}</main>
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{children}</p>;
}

export function OutcomeChip({ status }: { status: string }) {
  const o = OUTCOME[status as keyof typeof OUTCOME];
  if (!o) return <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground">In progress</span>;
  return (
    <span className={`${o.cls} inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold`} style={{ background: "hsl(var(--o-bg))", color: "hsl(var(--o))" }}>
      <o.Icon className="h-3.5 w-3.5" /> {o.short}
    </span>
  );
}

export function Skel({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-foreground/[0.07] ${className}`} />;
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rise rounded-2xl border border-destructive/30 bg-destructive/5 p-5" data-testid="panel-error">
      <AlertTriangle className="mb-2 h-6 w-6 text-destructive" />
      <p className="font-display text-lg font-bold">That did not load</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button onClick={onRetry} data-testid="button-retry" className="mt-4 h-11 rounded-full bg-secondary px-5 text-sm font-semibold text-secondary-foreground active:scale-95">
          Try again
        </button>
      )}
    </div>
  );
}

export const btnPrimary =
  "inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-[0_6px_0_-1px_hsl(12_70%_34%)] transition-transform active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:active:translate-y-0";
export const btnGhost =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-foreground/15 bg-card px-4 text-sm font-semibold transition-transform active:scale-[.98] disabled:opacity-40";
