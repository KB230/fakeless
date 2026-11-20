import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, RotateCcw, UserSearch, AlertTriangle, ImageOff } from "lucide-react";
import type { ReferencePhoto } from "@workspace/api-client-react";
import { asset } from "@/lib/helpers";

export const OUTCOME = {
  passed: { label: "Passed listing checks", cls: "ok", Icon: CheckCircle2, short: "Passed" },
  photo_check_complete: { label: "Photo check complete · Model verification unavailable", cls: "ok", Icon: CheckCircle2, short: "Photo checked" },
  retake_requested: { label: "Retake requested", cls: "retake", Icon: RotateCcw, short: "Retake" },
  manual_review: { label: "Manual review", cls: "review", Icon: UserSearch, short: "Review" },
} as const;

export function Shell({ children, back, title }: { children: ReactNode; back?: string; title?: string }) {
  return (
    <div className="min-h-[100dvh] bench-grid">
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-xl items-center gap-3 px-4">
          {back ? (
            <Link href={back} data-testid="link-back" className="-ml-2 grid h-11 w-11 place-items-center rounded-full active:bg-muted" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : null}
          <Link href="/" data-testid="link-home" className="flex items-center gap-2">
            <span className="font-display text-[32px] font-normal leading-none" aria-label="Fakeless">fakeless.</span>
          </Link>
          <nav className="ml-auto flex gap-1 text-sm">
            <Link href="/demo" data-testid="link-demo" className="rounded-full px-3 py-2 font-medium hover:bg-muted">Demo</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 pb-28 pt-5">{title && <p className="mb-4 text-xs text-muted-foreground">{title}</p>}{children}</main>
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

export function DemoBanner() {
  return (
    <div data-testid="banner-demo" className="mb-4 flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/60 bg-primary/10 px-3 py-2.5 text-sm font-medium text-foreground">
      <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">DEMO</span>
      Demo — sample photos and sample codes, not a live check
    </div>
  );
}

export function RefPhoto({ r, compact }: { r: ReferencePhoto; compact?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-foreground/10 bg-card">
      <div className="relative aspect-[4/3] bg-muted">
        <img src={asset(r.imageUrl)} alt={r.caption} className="h-full w-full object-cover" loading="lazy" />
        {r.isDemo && (
          <span className="absolute left-2 top-2 rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-semibold text-secondary-foreground">Demo reference</span>
        )}
      </div>
      {!compact && (
        <figcaption className="p-2.5 text-xs leading-snug">
          {r.caption}
          <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">Source: {r.source}</span>
        </figcaption>
      )}
    </figure>
  );
}

export function NoPhoto({ label = "Photo not stored" }: { label?: string }) {
  return (
    <div className="grid aspect-[4/3] place-items-center rounded-xl border border-dashed border-foreground/20 bg-muted/60 text-center text-xs text-muted-foreground">
      <div><ImageOff className="mx-auto mb-1 h-5 w-5" />{label}</div>
    </div>
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
  "inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground shadow-[0_3px_0_hsl(75_20%_53%)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:active:translate-y-0";
export const btnInk =
  "inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-secondary px-5 text-base font-semibold text-secondary-foreground transition-transform hover:bg-accent active:scale-[.98] disabled:opacity-40";
export const btnGhost =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-foreground/15 bg-card px-4 text-sm font-semibold transition-transform hover:border-primary/50 hover:bg-accent active:scale-[.98] disabled:opacity-40";
