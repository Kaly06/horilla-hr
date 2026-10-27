"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Coffee, LogIn, LogOut, MapPin, Timer, Users } from "lucide-react";
import { Avatar } from "./avatar";
import { Badge, pretty } from "./ui";
import { punch } from "@/app/actions";
import type { AttendanceRecord, Employee } from "@/lib/types";

export function AttendancePanel({
  me,
  myRecord,
  today,
  team,
  week,
}: {
  me: Employee;
  myRecord: AttendanceRecord | null;
  today: { present: number; remote: number; late: number; absent: number; leave: number };
  team: Array<{ employee: Employee; status: string; checkIn: string | null }>;
  week: Array<{ date: string; label: string; count: number }>;
}) {
  const router = useRouter();
  const [now, setNow] = useState<Date | null>(null);
  const [optimistic, setOptimistic] = useState(myRecord);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Keep the card in sync when the server sends fresh data after a refresh.
  useEffect(() => {
    setOptimistic(myRecord);
  }, [myRecord]);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const punchedIn = !!optimistic?.checkIn;
  const punchedOut = !!optimistic?.checkOut;
  // You can start a day (or start a new one) unless you are mid-shift.
  const canClockIn = !punchedIn || punchedOut;
  const canClockOut = punchedIn && !punchedOut;

  function doPunch(kind: "in" | "out") {
    setError(null);
    const time = new Date().toTimeString().slice(0, 5);
    setOptimistic((prev) => ({
      ...(prev ?? {
        id: 0,
        employeeId: me.id,
        date: "",
        checkIn: null,
        checkOut: null,
        status: "present",
      }),
      checkIn: kind === "in" ? time : prev?.checkIn ?? null,
      checkOut: kind === "in" ? null : time,
    }));
    start(async () => {
      const res = await punch(kind);
      if (!res?.ok) {
        setError(res?.error ?? "Could not save your punch.");
        setOptimistic(myRecord);
        return;
      }
      // Pull the fresh server render so the team list and summary agree.
      router.refresh();
    });
  }

  const hours = (() => {
    if (!optimistic?.checkIn) return "0h 00m";
    const [h, m] = optimistic.checkIn.split(":").map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    const end = optimistic.checkOut
      ? (() => {
          const [h2, m2] = optimistic.checkOut.split(":").map(Number);
          const d = new Date();
          d.setHours(h2, m2, 0, 0);
          return d;
        })()
      : now ?? start;
    const mins = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
    return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
  })();

  const maxWeek = Math.max(...week.map((w) => w.count), 1);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-fg">Attendance</h1>
        <p className="mt-1 text-[13px] text-muted">
          {today.present + today.remote + today.late} of {team.length} in today · {today.remote} remote · {today.late} late
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_1.25fr]">
        {/* Punch card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card relative overflow-hidden p-5"
        >
          <div className="mesh">
            <span className="right-[-20%] top-[-60%] size-[260px] animate-drift bg-[var(--accent)] opacity-25" />
          </div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar first={me.firstName} last={me.lastName} hue={me.hue} size={38} />
                <div>
                  <p className="text-[13.5px] font-semibold text-fg">{me.firstName} {me.lastName}</p>
                  <p className="text-[11.5px] text-subtle">Your local time</p>
                </div>
              </div>
              <Badge tone={canClockOut ? "success" : punchedOut ? "info" : "neutral"} dot>
                {punchedOut ? "Day complete" : punchedIn ? "Clocked in" : "Not clocked in"}
              </Badge>
            </div>

            <p className="tabular mt-6 text-[40px] font-semibold leading-none tracking-[-0.03em] text-fg">
              {now
                ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                : "--:--:--"}
            </p>
            <p className="mt-1.5 text-[12.5px] text-muted">
              {now
                ? now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
                : ""}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: "Checked in", value: optimistic?.checkIn ?? "—" },
                { label: "Checked out", value: optimistic?.checkOut ?? "—" },
                { label: "Logged", value: hours },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-line bg-surface-2 p-2.5">
                  <p className="text-[10.5px] uppercase tracking-wide text-subtle">{s.label}</p>
                  <p className="tabular mt-0.5 text-[13px] font-semibold text-fg">{s.value}</p>
                </div>
              ))}
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-[11.5px] text-rose-500">
                {error}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => doPunch("in")}
                disabled={pending || !canClockIn}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand text-[13px] font-semibold text-brand-fg transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <LogIn className="size-4" /> {punchedOut ? "Start again" : "Clock in"}
              </button>
              <button
                onClick={() => doPunch("out")}
                disabled={pending || !canClockOut}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface text-[13px] font-semibold text-fg transition-all hover:bg-surface-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <LogOut className="size-4" /> Clock out
              </button>
            </div>
          </div>
        </motion.div>

        {/* Today's team */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-muted">Who's in today</h2>
            <span className="flex items-center gap-1 text-[11.5px] text-subtle"><Users className="size-3.5" />{team.length}</span>
          </div>
          <ul className="mt-3 max-h-[300px] space-y-2 overflow-y-auto pr-1">
            {team.map((t, i) => (
              <motion.li
                key={t.employee.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                className="flex items-center gap-2.5"
              >
                <Avatar first={t.employee.firstName} last={t.employee.lastName} hue={t.employee.hue} size={30} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-fg">
                    {t.employee.firstName} {t.employee.lastName}
                  </p>
                  <p className="truncate text-[11px] text-subtle">{t.employee.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  {t.checkIn && <span className="tabular text-[11.5px] text-subtle">{t.checkIn}</span>}
                  <Badge tone={t.status === "present" ? "success" : t.status === "remote" ? "info" : t.status === "late" ? "warning" : t.status === "leave" ? "info" : "danger"}>
                    {pretty(t.status)}
                  </Badge>
                </div>
              </motion.li>
            ))}
            {team.length === 0 && <p className="py-8 text-center text-[12.5px] text-subtle">No records yet today.</p>}
          </ul>
        </motion.div>
      </div>

      {/* Weekly rhythm */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-muted">Attendance rhythm</h2>
            <p className="mt-1 text-[12.5px] text-subtle">People checked in per day, last two weeks</p>
          </div>
          <span className="flex items-center gap-1 text-[11.5px] text-subtle"><Timer className="size-3.5" />avg {Math.round(maxWeek * 0.7)}</span>
        </div>
        <div className="flex items-end gap-1.5" style={{ height: 120 }}>
          {week.map((w, i) => (
            <div key={w.date} className="group flex flex-1 flex-col items-center justify-end gap-1.5">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((w.count / maxWeek) * 88, 3)}%` }}
                transition={{ delay: i * 0.03, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-t-[4px] bg-gradient-to-t from-brand/50 to-brand transition-opacity group-hover:opacity-80"
                title={`${w.count} in`}
              />
              <span className="text-[9.5px] text-subtle">{w.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3 text-[11.5px] text-subtle">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" />{today.present} present</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-sky-500" />{today.remote} remote</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" />{today.late} late</span>
          <span className="flex items-center gap-1.5"><MapPin className="size-3" />{today.leave} on leave</span>
          <span className="flex items-center gap-1.5"><Coffee className="size-3" />{today.absent} absent</span>
        </div>
      </div>
    </div>
  );
}
