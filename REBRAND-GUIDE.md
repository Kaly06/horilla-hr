# The Lay of the Land

A beginner's map of this codebase — what it is, how it's built, where the "brand"
lives, and what it actually takes to make it yours.

No code has been changed yet. This is the tour, so you can make informed decisions.

---

## 1. What you actually have

You did not clone a blank starter template. You cloned a **finished, large,
production-grade HR system**.

| Fact | Number |
|---|---|
| Product | Horilla HRMS v2.2.0 |
| License | LGPL v2.1 (see §7 — this matters) |
| Language | Python (Django 5.2) |
| Python files | 1,474 |
| Lines of Python | ~369,000 |
| HTML templates | 2,121 |
| Database migrations | 247 |
| Feature modules ("apps") | 37 |

**The house analogy.** Most "vibe coding" projects start as an empty plot of
land — you describe a house and the AI builds one. This is the opposite: you
bought a **furnished 40-room building** and want to repaint it and change the
sign out front. That's a very different (and much better) job. You get a working
payroll engine, leave workflows, attendance tracking, recruitment pipelines,
performance reviews, a REST API, and role-based permissions — for free.

Your job is not *construction*. It's **renovation + signage**.

That distinction drives everything below.

---

## 2. The technology, in plain English

Five things you need to know exist. You don't need to learn them to make progress,
but knowing their names will make every future conversation easier.

### Python
The programming language the whole backend is written in. A `.py` file is
instructions the server runs.

### Django
The **framework** — a big toolbox on top of Python for building websites with
databases. It's the most popular Python web framework in the world. Django gives
you, out of the box: user login, an admin panel, database access, form handling,
security protections. Horilla is a Django project.

### PostgreSQL
The **database** — where all the actual data lives (employees, leave requests,
payslips). Think of it as a very fast, very reliable filing cabinet. The app
talks to it, but you'll rarely touch it directly.

### Redis
A **cache / queue** — short-term memory used for background jobs (e.g. "send
this email in 5 minutes"). Optional for a small install; the app runs without it.

### Docker
A way to package the app + Python + database into sealed containers so it runs
identically on any machine. The repo ships `docker-compose.yml` and a
`Makefile`, so `make dev` is the intended way to start everything.

**Key insight:** Django apps are **server-rendered**. There is no separate
"frontend" JavaScript app. The server builds an HTML page (from a template) and
sends it to the browser. That's *good news for a rebrand* — see §4.

---

## 3. How the repo is organized

```
horilla-hr/
│
├── horilla/              ← THE BRAINSTEM: configuration only
│   ├── settings/base.py       All settings: installed apps, DB, templates, security
│   ├── urls.py                Route table: which URL calls which function
│   └── __version__.py         "2.2.0"
│
├── templates/            ← Global page templates (HTML)
├── horilla_theme/        ← ★ THE DESIGN SYSTEM + override templates
│   ├── models.py              Color themes (13 built-in palettes!)
│   ├── templates/             Templates that SHADOW the ones in each app
│   └── static/…/img/logo.svg  ★ The logo
│
├── static/               ← CSS, JS, images, fonts, favicons
│   ├── build/css/style.min.css   The main stylesheet (Tailwind + custom)
│   └── favicons/                 Browser tab icons
│
├── base/                 ← Shared foundations: Company model, auth glue, utils
├── employee/             ← One folder per feature module …
├── leave/                    … each with its own models.py, views.py,
├── payroll/                    templates/, static/, migrations/
├── attendance/
├── recruitment/
├── … 30+ more
│
├── horilla_auth/         ← Custom user model + login/logout
├── horilla_api/          ← REST API (for mobile apps / integrations)
│
├── requirements.txt      ← Python package shopping list
├── Dockerfile            ← Recipe to build the app container
├── docker-compose.yml    ← Recipe to run app + database + redis together
└── Makefile              ← Shortcuts: `make dev`, `make test-smoke`, `make logs`
```

### The "app" pattern

Notice how `leave/`, `payroll/`, `employee/` all look identical inside. That's
the Django convention:

```
leave/
├── models.py        ← What a "Leave Request" IS (its fields: dates, reason, status)
├── views.py         ← What happens when you click something
├── forms.py         ← What the input form looks like / how it validates
├── urls.py          ← URL routes for this module
├── templates/leave/  ← The HTML for this module's pages
├── static/leave/     ← Its JS/CSS
└── migrations/       ← The history of every database schema change
```

Learn the pattern **once** and you can navigate all 37 modules.

### ⚠️ `migrations/` — the one folder you should be scared of

There are 247 migration files. Each one is a recorded change to the database
structure. They must be applied **in order**, and once they've run against a real
database you cannot edit them. Renaming the Python modules (`horilla_leave` →
`yourco_leave`) touches every migration's recorded app label and is the single
biggest source of "I broke everything, help" stories in Django.

**This is exactly why my recommendation is: don't rename the modules.** More in §6.

---

## 4. How a page actually happens

Follow one click — a user opening the Leave module:

```
1. Browser asks for        /leave/
              ↓
2. horilla/urls.py         "route /leave/ to the leave app's urls.py"
              ↓
3. leave/urls.py           "route '' to views.leave_view"
              ↓
4. leave/views.py          Runs Python: checks you're logged in, asks the
                           database for your leave requests
              ↓
5. Template lookup         Django asks: "who has a file called
                           leave/leave_view.html?"
                           → horilla_theme/templates/... wins if it exists
                           → otherwise leave/templates/... is used
              ↓
6. HTML sent to browser    + CSS from static/build/css/ + JS
```

### ★ The single most useful thing on this page

Look at step 5. Django searches templates in a **specific priority order**,
defined in `horilla/settings/base.py`:

```python
_TEMPLATE_LOADERS = [
    "horilla_dbtemplate.loaders.Loader",
    (filesystem  → horilla_theme/templates/),   ← HIGHEST PRIORITY
    app_directories,                            ← middle
    (filesystem  → templates/),                 ← lowest
]
```

**This is the renovation superpower.** To change how a page looks, you do **not**
edit the file buried inside `payroll/templates/…`. You copy it into
`horilla_theme/templates/` with the same path and edit it there. Django picks
yours. The original stays pristine.

That's why `horilla_theme/` exists at all — it's the official override layer.
It already contains 413 templates, many of which shadow app templates by design.

**Practical consequence:** a full UI rebrand might mean editing 20 files in one
predictable place, rather than editing 800 files scattered everywhere.

---

## 5. Where the "brand" actually lives

The word "Horilla" appears in **538 files**. That sounds terrifying. It isn't,
because those 538 split into very different categories:

| Layer | What it is | Where | Visible to users? | Difficulty |
|---|---|---|---|---|
| **1. Colour palette** | 13 built-in themes; Coral Red is default | `horilla_theme/models.py` | Yes, to everyone | 🟢 Easy |
| **2. Logo + favicon** | SVG logo, PNG fallback, tab icon | `horilla_theme/static/…/img/`, `static/favicons/` | Yes | 🟢 Easy |
| **3. Product name (login, titles, nav)** | `<title>` tags, login headline, sidebar | 87 HTML templates, but only a handful matter | Yes | 🟡 Medium |
| **4. Emails & notifications** | Mail templates from payroll/helpdesk/onboarding | ~10 mail templates | Yes | 🟡 Medium |
| **5. Help-doc links** | Links to `horilla.com` docs | one setting: `DOC_BASE_URL` | Yes | 🟢 Easy |
| **6. Python identifiers** | `horilla_views`, `HorillaUser`, `HorillaModel`, app labels | 393 .py files | **No** | 🔴 Very hard |
| **7. Migrations** | Schema history | 247 files | No | 🔴 Dangerous |
| **8. Legal / README** | Copyright headers, license, docs | Repo root | No | 🟢 Easy |

### 🔑 The good news: white-labelling already exists

Horilla's own developers anticipated this. In `base/context_processors.py`:

```python
def white_labelling_company(request):
    ...
    return {
        "white_label_company_name": company.company if company else "Horilla",
        "white_label_company": company,
    }
```

And in `horilla/settings/base.py`:

```python
WHITE_LABELLING = False      # ← flip to True
```

When `WHITE_LABELLING = True`, the app **reads the product name and logo from
your Company record in the database** instead of the hardcoded "Horilla". The
login page, page titles, and emails already respect it:

```html
{% if white_label_company.icon %}{{ white_label_company.icon.url }}
{% else %}{% static 'horilla_theme/assets/img/logo.svg' %}{% endif %}
```

**So "making it ours" is partly already a supported feature** — it's just off by
default, and it has gaps (the hardcoded `"Horilla"` fallback, and templates that
ignore the variable entirely).

Our job is therefore mostly: **flip it on, fill the gaps, give it a palette,
and replace the logo.**

That's a *much* smaller and safer project than "rename 538 files".

---

## 6. What it really costs

Rough sizing of the three possible depths I suggested:

### 🟢 Option A — Light touch (~half a day)
Change: logo, favicon, browser tab titles, login headline, `DOC_BASE_URL`.
- **Risk: near zero.** Nothing touches Python logic or the database.
- **Feels like:** "It's our app" on first impression; a curious user might still
  spot "Horilla" in a deep settings page or an email footer.

### 🟡 Option B — Full UI white-label (~2–4 days) *[my recommendation]*
Everything in A, plus:
- Enable `WHITE_LABELLING = True` and remove the hardcoded `"Horilla"` fallbacks.
- Sweep the ~87 templates for user-visible "Horilla" strings and route them
  through `white_label_company_name`.
- Update the ~10 email templates.
- Add a **brand colour theme** as the new default in `HorillaColorTheme`.
- Regenerate favicons at all sizes.

- **Risk: low–moderate.** All changes are templates, settings, static assets and
  data — reversible, reviewable, individually testable.
- **Feels like:** a genuinely branded product. Users never see "Horilla".
- **Left alone:** Python module names. They remain `horilla_*`. Invisible to
  users; it's an engineering detail, like a building's foundation having the
  original contractor's stamp on it.

### 🔴 Option C — Deep fork (weeks, high risk)
Rename apps, models, imports, DB tables, migration history.
- **Risk: high.** Every import breaks, migrations desync, upstream security
  updates become nearly impossible to merge.
- **Reward: near zero** — no user ever sees a Python file.
- I'd advise against this unless there's a hard technical requirement (e.g. you
  must ship two forks on one Python environment).

**My recommendation: Option B.** It gets you 100% of the *visible* benefit for
~5% of the risk.

---

## 7. The legal part (plain English, not legal advice)

The license is **LGPL v2.1** (GNU Lesser General Public License). In practical
terms, this is one of the most permissive "copyleft" licenses:

| Question | Answer |
|---|---|
| Can you use it commercially, on your own servers, for your own staff? | ✅ Yes, freely |
| Can you rebrand it and call it your own product? | ✅ Yes |
| Can you modify the code? | ✅ Yes |
| Can you keep your modifications private? | ✅ Mostly yes — see below |
| Must you publish your changes? | ⚠️ Only if you **distribute** the modified software to others |
| Must you keep the license and copyright notices? | ✅ **Yes — do not strip them** |
| Can you hold Horilla liable if it breaks? | ❌ No warranty, at all |

**The one rule that matters for us:** when we rebrand, we change *branding*, not
*provenance*. That means:

- ✅ Rewrite the README, change the app name, swap logos, change colours.
- ❌ Do **not** delete `LICENSE`, nor the license headers in source files.
- ✅ Correct behaviour: keep `LICENSE`, and add a line like *"Based on Horilla
  HRMS (LGPL v2.1). Modified for [Your Co]."*

If you'd like, I can add a short `NOTICE` file capturing exactly this — that's
the tidy way to do it.

*(If you ever plan to redistribute this as a product to customers, get a lawyer
to glance at it. For internal HR use, this is all straightforward.)*

---

## 8. How we'll work together ("vibe coding", demystified)

Since you're new to this, here's the loop we'll actually use — and what I need
from you at each step.

### The loop

1. **You say what you want, in plain words.** "The login page should say
   Acme People and have a blue button." No technical vocabulary needed.
2. **I translate that into a plan** and tell you which files change and the risk.
3. **I make the change** on the branch `arena/3da59b06-horilla-hr`.
4. **You look at the result.** This is the important part — see "seeing it" below.
5. **You react.** "Too blue." "Bigger logo." We repeat.

### What "seeing it" means here — an honest caveat

To *run* this app you need Python 3.12+, PostgreSQL, and ~59 Python packages
(including heavy ML libraries like `spacy`). This sandbox currently has Python
3.11 and no Docker or PostgreSQL, so I can't promise a live clickable preview
today. Options, best first:

1. **I try a lightweight local run** — SQLite instead of Postgres, minimal
   dependencies. May work; may hit a wall on Python 3.11. Worth one attempt.
2. **You run it** — `make dev` on your own machine with Docker (the documented
   path), and I make changes you pull.
3. **I show you statically** — render the specific templates I changed to
   standalone HTML files you can open and look at. Fast and reliable for pure
   visual work like the login page and logo.

I'll let you pick before we get deep into visual changes.

### Three ground rules I'll follow

- **Small commits.** One coherent change at a time, so any change can be undone
  without losing the rest.
- **No database migrations unless unavoidable.** Schema changes are the one thing
  that's genuinely hard to reverse.
- **No "big bang" rewrites.** If something needs 40 files changed, we do it in
  batches you can review.

### Two habits worth building

- **Type in your own words, even if vague.** "The sidebar looks dated" is a
  perfectly good instruction. You are not expected to know what a template
  loader is.
- **Always ask "what could break?"** I'll tell you proactively, but asking keeps
  it honest.

---

## 9. Decisions I need from you

Now that you have the map, here's the menu again with real trade-offs attached.

### Decision 1 — The name
What replaces "Horilla" in the user interface?

- **Your real company name** — best if this is for internal use. Zero extra work
  (comes from your Company record).
- **A product name you invent** — e.g. "PeopleHub", "Krew", "Atlas HR". Good if
  you might resell it.
- **A placeholder for now** — e.g. I use "PeopleHub" everywhere, and swapping it
  later is a single find-and-replace because we'll route every string through one
  variable.

> Your call. If unsure, pick the placeholder — it costs nothing and unblocks us.

### Decision 2 — How deep
- 🟢 Light touch — logo + titles only
- 🟡 **Full UI white-label — recommended**
- 🔴 Deep fork — I'd need a strong technical reason

### Decision 3 — Look and feel
- **Design it for me** — I generate a logo/wordmark and a matching colour palette.
  Since the app already supports 13 palettes, I'd add yours as #14 and make it default.
- **I have assets** — attach a logo, give me hex codes.
- **Keep current colours** — swap name + logo only, stay Coral Red.

### Decision 4 — Preview approach
Which of the three options in §8 do you want to try for seeing changes?

---

## 10. If you just want to start somewhere

The safest possible first move, ~15 minutes, zero risk, and it makes the app feel
like yours immediately:

1. Replace `horilla_theme/static/horilla_theme/assets/img/logo.svg` with your logo.
2. Replace the favicons in `static/favicons/`.
3. Change the `<title>` strings and the login headline.
4. Set `DOC_BASE_URL` so help links stop pointing at horilla.com.

Nothing here touches Python, the database, or migrations. If you hate it, we
`git checkout` the files and we're back where we started.

---

## Appendix — Cheat sheet

| I want to… | Look in… |
|---|---|
| Change a page's HTML | `horilla_theme/templates/` (override layer) **first** |
| Change colours | `horilla_theme/models.py` → `THEMES_DATA` |
| Change the logo | `horilla_theme/static/horilla_theme/assets/img/` |
| Change the app name | `base/context_processors.py` + `WHITE_LABELLING` setting |
| Change settings | `horilla/settings/base.py`, or `local_settings.py` for client overrides |
| Find which URL serves a page | `horilla/urls.py` → then that app's `urls.py` |
| Understand a feature's data | that app's `models.py` |
| Start the app | `make dev` |
| ❌ **Never touch casually** | anything in `*/migrations/` |

---

*Next step: answer Decisions 1–4 and I'll write a concrete, ordered plan with the
exact file list before I touch anything.*
