import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import { brand } from "@/lib/brand";
import { Counter } from "@/components/charts";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await currentUser();
  if (user) redirect("/");

  return (
    <div className="relative grid min-h-dvh overflow-hidden bg-bg lg:grid-cols-[1.05fr_1fr]">
      <div className="mesh">
        <span className="left-[-10%] top-[-15%] size-[520px] animate-drift bg-[var(--brand)]" />
        <span
          className="bottom-[-20%] right-[-5%] size-[460px] animate-drift bg-[var(--accent)]"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      {/* Form side */}
      <div className="relative z-10 flex flex-col px-6 py-8 md:px-14">
        <Logo size={32} />
        <div className="flex flex-1 items-center justify-center py-10">
          <LoginForm />
        </div>
        <p className="text-[11.5px] text-subtle">
          © {new Date().getFullYear()} {brand.name}. Crafted for teams that care.
        </p>
      </div>

      {/* Showcase side */}
      <div className="relative z-10 hidden flex-col justify-between border-l border-line bg-surface/40 p-12 backdrop-blur-xl lg:flex">
        <div className="max-w-[380px]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-2.5 py-1 text-[11.5px] font-medium text-muted">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            Live demo workspace
          </span>
          <h2 className="mt-5 text-[30px] font-semibold leading-[1.15] tracking-[-0.035em] text-fg">
            Every person, every request,
            <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent"> in one calm place.</span>
          </h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
            {brand.tagline} Track your people, approve leave in two clicks, and see the whole
            organisation breathe — without a single spreadsheet.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "People", value: 26 },
            { label: "Modules", value: 7 },
            { label: "Spreadsheets", value: 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-surface/70 p-3.5 backdrop-blur">
              <p className="text-[22px] font-semibold tracking-tight text-fg">
                <Counter value={s.value} />
              </p>
              <p className="mt-0.5 text-[11.5px] text-subtle">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
