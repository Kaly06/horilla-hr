"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  LayoutGrid,
  Mail,
  MapPin,
  Phone,
  Rows3,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { Avatar } from "./avatar";
import { Badge, pretty, statusTone } from "./ui";
import type { Employee } from "@/lib/types";

const DEPTS = ["All", "Engineering", "Design", "People Ops", "Product", "Sales", "Marketing", "Finance", "Operations", "Customer Success"];

export function PeopleDirectory({ employees }: { employees: Employee[] }) {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Employee | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return employees.filter((e) => {
      const matchesQ =
        !needle ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(needle) ||
        e.role.toLowerCase().includes(needle) ||
        e.location.toLowerCase().includes(needle);
      const matchesDept = dept === "All" || e.department === dept;
      return matchesQ && matchesDept;
    });
  }, [q, dept, employees]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-fg">People</h1>
          <p className="mt-1 text-[13px] text-muted">
            {employees.length} team members across {new Set(employees.map((e) => e.department)).size} departments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-[15px] -translate-y-1/2 text-subtle" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search people…"
              className="h-9 w-[210px] rounded-lg border border-line bg-surface pl-8 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-subtle focus:border-brand"
            />
          </div>
          <div className="flex rounded-lg border border-line bg-surface p-0.5">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`grid size-8 place-items-center rounded-md transition-colors ${
                  view === v ? "bg-brand-soft text-brand" : "text-subtle hover:text-fg"
                }`}
                aria-label={`${v} view`}
              >
                {v === "grid" ? <LayoutGrid className="size-4" /> : <Rows3 className="size-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {DEPTS.map((d) => {
          const count = d === "All" ? employees.length : employees.filter((e) => e.department === d).length;
          if (d !== "All" && count === 0) return null;
          return (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={`relative shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                dept === d
                  ? "border-transparent bg-fg text-bg"
                  : "border-line bg-surface text-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              {d}
              <span className={`ml-1.5 tabular ${dept === d ? "opacity-60" : "text-subtle"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="popLayout">
        {view === "grid" ? (
          <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((e, i) => (
              <motion.button
                layout
                key={e.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.3) }}
                whileHover={{ y: -2 }}
                onClick={() => setSelected(e)}
                className="card group p-4 text-left transition-shadow hover:shadow-[var(--shadow-lg)]"
              >
                <div className="flex items-start justify-between">
                  <Avatar first={e.firstName} last={e.lastName} hue={e.hue} size={42} />
                  <Badge tone={statusTone(e.status)} dot>{pretty(e.status)}</Badge>
                </div>
                <p className="mt-3 truncate text-[14px] font-semibold text-fg">
                  {e.firstName} {e.lastName}
                </p>
                <p className="truncate text-[12px] text-muted">{e.role}</p>
                <div className="mt-3 flex items-center gap-3 text-[11.5px] text-subtle">
                  <span className="flex items-center gap-1"><Building2 className="size-3.5" />{e.department}</span>
                  <span className="flex items-center gap-1"><MapPin className="size-3.5" />{e.location}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div layout className="card overflow-hidden" >
            <table className="w-full text-left">
              <thead className="border-b border-line bg-surface-2 text-[11px] uppercase tracking-wide text-subtle">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">Department</th>
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Location</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.015, 0.25) }}
                    onClick={() => setSelected(e)}
                    className="cursor-pointer border-b border-line last:border-0 hover:bg-surface-hover"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar first={e.firstName} last={e.lastName} hue={e.hue} size={28} />
                        <span className="text-[13px] font-medium text-fg">{e.firstName} {e.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] text-muted">{e.role}</td>
                    <td className="hidden px-4 py-2.5 text-[12.5px] text-muted md:table-cell">{e.department}</td>
                    <td className="hidden px-4 py-2.5 text-[12.5px] text-muted lg:table-cell">{e.location}</td>
                    <td className="px-4 py-2.5"><Badge tone={statusTone(e.status)} dot>{pretty(e.status)}</Badge></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="grid place-items-center rounded-xl border border-dashed border-line py-16">
          <p className="text-[13px] text-subtle">Nobody matches “{q}”.</p>
        </div>
      )}

      {/* Slide-over */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.aside
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "spring", stiffness: 360, damping: 36 }}
              className="absolute inset-y-0 right-0 w-full max-w-[400px] overflow-y-auto border-l border-line bg-surface"
            >
              <div className="relative h-24 overflow-hidden border-b border-line">
                <div className="mesh">
                  <span className="left-[-10%] top-[-80%] size-[240px] bg-[var(--brand)] opacity-30" />
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg border border-line bg-surface/80 text-muted backdrop-blur"
                >
                  <X className="size-4" />
                </button>
                <div className="absolute -bottom-7 left-5">
                  <Avatar first={selected.firstName} last={selected.lastName} hue={selected.hue} size={62} ring />
                </div>
              </div>

              <div className="px-5 pb-8 pt-10">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-fg">
                      {selected.firstName} {selected.lastName}
                    </h2>
                    <p className="text-[13px] text-muted">{selected.role}</p>
                  </div>
                  <Badge tone={statusTone(selected.status)} dot>{pretty(selected.status)}</Badge>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {[
                    { label: "Department", value: selected.department },
                    { label: "Location", value: selected.location },
                    { label: "Type", value: selected.employmentType },
                    { label: "Manager", value: selected.managerName ?? "—" },
                  ].map((f) => (
                    <div key={f.label} className="rounded-lg border border-line bg-surface-2 p-2.5">
                      <p className="text-[10.5px] uppercase tracking-wide text-subtle">{f.label}</p>
                      <p className="mt-0.5 truncate text-[12.5px] font-medium text-fg">{f.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-2.5">
                  {[
                    { icon: Mail, value: selected.email },
                    { icon: Phone, value: selected.phone },
                    { icon: CalendarDays, value: `Joined ${selected.joinedAt}` },
                  ].map((row) => (
                    <div key={row.value} className="flex items-center gap-2.5 text-[12.5px] text-muted">
                      <row.icon className="size-4 text-subtle" />
                      <span className="truncate">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <button className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand text-[12.5px] font-semibold text-brand-fg transition-all hover:brightness-110">
                    <Mail className="size-3.5" /> Message
                  </button>
                  <button className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line text-[12.5px] font-medium text-fg transition-colors hover:bg-surface-hover">
                    <UserRound className="size-3.5" /> Full profile
                  </button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
