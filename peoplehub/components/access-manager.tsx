"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, useTransition } from "react";
import { Check, Info, Search, Shield, ShieldCheck, UserCog, X } from "lucide-react";
import { Avatar } from "./avatar";
import { Badge } from "./ui";
import { setAccessRole, togglePermission } from "@/app/actions";
import { CAPABILITIES, ROLES, ROLE_KEYS, roleOf, type Capability, type RoleKey } from "@/lib/rbac";
import type { AccessRow } from "@/lib/queries";

const ROLE_TONE: Record<RoleKey, "danger" | "brand" | "info" | "neutral"> = {
  admin: "danger",
  hr_manager: "brand",
  manager: "info",
  employee: "neutral",
};

export function AccessManager({
  people,
  meId,
  isAdmin,
}: {
  people: AccessRow[];
  meId: number;
  isAdmin: boolean;
}) {
  const [rows, setRows] = useState(people);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | RoleKey>("all");
  const [open, setOpen] = useState<AccessRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matches =
        !needle ||
        r.name.toLowerCase().includes(needle) ||
        r.jobTitle.toLowerCase().includes(needle) ||
        r.department.toLowerCase().includes(needle);
      return matches && (roleFilter === "all" || r.accessRole === roleFilter);
    });
  }, [rows, q, roleFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const k of ROLE_KEYS) c[k] = rows.filter((r) => r.accessRole === k).length;
    return c;
  }, [rows]);

  function changeRole(id: number, role: RoleKey) {
    setError(null);
    const previous = rows;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, accessRole: role } : r)));
    setOpen((o) => (o && o.id === id ? { ...o, accessRole: role } : o));

    start(async () => {
      const res = await setAccessRole(id, role);
      if (!res?.ok) {
        setRows(previous); // roll the optimistic update back
        setError(res?.error ?? "Could not save that change.");
      }
    });
  }

  function flipPermission(id: number, cap: Capability, granted: boolean) {
    setError(null);
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              extraPermissions: granted
                ? Array.from(new Set([...r.extraPermissions, cap]))
                : r.extraPermissions.filter((c) => c !== cap),
            }
          : r,
      ),
    );
    start(async () => {
      const res = await togglePermission(id, cap, granted);
      if (!res?.ok) setError(res?.error ?? "Could not save that change.");
    });
  }

  const admins = rows.filter((r) => r.accessRole === "admin").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-fg">Access control</h1>
          <p className="mt-1 text-[13px] text-muted">
            Decide who can approve leave, manage people and run recruitment.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-[15px] -translate-y-1/2 text-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people…"
            className="h-9 w-[220px] rounded-lg border border-line bg-surface pl-8 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-subtle focus:border-brand"
          />
        </div>
      </div>

      {!isAdmin && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <p className="text-[12.5px] leading-relaxed text-amber-600 dark:text-amber-400">
            You are viewing this in read-only mode. Only an administrator can change roles.
          </p>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5"
        >
          <X className="size-4 shrink-0 text-rose-500" />
          <p className="text-[12.5px] text-rose-500">{error}</p>
        </motion.div>
      )}

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ROLE_KEYS.map((key, i) => {
          const role = ROLES[key];
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setRoleFilter(roleFilter === key ? "all" : key)}
              className={`card p-4 text-left transition-all hover:shadow-[var(--shadow-lg)] ${
                roleFilter === key ? "ring-2 ring-brand" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <Badge tone={ROLE_TONE[key]}>{role.name}</Badge>
                <span className="tabular text-[22px] font-semibold text-fg">{counts[key] ?? 0}</span>
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-subtle">{role.description}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Role filter pills */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
        <button
          onClick={() => setRoleFilter("all")}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
            roleFilter === "all"
              ? "border-transparent bg-fg text-bg"
              : "border-line bg-surface text-muted hover:text-fg"
          }`}
        >
          Everyone <span className="ml-1 tabular opacity-60">{counts.all}</span>
        </button>
        {ROLE_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setRoleFilter(roleFilter === key ? "all" : key)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
              roleFilter === key
                ? "border-transparent bg-fg text-bg"
                : "border-line bg-surface text-muted hover:text-fg"
            }`}
          >
            {ROLES[key].name} <span className="ml-1 tabular opacity-60">{counts[key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden" >
        <table className="w-full text-left">
          <thead className="border-b border-line bg-surface-2 text-[11px] uppercase tracking-wide text-subtle">
            <tr>
              <th className="px-4 py-2.5 font-medium">Person</th>
              <th className="hidden px-4 py-2.5 font-medium md:table-cell">Department</th>
              <th className="px-4 py-2.5 font-medium">Access level</th>
              <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Extra grants</th>
              <th className="px-4 py-2.5 font-medium text-right">Manage</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filtered.map((r) => {
                const role = roleOf(r.accessRole);
                return (
                  <motion.tr
                    key={r.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-line last:border-0 hover:bg-surface-hover"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          first={r.name.split(" ")[0]}
                          last={r.name.split(" ")[1] ?? ""}
                          hue={r.hue}
                          size={30}
                        />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-[13px] font-medium text-fg">
                            {r.name}
                            {r.id === meId && (
                              <span className="rounded bg-brand-soft px-1 text-[9.5px] font-semibold uppercase text-brand">
                                you
                              </span>
                            )}
                          </p>
                          <p className="truncate text-[11.5px] text-subtle">{r.jobTitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-2.5 text-[12.5px] text-muted md:table-cell">
                      {r.department}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={ROLE_TONE[role.key]} dot>
                        {role.name}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-2.5 lg:table-cell">
                      {r.extraPermissions.length === 0 ? (
                        <span className="text-[11.5px] text-subtle">—</span>
                      ) : (
                        <span className="text-[11.5px] text-brand">
                          +{r.extraPermissions.length} capability
                          {r.extraPermissions.length === 1 ? "" : "ies"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => setOpen(r)}
                        disabled={!isAdmin}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-[11.5px] font-medium text-fg transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <UserCog className="size-3.5" /> Edit
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-[13px] text-subtle">Nobody matches that filter.</p>
        )}
      </div>

      {admins <= 1 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-line bg-surface-2 p-3.5">
          <Shield className="mt-0.5 size-4 shrink-0 text-subtle" />
          <p className="text-[12px] leading-relaxed text-subtle">
            There is only <strong className="text-fg">one administrator</strong>. Promote a second person
            before changing this one, or nobody will be able to manage access.
          </p>
        </div>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setOpen(null)} />
            <motion.aside
              initial={{ x: 460 }}
              animate={{ x: 0 }}
              exit={{ x: 460 }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
              className="absolute inset-y-0 right-0 w-full max-w-[440px] overflow-y-auto border-l border-line bg-surface"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/90 px-5 py-3 backdrop-blur">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    first={open.name.split(" ")[0]}
                    last={open.name.split(" ")[1] ?? ""}
                    hue={open.hue}
                    size={32}
                  />
                  <div>
                    <p className="text-[13.5px] font-semibold text-fg">{open.name}</p>
                    <p className="text-[11.5px] text-subtle">{open.jobTitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(null)}
                  className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-hover"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="p-5">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.09em] text-muted">
                  Access level
                </h3>
                <div className="mt-2.5 space-y-1.5">
                  {ROLE_KEYS.map((key) => {
                    const role = ROLES[key];
                    const selected = open.accessRole === key;
                    return (
                      <button
                        key={key}
                        onClick={() => changeRole(open.id, key)}
                        disabled={pending || !isAdmin}
                        className={`flex w-full items-start gap-2.5 rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed ${
                          selected
                            ? "border-brand bg-brand-soft"
                            : "border-line hover:border-line-strong hover:bg-surface-hover"
                        }`}
                      >
                        <span
                          className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border ${
                            selected ? "border-brand bg-brand text-brand-fg" : "border-line-strong"
                          }`}
                        >
                          {selected && <Check className="size-2.5" strokeWidth={4} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="text-[13px] font-medium text-fg">{role.name}</span>
                            {key === "admin" && <ShieldCheck className="size-3.5 text-danger" />}
                          </span>
                          <span className="mt-0.5 block text-[11.5px] leading-relaxed text-subtle">
                            {role.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <h3 className="mt-6 text-[12px] font-semibold uppercase tracking-[0.09em] text-muted">
                  Extra permissions
                </h3>
                <p className="mt-1 text-[11.5px] text-subtle">
                  On top of the role. Useful for one-off exceptions.
                </p>
                <ul className="mt-2.5 space-y-1">
                  {(Object.keys(CAPABILITIES) as Capability[]).map((cap) => {
                    const fromRole = roleOf(open.accessRole).capabilities.includes(cap);
                    const extra = open.extraPermissions.includes(cap);
                    const on = fromRole || extra;
                    return (
                      <li key={cap}>
                        <button
                          onClick={() => flipPermission(open.id, cap, !extra)}
                          disabled={pending || !isAdmin || fromRole}
                          title={fromRole ? "Already granted by the role" : undefined}
                          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-hover disabled:cursor-not-allowed"
                        >
                          <span
                            className={`grid size-4 shrink-0 place-items-center rounded border transition-colors ${
                              on ? "border-brand bg-brand text-brand-fg" : "border-line-strong"
                            } ${fromRole ? "opacity-50" : ""}`}
                          >
                            {on && <Check className="size-3" strokeWidth={3} />}
                          </span>
                          <span className={`flex-1 text-[12.5px] ${on ? "text-fg" : "text-muted"}`}>
                            {CAPABILITIES[cap]}
                          </span>
                          {fromRole && (
                            <span className="rounded bg-surface-2 px-1.5 text-[9.5px] uppercase tracking-wide text-subtle">
                              via role
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <p className="mt-5 rounded-lg bg-surface-2 px-3 py-2 text-[11px] leading-relaxed text-subtle">
                  Changes take effect immediately. Permission checks run on the server, so hidden
                  buttons are not the only safeguard.
                </p>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
