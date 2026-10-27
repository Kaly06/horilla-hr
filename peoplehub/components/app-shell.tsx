"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Briefcase,
  CalendarDays,
  ChevronsLeft,
  Clock,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Avatar } from "./avatar";
import { brand } from "@/lib/brand";

import type { Capability } from "@/lib/rbac";

/** `capability` omitted = visible to anyone signed in. */
const NAV: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  capability?: Capability;
}> = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/people", label: "People", icon: Users, capability: "people.view" },
  { href: "/leave", label: "Leave", icon: CalendarDays },
  { href: "/attendance", label: "Attendance", icon: Clock },
  { href: "/recruitment", label: "Recruitment", icon: Briefcase, capability: "recruitment.manage" },
  { href: "/onboarding", label: "Onboarding", icon: Rocket, capability: "onboarding.manage" },
  { href: "/access", label: "Access", icon: ShieldCheck, capability: "access.manage" },
  { href: "/settings", label: "Settings", icon: Settings, capability: "access.manage" },
];

export interface ShellUser {
  name: string;
  role: string;
  hue: number;
  roleName: string;
  capabilities: string[];
}

export interface SearchablePerson {
  id: number;
  name: string;
  role: string;
  hue: number;
}

export function AppShell({
  user,
  people,
  pendingLeave,
  children,
}: {
  user: ShellUser;
  people: SearchablePerson[];
  pendingLeave: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const nav = NAV.filter(
    (item) => !item.capability || user.capabilities.includes(item.capability),
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pages = nav.filter((n) => n.label.toLowerCase().includes(q)).map((n) => ({
      kind: "page" as const,
      id: `p-${n.href}`,
      label: n.label,
      hint: "Go to page",
      href: n.href,
    }));
    const persons = people
      .filter((p) => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q))
      .slice(0, 6)
      .map((p) => ({
        kind: "person" as const,
        id: `u-${p.id}`,
        label: p.name,
        hint: p.role,
        href: `/people?focus=${p.id}`,
        hue: p.hue,
      }));
    return [...pages, ...persons];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, people, user.capabilities.join()]);

  useEffect(() => setCursor(0), [query]);

  function go(href: string) {
    setPaletteOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div className="min-h-dvh bg-bg">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-300 ease-out md:flex ${
          collapsed ? "w-[76px]" : "w-[248px]"
        }`}
      >
        <div className={`flex h-16 items-center ${collapsed ? "justify-center" : "px-5"}`}>
          <Link href="/" aria-label={brand.name}>
            <Logo size={30} showWordmark={!collapsed} />
          </Link>
        </div>

        <nav className="mt-2 flex-1 space-y-0.5 px-3">
          {nav.map((item) => {
            const isActive = active(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors ${
                  isActive ? "text-fg" : "text-muted hover:bg-surface-hover hover:text-fg"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-brand-soft"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon className={`relative size-[17px] ${isActive ? "text-brand" : ""}`} />
                {!collapsed && <span className="relative">{item.label}</span>}
                {!collapsed && item.href === "/leave" && pendingLeave > 0 && (
                  <span className="relative ml-auto rounded-full bg-brand px-1.5 text-[10.5px] font-semibold leading-[18px] text-brand-fg tabular">
                    {pendingLeave}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <div
            className={`flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Avatar first={user.name.split(" ")[0]} last={user.name.split(" ")[1] ?? ""} hue={user.hue} size={32} />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-fg">{user.name}</p>
                <p className="truncate text-[11.5px] text-subtle">{user.roleName}</p>
              </div>
            )}
            {!collapsed && (
              <form action="/logout" method="post">
                <button
                  className="grid size-8 place-items-center rounded-md text-subtle transition-colors hover:bg-surface-hover hover:text-danger"
                  title="Sign out"
                >
                  <LogOut className="size-[15px]" />
                </button>
              </form>
            )}
          </div>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-[11.5px] text-subtle transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <ChevronsLeft className={`size-[14px] transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 400, damping: 38 }}
              className="absolute inset-y-0 left-0 w-[260px] border-r border-line bg-surface p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <Logo size={30} />
                <button onClick={() => setMobileOpen(false)} className="text-muted">
                  <X className="size-5" />
                </button>
              </div>
              <nav className="space-y-0.5">
                {nav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium ${
                        active(item.href) ? "bg-brand-soft text-fg" : "text-muted"
                      }`}
                    >
                      <Icon className="size-[17px]" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className={`transition-[padding] duration-300 ease-out ${collapsed ? "md:pl-[76px]" : "md:pl-[248px]"}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-xl md:px-7">
          <button className="text-muted md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>

          <p className="text-[13.5px] font-medium text-muted">
            {nav.find((n) => active(n.href))?.label ?? "Overview"}
          </p>

          <button
            onClick={() => setPaletteOpen(true)}
            className="ml-auto flex w-full max-w-[260px] items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-[7px] text-left text-[13px] text-subtle transition-colors hover:border-line-strong"
          >
            <Search className="size-[15px]" />
            <span className="flex-1 truncate">Search people, pages…</span>
            <kbd className="hidden items-center gap-0.5 rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-subtle sm:flex">
              <Command className="size-2.5" />K
            </kbd>
          </button>

          <button
            className="relative grid size-9 place-items-center rounded-lg border border-line bg-surface text-muted transition-colors hover:bg-surface-hover hover:text-fg"
            aria-label="Notifications"
          >
            <Bell className="size-[17px]" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger ring-2 ring-surface" />
          </button>

          <ThemeToggle />
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-7 md:py-8">{children}</main>
      </div>

      {/* Command palette */}
      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setPaletteOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 460, damping: 34 }}
              className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-lg)]"
            >
              <div className="flex items-center gap-2.5 border-b border-line px-4">
                <Search className="size-[17px] text-subtle" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setCursor((c) => Math.min(c + 1, results.length - 1));
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setCursor((c) => Math.max(c - 1, 0));
                    }
                    if (e.key === "Enter" && results[cursor]) go(results[cursor].href);
                  }}
                  placeholder="Where do you want to go?"
                  className="h-14 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-subtle"
                />
                <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-subtle">
                  esc
                </kbd>
              </div>
              <div className="max-h-[340px] overflow-y-auto p-2">
                {results.length === 0 && (
                  <p className="px-3 py-8 text-center text-[13px] text-subtle">No matches.</p>
                )}
                {results.map((r, i) => (
                  <button
                    key={r.id}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(r.href)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      i === cursor ? "bg-brand-soft" : ""
                    }`}
                  >
                    {r.kind === "person" ? (
                      <Avatar
                        first={r.label.split(" ")[0]}
                        last={r.label.split(" ")[1] ?? ""}
                        hue={(r as any).hue ?? 244}
                        size={26}
                      />
                    ) : (
                      <span className="grid size-[26px] place-items-center rounded-md bg-surface-2 text-muted">
                        <LayoutDashboard className="size-3.5" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-fg">{r.label}</span>
                      <span className="block truncate text-[11.5px] text-subtle">{r.hint}</span>
                    </span>
                    <span className="text-[10.5px] uppercase tracking-wide text-subtle">{r.kind}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
