"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";
import { ArrowRight, Briefcase, GripVertical, Plus, Sparkles } from "lucide-react";
import { Avatar } from "./avatar";
import { Badge } from "./ui";
import { moveCandidate } from "@/app/actions";
import type { Candidate } from "@/lib/types";

const STAGES = [
  { key: "applied", label: "Applied", tone: "neutral" as const },
  { key: "screen", label: "Screening", tone: "info" as const },
  { key: "interview", label: "Interview", tone: "brand" as const },
  { key: "offer", label: "Offer", tone: "warning" as const },
  { key: "hired", label: "Hired", tone: "success" as const },
];

export function RecruitmentBoard({ candidates }: { candidates: Candidate[] }) {
  const [rows, setRows] = useState(candidates);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [, start] = useTransition();

  function move(id: number, stage: string) {
    setRows((prev) => prev.map((c) => (c.id === id ? { ...c, stage: stage as Candidate["stage"] } : c)));
    start(async () => {
      await moveCandidate(id, stage);
    });
  }

  const total = rows.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-fg">Recruitment</h1>
          <p className="mt-1 text-[13px] text-muted">
            {total} candidates in the pipeline · {rows.filter((r) => r.stage === "offer").length} at offer stage
          </p>
        </div>
        <button className="flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-[12.5px] font-semibold text-brand-fg transition-all hover:brightness-110 active:scale-[0.98]">
          <Plus className="size-4" /> Add candidate
        </button>
      </div>

      <div className="grid grid-flow-col auto-cols-[minmax(230px,1fr)] gap-2.5 overflow-x-auto pb-2">
        {STAGES.map((stage) => {
          const items = rows.filter((r) => r.stage === stage.key);
          const isOver = over === stage.key;
          return (
            <div
              key={stage.key}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(stage.key);
              }}
              onDragLeave={() => setOver((v) => (v === stage.key ? null : v))}
              onDrop={() => {
                if (dragging) move(dragging, stage.key);
                setDragging(null);
                setOver(null);
              }}
              className={`rounded-xl border p-2 transition-colors ${
                isOver ? "border-brand bg-brand-soft/40" : "border-line bg-surface-2/60"
              }`}
            >
              <div className="mb-2 flex items-center justify-between px-1.5 py-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-semibold text-fg">{stage.label}</span>
                  <span className="rounded-full bg-surface px-1.5 text-[10.5px] tabular text-subtle">{items.length}</span>
                </div>
                <Badge tone={stage.tone}>{items.length}</Badge>
              </div>

              <div className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {items.map((c) => (
                    <motion.div
                      key={c.id}
                      layout
                      layoutId={`cand-${c.id}`}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                      draggable
                      onDragStart={() => setDragging(c.id)}
                      onDragEnd={() => setDragging(null)}
                      className={`group cursor-grab rounded-lg border border-line bg-surface p-2.5 shadow-sm active:cursor-grabbing ${
                        dragging === c.id ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Avatar first={c.name.split(" ")[0]} last={c.name.split(" ")[1] ?? ""} hue={c.hue} size={26} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12.5px] font-semibold text-fg">{c.name}</p>
                          <p className="truncate text-[11px] text-subtle">{c.role}</p>
                        </div>
                        <GripVertical className="size-3.5 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="truncate rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-subtle">{c.source}</span>
                        {stage.key !== "hired" && (
                          <button
                            onClick={() => {
                              const idx = STAGES.findIndex((s) => s.key === stage.key);
                              if (idx < STAGES.length - 1) move(c.id, STAGES[idx + 1].key);
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            title="Advance stage"
                          >
                            <ArrowRight className="size-3.5 text-brand" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                  <div className="grid place-items-center rounded-lg border border-dashed border-line py-6 text-[11px] text-subtle">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card flex flex-wrap items-center gap-3 border-dashed p-4">
        <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand">
          <Sparkles className="size-4" />
        </span>
        <p className="text-[12.5px] text-muted">
          <span className="font-medium text-fg">Tip:</span> drag a card between columns, or hover and hit the arrow to
          advance someone to the next stage.
        </p>
        <span className="ml-auto flex items-center gap-1.5 text-[11.5px] text-subtle">
          <Briefcase className="size-3.5" /> {new Set(rows.map((r) => r.role)).size} open roles
        </span>
      </div>
    </div>
  );
}
