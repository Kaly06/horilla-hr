import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`card ${padded ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-muted">{title}</h2>
        {hint && <p className="mt-1 text-[13px] text-subtle">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

const tones = {
  neutral: "bg-surface-2 text-muted border-line",
  brand: "bg-brand-soft text-brand border-transparent",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-transparent",
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-transparent",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-transparent",
} as const;

export type Tone = keyof typeof tones;

export function Badge({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium whitespace-nowrap ${tones[tone]}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  switch (status) {
    case "active":
    case "present":
    case "approved":
    case "hired":
      return "success";
    case "probation":
    case "late":
    case "pending":
      return "warning";
    case "on_leave":
    case "leave":
    case "offer":
      return "info";
    case "offboarding":
    case "absent":
    case "declined":
      return "danger";
    default:
      return "neutral";
  }
}

export function pretty(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-line px-6 py-14 text-center">
      <p className="text-sm font-medium text-fg">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-[13px] text-subtle">{hint}</p>}
    </div>
  );
}
