"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { ArrowRight, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { login } from "@/app/actions";

const DEMOS = [
  { email: "amara.okafor@peoplehub.app", name: "Amara Okafor", role: "Head of People", hue: 262 },
  { email: "lina.haddad@peoplehub.app", name: "Lina Haddad", role: "Product Designer", hue: 320 },
];

export function LoginForm() {
  const [email, setEmail] = useState(DEMOS[0].email);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await login(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="w-full max-w-[400px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-fg">Welcome back</h1>
        <p className="mt-1.5 text-[13.5px] text-muted">
          Sign in to your workspace. This is a demo — no password required.
        </p>

        <form action={submit} className="mt-7 space-y-3">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-muted">
              Work email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-subtle" />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-[13.5px] text-fg outline-none transition-colors placeholder:text-subtle focus:border-brand"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-[12px] font-medium text-muted">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-subtle" />
              <input
                id="password"
                name="password"
                type="password"
                defaultValue="demo"
                className="h-11 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-[13.5px] text-fg outline-none transition-colors placeholder:text-subtle focus:border-brand"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-rose-500/10 px-3 py-2 text-[12.5px] text-rose-500"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand text-[13.5px] font-semibold text-brand-fg transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-[10.5px] uppercase tracking-[0.12em] text-subtle">or continue as</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <div className="space-y-2">
          {DEMOS.map((d, i) => (
            <motion.button
              key={d.email}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              onClick={() => {
                setEmail(d.email);
                const fd = new FormData();
                fd.set("email", d.email);
                submit(fd);
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-left transition-colors hover:border-line-strong hover:bg-surface-hover"
            >
              <span
                className="grid size-8 place-items-center rounded-full text-[11.5px] font-semibold"
                style={{
                  color: `hsl(${d.hue} 62% 26%)`,
                  background: `linear-gradient(150deg, hsl(${d.hue} 78% 88%), hsl(${(d.hue + 28) % 360} 74% 78%))`,
                }}
              >
                {d.name.split(" ").map((p) => p[0]).join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-fg">{d.name}</span>
                <span className="block text-[11.5px] text-subtle">{d.role}</span>
              </span>
              <ArrowRight className="size-4 text-subtle" />
            </motion.button>
          ))}
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-[11.5px] text-subtle">
          <Sparkles className="size-3.5" />
          Demo workspace with sample data
        </p>
      </motion.div>
    </div>
  );
}
