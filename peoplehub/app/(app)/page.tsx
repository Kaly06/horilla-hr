import Link from "next/link";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { Card, Badge, pretty, statusTone } from "@/components/ui";
import { AreaChart, BarList, Donut } from "@/components/charts";
import { StatCard } from "@/components/stat-card";
import { Avatar } from "@/components/avatar";
import { getMetrics, listActivity, listLeave, listOnboarding } from "@/lib/queries";
import { currentUser } from "@/lib/session";
import { brand } from "@/lib/brand";

const DONUT_COLORS = ["var(--brand)", "var(--accent)", "#a78bfa", "#f59e0b", "#fb7185"];

export default async function OverviewPage() {
  const user = await currentUser();
  const m = getMetrics();
  const activity = listActivity(7);
  const pending = listLeave("pending").slice(0, 4);
  const onboarding = listOnboarding().filter((t) => !t.done).slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const completion = (() => {
    const all = listOnboarding();
    if (!all.length) return 0;
    return Math.round((all.filter((t) => t.done).length / all.length) * 100);
  })();

  return (
    <div className="space-y-5">
      {/* Hero */}
      <Card className="relative overflow-hidden border-line/70 p-6">
        <div className="mesh">
          <span className="right-[-6%] top-[-60%] size-[340px] animate-drift bg-[var(--brand)] opacity-25" />
          <span
            className="right-[18%] top-[10%] size-[200px] animate-drift bg-[var(--accent)] opacity-20"
            style={{ animationDelay: "-9s" }}
          />
        </div>
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-subtle">{today}</p>
            <h1 className="mt-1.5 text-[27px] font-semibold leading-tight tracking-[-0.035em] text-fg">
              {greeting}, {user?.firstName}.
            </h1>
            <p className="mt-1.5 max-w-lg text-[13.5px] text-muted">
              {m.pendingLeave > 0
                ? `You have ${m.pendingLeave} leave request${m.pendingLeave === 1 ? "" : "s"} waiting for a decision.`
                : "Nothing needs your attention right now. Enjoy the quiet."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/leave"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[12.5px] font-semibold text-brand-fg transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Review leave <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/people"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] font-medium text-fg transition-colors hover:bg-surface-hover"
            >
              <Users className="size-3.5" /> People directory
            </Link>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total headcount" value={m.headcount} delta={8} hint={`${m.newHires} joined this month`} icon="users" />
        <StatCard index={1} label="In today" value={m.presentToday} suffix={`/${m.headcount}`} delta={2} hint={`${m.remoteToday} remote · ${m.lateToday} late`} icon="clock" />
        <StatCard index={2} label="Leave requests" value={m.pendingLeave} hint="Awaiting your approval" icon="calendar" />
        <StatCard index={3} label="Onboarding" value={completion} suffix="%" hint="Checklists completed" icon="userplus" />
      </div>

      {/* Charts row */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-muted">Headcount growth</h2>
              <p className="mt-1 text-[12.5px] text-subtle">Cumulative team size over 8 months</p>
            </div>
            <Badge tone="success" dot>+{m.headcount - m.months[0].value} this year</Badge>
          </div>
          <AreaChart data={m.months} height={150} />
        </Card>

        <Card>
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-muted">Leave mix</h2>
          <p className="mb-4 mt-1 text-[12.5px] text-subtle">All requests by type</p>
          <Donut
            data={m.leaveByType.slice(0, 4).map((d, i) => ({
              label: d.type,
              value: d.n,
              color: DONUT_COLORS[i % DONUT_COLORS.length],
            }))}
          />
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-muted">Departments</h2>
            <Link href="/people" className="text-[11.5px] font-medium text-brand hover:underline">
              View all
            </Link>
          </div>
          <BarList data={m.byDept.slice(0, 6).map((d) => ({ label: d.department, value: d.n }))} />
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-muted">Needs a decision</h2>
            <Link href="/leave" className="text-[11.5px] font-medium text-brand hover:underline">
              All
            </Link>
          </div>
          <ul className="space-y-2.5">
            {pending.map((l) => (
              <li key={l.id} className="flex items-center gap-2.5">
                <Avatar
                  first={l.employeeName!.split(" ")[0]}
                  last={l.employeeName!.split(" ")[1] ?? ""}
                  hue={l.hue ?? 244}
                  size={30}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-fg">{l.employeeName}</p>
                  <p className="truncate text-[11px] text-subtle">
                    {l.type} · {l.days}d from {l.startDate}
                  </p>
                </div>
                <Badge tone="warning">{pretty(l.status)}</Badge>
              </li>
            ))}
            {pending.length === 0 && <p className="py-6 text-center text-[12.5px] text-subtle">All clear.</p>}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.09em] text-muted">Recent activity</h2>
          <ul className="space-y-3">
            {activity.slice(0, 5).map((a) => (
              <li key={a.id} className="flex gap-2.5">
                <Avatar first={a.actor.split(" ")[0]} last={a.actor.split(" ")[1] ?? ""} hue={a.hue} size={26} />
                <p className="text-[12.5px] leading-snug text-muted">
                  <span className="font-medium text-fg">{a.actor}</span> {a.action}{" "}
                  <span className="text-fg">{a.target}</span>
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Onboarding strip */}
      <Card className="flex flex-wrap items-center gap-4 border-dashed">
        <span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-fg">
            {onboarding.length} onboarding task{onboarding.length === 1 ? "" : "s"} still open
          </p>
          <p className="truncate text-[12px] text-subtle">
            {onboarding.map((t) => t.title).slice(0, 2).join(" · ") || "Everything is done."}
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-surface-hover"
        >
          Open checklists <ArrowRight className="size-3.5" />
        </Link>
      </Card>

      <p className="pt-2 text-center text-[11px] text-subtle">
        {brand.name} · demo data resets when you delete the <code className="font-mono">.data</code> folder
      </p>
    </div>
  );
}
