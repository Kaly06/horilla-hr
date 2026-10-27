import { redirect } from "next/navigation";
import { CheckCircle2, CircleSlash, Database, Palette, Type, Wallet } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { brand } from "@/lib/brand";
import { currentUser } from "@/lib/session";
import { can, roleOf, type Capability } from "@/lib/rbac";
import { NoAccess } from "@/components/no-access";

export const metadata = { title: "Settings" };

const SWATCHES = [
  { name: "brand", token: "--brand", note: "Primary actions, links, focus" },
  { name: "accent", token: "--accent", note: "Gradients, live indicators" },
  { name: "surface", token: "--surface", note: "Cards and panels" },
  { name: "bg", token: "--bg", note: "Page background" },
  { name: "fg", token: "--fg", note: "Primary text" },
  { name: "muted", token: "--fg-muted", note: "Secondary text" },
];

const MODULES = [
  { name: "People directory", on: true },
  { name: "Leave management", on: true },
  { name: "Attendance", on: true },
  { name: "Recruitment pipeline", on: true },
  { name: "Onboarding", on: true },
  { name: "Access control", on: true },
  { name: "Command palette", on: true },
  { name: "Dark + light theme", on: true },
  { name: "Payroll", on: false },
];

export default async function SettingsPage() {
  const me = await currentUser();
  if (!me) redirect("/login");

  if (!can(me.accessRole, "access.manage", me.extraPermissions as Capability[])) {
    return (
      <NoAccess
        title="Settings are administrator-only"
        hint="Branding and stack configuration are limited to administrators."
      />
    );
  }

  const role = roleOf(me.accessRole);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-fg">Settings</h1>
        <p className="mt-1 text-[13px] text-muted">How this product is put together</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Type className="size-4 text-brand" />
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-muted">Brand</h2>
          </div>
          <dl className="space-y-2.5">
            {[
              ["Product name", brand.name],
              ["Tagline", brand.tagline],
              ["Support email", brand.supportEmail],
              ["Signed in as", `${me.firstName} ${me.lastName} · ${role.name}`],
              ["Source file", "peoplehub/lib/brand.ts"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line pb-2 last:border-0">
                <dt className="text-[12.5px] text-muted">{k}</dt>
                <dd className="text-right text-[12.5px] font-medium text-fg">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 rounded-lg bg-brand-soft px-3 py-2 text-[11.5px] leading-relaxed text-brand">
            Edit <code className="font-mono">lib/brand.ts</code> once and the name changes everywhere.
            Roles live in <code className="font-mono">lib/rbac.ts</code>.
          </p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Palette className="size-4 text-brand" />
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-muted">Colour tokens</h2>
          </div>
          <ul className="space-y-2">
            {SWATCHES.map((s) => (
              <li key={s.name} className="flex items-center gap-3">
                <span
                  className="size-8 shrink-0 rounded-lg border border-line"
                  style={{ background: `var(${s.token})` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-fg">{s.name}</p>
                  <p className="truncate text-[11px] text-subtle">{s.note}</p>
                </div>
                <code className="font-mono text-[10.5px] text-subtle">{s.token}</code>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-brand" />
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-muted">Modules</h2>
          </div>
          <ul className="grid grid-cols-2 gap-1.5">
            {MODULES.map((m) => (
              <li
                key={m.name}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[12px] ${
                  m.on ? "border-line bg-surface-2 text-fg" : "border-dashed border-line text-subtle"
                }`}
              >
                {m.on ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                ) : (
                  <CircleSlash className="size-3.5" />
                )}
                <span className="truncate">{m.name}</span>
                {!m.on && <Badge tone="neutral">off</Badge>}
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-subtle">
            <Wallet className="mt-0.5 size-3.5 shrink-0" />
            Payroll is deliberately excluded from this build, as requested.
          </p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Database className="size-4 text-brand" />
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-muted">Stack</h2>
          </div>
          <dl className="space-y-2.5">
            {[
              ["Framework", "Next.js 16 (App Router)"],
              ["Language", "TypeScript"],
              ["Database", "SQLite (Node built-in)"],
              ["Styling", "Tailwind CSS v4"],
              ["Motion", "Motion (Framer)"],
              ["Permissions", "Role + capability checks"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line pb-2 last:border-0">
                <dt className="text-[12.5px] text-muted">{k}</dt>
                <dd className="text-right text-[12.5px] font-medium text-fg">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11.5px] leading-relaxed text-subtle">
            Delete the <code className="font-mono">.data</code> folder and restart to reseed fresh demo data.
          </p>
        </Card>
      </div>
    </div>
  );
}
