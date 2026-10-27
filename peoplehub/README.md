# PeopleHub

A modern HR workspace: people directory, leave, attendance, recruitment and
onboarding. Built as a clean-room alternative to the Django HRMS in this repo —
**no payroll**, no legacy baggage, and it runs live in the browser.

![stack](https://img.shields.io/badge/Next.js-16-black) ![stack](https://img.shields.io/badge/TypeScript-5-blue) ![stack](https://img.shields.io/badge/Tailwind-4-38bdf8) ![stack](https://img.shields.io/badge/SQLite-built--in-003b57)

---

## Run it

```bash
cd peoplehub
npm install
npm run dev        # http://localhost:3000
```

Sign in with any of the demo accounts (no password needed):

| Email | Who |
|---|---|
| `amara.okafor@peoplehub.app` | Head of People — sees everything |
| `lina.haddad@peoplehub.app` | Product Designer |
| `ravi.menon@peoplehub.app` | Engineering Manager |

The database is created and seeded automatically on first boot. The three demo
accounts deliberately start with **no attendance record for today**, so you can
clock in and watch the day build up.

```bash
npm run reset      # wipe demo data (restart the server afterwards to reseed)
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

---

## What's inside

| Area | Route | What it does |
|---|---|---|
| Overview | `/` | Headcount, attendance, leave, onboarding — animated charts + activity feed |
| People | `/people` | Searchable directory, department filters, grid/list, slide-over profiles |
| Leave | `/leave` | Approve or decline requests inline; status updates instantly |
| Attendance | `/attendance` | Live clock, clock in/out, team presence, two-week rhythm chart |
| Recruitment | `/recruitment` | Drag-and-drop pipeline across five stages |
| Onboarding | `/onboarding` | Per-hire checklists that save on every tick |
| Access | `/access` | Administrator console: change anyone's role, grant one-off permissions |
| Settings | `/settings` | Brand config, colour tokens, module status, stack |

Plus: `⌘K` / `Ctrl+K` command palette, light/dark theme, collapsible sidebar,
and a fully responsive mobile drawer. Navigation is filtered by permission, so
each role only sees the sections it can actually use.

---

## Roles and access

| Role | Can do |
|---|---|
| **Administrator** | Everything, including changing other people's access |
| **HR Manager** | People, leave, attendance, recruitment, onboarding. Cannot change access |
| **Team Manager** | Directory, approve leave, view attendance |
| **Employee** | Self-service: directory, own leave, own attendance |

Sign in as each demo account to see the difference:

| Account | Role |
|---|---|
| `amara.okafor@peoplehub.app` | Administrator |
| `ravi.menon@peoplehub.app` | Team Manager |
| `lina.haddad@peoplehub.app` | Employee |

Roles are defined in **`lib/rbac.ts`** — capabilities, role descriptions and
the `can()` helper all live in that one file. Per-person exceptions are stored
in `employees.permissions` as a JSON array of capability keys.

**Enforcement is server-side.** Hiding a nav link is cosmetic; every page
re-checks the capability before rendering and every Server Action calls
`guard()` before touching the database. A non-admin POSTing straight to the
`setAccessRole` action gets `"You do not have permission"` and the row is
unchanged. The console also refuses to demote the last remaining administrator.

---

## Rebranding

Everything visual comes from two places:

1. **`lib/brand.ts`** — name, tagline, support email. Change it once; the login
   screen, sidebar, page titles and footer all follow.
2. **`app/globals.css`** — the `:root` and `.dark` token blocks. Change
   `--brand` and `--accent` and the whole product recolours.

The logo is a single inline SVG in `components/logo.tsx` — swap the `<svg>` for
your own mark.

---

## How it's built

```
peoplehub/
├── app/
│   ├── (app)/            ← authenticated area (shared shell + sidebar)
│   │   ├── page.tsx          dashboard
│   │   ├── people/ leave/ attendance/ recruitment/ onboarding/ settings/
│   │   └── layout.tsx        auth gate + AppShell
│   ├── login/            ← public sign-in
│   ├── actions.ts        ← every mutation (server actions)
│   └── globals.css       ← design tokens
├── components/           ← shell, charts, boards, primitives
├── lib/
│   ├── brand.ts          ← ★ edit me to rebrand
│   ├── db.ts             ← schema + seed
│   ├── queries.ts        ← all reads
│   ├── session.ts        ← cookie auth
│   └── types.ts
└── .data/peoplehub.db    ← created at runtime, git-ignored
```

### Why these choices

- **Server Components for reads, Server Actions for writes.** No REST layer, no
  client-side data fetching, no loading spinners. Mutations call
  `revalidatePath()` and the UI updates.
- **Node's built-in `node:sqlite`.** Real persistence with zero native
  compilation — nothing to install, nothing to break on a new machine. To move
  to Postgres later, replace `lib/db.ts` with Prisma or Drizzle; every query is
  already isolated in `lib/queries.ts`.
- **Tailwind v4 + CSS variables.** Theming is one file, and dark mode is a class
  toggle rather than duplicate stylesheets.
- **Motion for animation.** Every transition is interruptible and respects the
  user's reduced-motion preference at the OS level.

---

## Scope

Intentionally **excluded**: payroll, tax calculation, payslips. That's the part
of the Django HRMS with the most regulatory surface area and the least product
value for a first build.

## Status

Working demo with sample data. Auth is deliberately fake (a cookie with an
employee ID) — replace `lib/session.ts` with a real provider before this handles
any real employee data.
