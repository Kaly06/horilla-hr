"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/* ── Animated number ──────────────────────────────────────── */
export function Counter({
  value,
  duration = 900,
  className = "",
  suffix = "",
}: {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const [n, setN] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return (
    <span className={`tabular ${className}`}>
      {n}
      {suffix}
    </span>
  );
}

/* ── Area / line chart ────────────────────────────────────── */
export function AreaChart({
  data,
  height = 140,
  color = "var(--brand)",
}: {
  data: Array<{ label: string; value: number }>;
  height?: number;
  color?: string;
}) {
  const w = 520;
  const h = height;
  const pad = 8;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const pts = data.map((d, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(data.length - 1, 1);
    const y = pad + (1 - (d.value - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#areaFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.25 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        {pts.map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            fill="var(--surface)"
            stroke={color}
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.05, type: "spring", stiffness: 400, damping: 20 }}
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10.5px] text-subtle">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Horizontal bars ──────────────────────────────────────── */
export function BarList({
  data,
  max,
}: {
  data: Array<{ label: string; value: number }>;
  max?: number;
}) {
  const ceiling = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-2.5">
      {data.map((d, i) => (
        <li key={d.label} className="group">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="truncate text-[12.5px] text-muted">{d.label}</span>
            <span className="tabular text-[12px] font-medium text-fg">{d.value}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / ceiling) * 100}%` }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ── Donut ────────────────────────────────────────────────── */
export function Donut({
  data,
  size = 132,
  thickness = 16,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <motion.circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="space-y-1.5">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-[12.5px]">
            <span className="size-2 rounded-full" style={{ background: d.color }} />
            <span className="text-muted">{d.label}</span>
            <span className="tabular ml-auto font-medium text-fg">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Heatmap ──────────────────────────────────────────────── */
export function Heatmap({
  cells,
}: {
  cells: Array<{ date: string; intensity: number; label: string }>;
}) {
  return (
    <div className="grid grid-flow-col grid-rows-5 gap-1">
      {cells.map((c, i) => (
        <motion.div
          key={c.date}
          title={c.label}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.004, duration: 0.25 }}
          className="size-[11px] rounded-[3px]"
          style={{
            background:
              c.intensity === 0
                ? "var(--surface-2)"
                : `color-mix(in oklab, var(--brand) ${18 + c.intensity * 20}%, var(--surface-2))`,
          }}
        />
      ))}
    </div>
  );
}
