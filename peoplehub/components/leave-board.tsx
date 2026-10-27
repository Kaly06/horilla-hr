"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";
import { CalendarDays, Check, ChevronDown, X } from "lucide-react";
import { Avatar } from "./avatar";
import { Badge, pretty, statusTone } from "./ui";
import { setLeaveStatus } from "@/app/actions";
import type { LeaveRequest } from "@/lib/types";

const TABS = ["pending", "approved", "declined", "all"] as const;
type Tab = (typeof TABS)[number];

export function LeaveBoard({
  requests,
  canApprove,
}: {
  requests: LeaveRequest[];
  canApprove: boolean;
}) {
  const [tab, setTab] = useState<Tab>("pending");
  const [rows, setRows] = useState(requests);
  const [, start] = useTransition();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = tab === "all" ? rows : rows.filter((r) => r.status === tab);

  function decide(id: number, status: "approved" | "declined") {
    setBusy(id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    start(async () => {
      const res = await setLeaveStatus(id, status);
      if (!res?.ok) {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: r.status === status ? "pending" : r.status } : r)),
        );
        setError(res?.error ?? "Could not save that decision.");
      }
      setTimeout(() => setBusy(null), 350);
    });
  }

  const stats = {
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    declined: rows.filter((r) => r.status === "declined").length,
    days: rows.filter((r) => r.status === "approved").reduce((s, r) => s + r.days, 0),
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-fg">Leave</h1>
        <p className="mt-1 text-[13px] text-muted">
          {stats.pending} awaiting a decision · {stats.days} approved days in total
        </p>
      </div>

      {!canApprove && (
        <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] text-subtle">
          You can see your team&apos;s requests, but approving them is limited to managers and HR.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Awaiting you", value: stats.pending, tone: "warning" as const, hint: "Needs action" },
          { label: "Approved", value: stats.approved, tone: "success" as const, hint: "This cycle" },
          { label: "Declined", value: stats.declined, tone: "danger" as const, hint: "This cycle" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card flex items-center justify-between p-4"
          >
            <div>
              <p className="text-[12px] text-muted">{s.label}</p>
              <p className="tabular mt-1 text-[22px] font-semibold tracking-tight text-fg">{s.value}</p>
            </div>
            <Badge tone={s.tone}>{s.hint}</Badge>
          </motion.div>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-[12px] text-rose-500">{error}</p>
      )}

      <div className="flex gap-1.5 border-b border-line pb-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative rounded-lg px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors ${
              tab === t ? "text-fg" : "text-muted hover:text-fg"
            }`}
          >
            {tab === t && (
              <motion.span layoutId="leave-tab" className="absolute inset-0 rounded-lg bg-brand-soft" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {visible.map((r, i) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.28, delay: Math.min(i * 0.03, 0.2) }}
              className={`card p-4 ${busy === r.id ? "opacity-60" : ""}`}
            >
              <div className="flex flex-wrap items-start gap-3">
                <Avatar
                  first={r.employeeName!.split(" ")[0]}
                  last={r.employeeName!.split(" ")[1] ?? ""}
                  hue={r.hue ?? 244}
                  size={38}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13.5px] font-semibold text-fg">{r.employeeName}</p>
                    <Badge tone="neutral">{r.type}</Badge>
                    <Badge tone={statusTone(r.status)} dot>{pretty(r.status)}</Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted">
                    <CalendarDays className="size-3.5 text-subtle" />
                    {r.startDate} → {r.endDate} · {r.days} day{r.days === 1 ? "" : "s"}
                    <span className="text-subtle">· {r.department}</span>
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-subtle">“{r.reason}”</p>
                </div>

                {r.status === "pending" && canApprove ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => decide(r.id, "approved")}
                      className="flex h-8 items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 text-[12px] font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20 active:scale-95 dark:text-emerald-400"
                    >
                      <Check className="size-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => decide(r.id, "declined")}
                      className="flex h-8 items-center gap-1 rounded-lg bg-rose-500/10 px-2.5 text-[12px] font-semibold text-rose-600 transition-all hover:bg-rose-500/20 active:scale-95 dark:text-rose-400"
                    >
                      <X className="size-3.5" /> Decline
                    </button>
                  </div>
                ) : (
                  <span className="grid size-8 place-items-center rounded-lg bg-surface-2 text-subtle">
                    <ChevronDown className="size-4" />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <div className="grid place-items-center rounded-xl border border-dashed border-line py-16">
            <p className="text-[13px] text-subtle">Nothing here. Inbox zero.</p>
          </div>
        )}
      </div>
    </div>
  );
}
