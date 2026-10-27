"use client";

import { motion } from "motion/react";
import { useState, useTransition } from "react";
import { Check, ChevronRight, PartyPopper } from "lucide-react";
import { Avatar } from "./avatar";
import { toggleTask } from "@/app/actions";
import type { OnboardingTask } from "@/lib/types";

type Task = OnboardingTask & { employeeName: string; hue: number; role: string };

export function OnboardingList({ tasks }: { tasks: Task[] }) {
  const [rows, setRows] = useState(tasks);
  const [, start] = useTransition();

  const groups = Array.from(new Set(rows.map((t) => t.employeeId))).map((id) => {
    const items = rows.filter((t) => t.employeeId === id);
    const done = items.filter((t) => t.done).length;
    return {
      id,
      name: items[0].employeeName,
      role: items[0].role,
      hue: items[0].hue,
      items,
      done,
      pct: Math.round((done / items.length) * 100),
    };
  });

  function toggle(id: number, next: boolean) {
    setRows((prev) => prev.map((t) => (t.id === id ? { ...t, done: next ? 1 : 0 } : t)));
    start(async () => {
      await toggleTask(id, next);
    });
  }

  const overall = Math.round(
    (rows.filter((t) => t.done).length / Math.max(rows.length, 1)) * 100,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-fg">Onboarding</h1>
          <p className="mt-1 text-[13px] text-muted">
            {groups.length} new joiners · {overall}% of all checklist items complete
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand to-accent"
              animate={{ width: `${overall}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>
          <span className="tabular text-[12.5px] font-medium text-fg">{overall}%</span>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {groups.map((g, gi) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.08 }}
            className="card p-4"
          >
            <div className="flex items-center gap-2.5">
              <Avatar first={g.name.split(" ")[0]} last={g.name.split(" ")[1] ?? ""} hue={g.hue} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-fg">{g.name}</p>
                <p className="truncate text-[11.5px] text-subtle">{g.role}</p>
              </div>
              <span className="tabular text-[12px] font-semibold text-brand">{g.pct}%</span>
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className="h-full rounded-full bg-brand"
                animate={{ width: `${g.pct}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 28 }}
              />
            </div>

            <ul className="mt-3 space-y-1">
              {g.items.map((t, i) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: gi * 0.08 + i * 0.02 }}
                >
                  <button
                    onClick={() => toggle(t.id, !t.done)}
                    className="group flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-surface-hover"
                  >
                    <span
                      className={`grid size-4 shrink-0 place-items-center rounded border transition-all ${
                        t.done
                          ? "border-brand bg-brand text-brand-fg"
                          : "border-line-strong bg-surface group-hover:border-brand"
                      }`}
                    >
                      {t.done ? <Check className="size-3" strokeWidth={3} /> : null}
                    </span>
                    <span
                      className={`min-w-0 flex-1 truncate text-[12px] transition-colors ${
                        t.done ? "text-subtle line-through" : "text-fg"
                      }`}
                    >
                      {t.title}
                    </span>
                    <span className="shrink-0 rounded bg-surface-2 px-1.5 text-[9.5px] uppercase tracking-wide text-subtle">
                      {t.category}
                    </span>
                  </button>
                </motion.li>
              ))}
            </ul>

            {g.pct === 100 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 py-1.5 text-[11.5px] font-medium text-emerald-500"
              >
                <PartyPopper className="size-3.5" /> Fully onboarded
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="card flex flex-wrap items-center gap-3 border-dashed p-4">
        <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand">
          <ChevronRight className="size-4" />
        </span>
        <p className="text-[12.5px] text-muted">
          Tick a task and it saves instantly — no “save” button anywhere in this app.
        </p>
      </div>
    </div>
  );
}
