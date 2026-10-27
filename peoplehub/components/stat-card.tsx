"use client";

import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, CalendarDays, Clock, UserPlus, Users } from "lucide-react";
import { Counter } from "./charts";

/* Icons are resolved here, inside the client component, because a server
   component cannot pass a function (like a component) across the boundary. */
const ICONS = {
  users: Users,
  clock: Clock,
  calendar: CalendarDays,
  userplus: UserPlus,
};

export type StatIcon = keyof typeof ICONS;

export function StatCard({
  label,
  value,
  suffix,
  delta,
  hint,
  icon,
  index = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  delta?: number;
  hint?: string;
  icon: StatIcon;
  index?: number;
}) {
  const up = (delta ?? 0) >= 0;
  const Icon = ICONS[icon];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="card group relative overflow-hidden p-4"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "color-mix(in oklab, var(--brand) 40%, transparent)" }}
      />
      <div className="flex items-center justify-between">
        <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand">
          <Icon className="size-[15px]" />
        </span>
        {typeof delta === "number" && (
          <span
            className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
              up ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
            }`}
          >
            {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-[26px] font-semibold leading-none tracking-[-0.03em] text-fg">
        <Counter value={value} suffix={suffix} />
      </p>
      <p className="mt-1.5 text-[12.5px] font-medium text-muted">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-subtle">{hint}</p>}
    </motion.div>
  );
}
