import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export function NoAccess({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-sm text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
          <LockKeyhole className="size-5" />
        </span>
        <h1 className="mt-4 text-[19px] font-semibold tracking-[-0.02em] text-fg">{title}</h1>
        {hint && <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{hint}</p>}
        <Link
          href="/"
          className="mt-5 inline-flex items-center rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-medium text-fg transition-colors hover:bg-surface-hover"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
