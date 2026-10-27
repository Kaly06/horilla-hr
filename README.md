# Acme HR

A Human Resource Management System covering employee records, recruitment,
onboarding, attendance, leave, payroll, assets, helpdesk and performance —
built on Django.

> This is a rebranded fork of [Horilla HRMS](https://github.com/horilla/horilla-hr),
> licensed under LGPL-2.1. See [NOTICE](NOTICE) for exactly what was changed and
> what the licence requires. The original copyright notices and `LICENSE` file
> remain in place.

## 🎨 Rebranding this for your own organisation

Almost everything visible comes from two places:

| What | Where |
|---|---|
| Product name, logo alt text, support email, help links | `horilla/settings/branding.py` |
| Colour palette (13 ship by default, yours is appended and marked default) | `horilla/settings/branding.py` |
| Logo and favicons | `scripts/generate_brand_assets.py` regenerates them from that palette |

```bash
# 1. Edit the constants
$EDITOR horilla/settings/branding.py

# 2. Regenerate the favicons and PNG logos from the new palette
python scripts/generate_brand_assets.py

# 3. Optionally replace the vector mark
#    horilla_theme/static/horilla_theme/assets/img/logo.svg

# 4. Restart
```

`WHITE_LABELLING = True` is enabled in `horilla/settings/local_settings.py`,
which means the name and logo shown to signed-in users come from the **Company
record in the database** (Settings → Company). That is the strongest form of
branding: rename the company in the UI and the whole product follows.

The constants in `branding.py` cover the screens shown *before* a company
exists — the login page, the first-run setup wizard and the error pages.

## 🚀 Features

### Core HR Modules
- 👥 **Employee Management** - Centralized workforce data with LDAP integration
- 🎯 **Recruitment** - End-to-end hiring process from job posting to onboarding
- 📋 **Onboarding & Offboarding** - Structured workflows for employee lifecycle
- ⏰ **Attendance & Time Tracking** - Biometric integration and automated check-in/out
- 🏖️ **Leave Management** - Policy enforcement, approvals, and balance tracking
- 💰 **Payroll** - Automated salary processing, tax calculations, and compliance
- 📊 **Performance Management** - Goal setting, reviews, and continuous feedback
- 🏢 **Asset Management** - Track and manage company resources
- 🎫 **Helpdesk** - Centralized HR support and ticketing system


## 📋 Table of Contents

- [Which Branch Do I Want?](#-which-branch-do-i-want)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Security](#-security)
- [Support](#-support)
- [License](#-license)

## ⚡ Quick Start

### With Docker (recommended)

The official upstream image (`horilla/horilla-hr`) does **not** include the
changes in this repository — pulling it would replace your rebrand with the
default Horilla build. Always build from this source.

```bash
git clone <your-repo-url> acme-hr
cd acme-hr
docker compose up -d
open http://localhost:8000
```

Full Docker guide, including production deployment: [docker/README.md](docker/README.md)

### Building from source with Docker

```bash
# Clone this repository
git clone <your-repo-url> acme-hr
cd acme-hr

# Start with Docker Compose
docker compose up -d

# Access the application
open http://localhost:8000
```

Full Docker guide, including production deployment: [docker/README.md](docker/README.md)

### Manual Installation

Requires **Python 3.12, 3.13 or 3.14**, and pip 21.3 or newer. Python 3.15 is
not usable yet: `spacy` declares `Requires-Python <3.15` and is imported at
module scope, so the app cannot start on it.

```bash
# Clone and setup (defaults to the stable 2.0 branch)
git clone <your-repo-url> acme-hr
cd acme-hr

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Upgrade pip FIRST. A venv inherits the system pip, and an older one does not
# recognise current manylinux wheel tags -- it then tries to compile packages
# like cryptography and PyMuPDF from source, which needs a C toolchain most
# machines do not have. The Docker build already does this; do the same here.
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.dist .env
# Edit .env with your configuration

# Initialize database
python manage.py migrate
python manage.py compilemessages
python manage.py collectstatic

# Run development server
python manage.py runserver
```


## 🛠 Installation

For detailed installation instructions, configuration guides, and platform-specific setup instructions, please visit our comprehensive documentation:

### 📖 [Complete Installation Guide → docs.horilla.com/technical/v2.0/ ](https://docs.horilla.com/technical/v2.0/)

Our documentation includes:
- **Step-by-step installation** for all supported platforms
- **Database configuration** guides
- **Environment setup** instructions
- **Production deployment** best practices
- **Troubleshooting** common issues
- **Advanced configuration** options

<!-- Need help? Check out the [Installation FAQ](https://docs.horilla.com) or reach out to our [community support](#-support). -->

## 🚀 Deployment

For production deployment guides including Nginx, Apache, and cloud platforms:
### 📖 [Deployment Guide → docs.horilla.com/technical/v2.0/doc/deployment/nginx-gunicorn](https://docs.horilla.com/technical/v2.0/doc/deployment/nginx-gunicorn)


## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Fork and clone your fork
git clone -b dev/v2.0 https://github.com/YOUR_USERNAME/horilla-hr.git
cd acme-hr

# Add upstream remote
git remote add upstream https://github.com/horilla/horilla-hr.git

# Create feature branch
git checkout -b feature/your-feature-name

# Install development dependencies
pip install -r requirements.txt

# Submit pull request
```

> **Note:** `2.0` is the repo default, so GitHub pre-selects it as your PR base. Before submitting, change the base branch to `dev/v2.0` — that's where active development and reviews happen, not `2.0`.

### Code Standards

- Follow [PEP 8](https://pep8.org/) for Python code
- Use [Black](https://black.readthedocs.io/) for code formatting
- Write tests for new features
- Update documentation for user-facing changes

## 🔒 Security

### Security Features

- 🔐 **Authentication & Authorization** - Role-based access control
- 🛡️ **Data Protection** - Encrypted sensitive data storage
- 🔍 **Audit Trails** - Comprehensive activity logging
- 🚫 **Input Validation** - XSS and injection protection
- 🔒 **Session Security** - Secure session management

### Reporting Security Issues

Report vulnerabilities **privately** to your own security contact — do not open
a public issue. This fork is maintained by this repository's owners, not by the
Horilla project, so issues must be triaged here. See [SECURITY.md](SECURITY.md)
for the process, and note that it inherits policy text from upstream that you
may want to update with your own contact address.

If you believe a vulnerability exists in the **unmodified upstream code**, it is
also worth notifying the Horilla maintainers so the fix can be merged upstream
and picked up by this fork.

### Security Best Practices

- Always use HTTPS in production
- Set `DEBUG = False` and `HORILLA_ENV=production`
- Replace the default `SECRET_KEY`, database and Redis passwords in `.env`
- Regularly update dependencies
- Use strong passwords and enable 2FA
- Take regular database backups (see the `pg_backup` module)

## 📞 Support

This is a private fork. Support is provided by whoever maintains this
repository — find them in your team's internal documentation.

Useful upstream references (documentation, not support):
- 📖 **Upstream documentation**: [docs.horilla.com](https://docs.horilla.com)
- 🐛 **Upstream codebase**: [github.com/horilla/horilla-hr](https://github.com/horilla/horilla-hr)

> Upstream's documentation, community forum and paid support describe **stock
> Horilla**. Where this fork differs — branding, the default palette, the
> `branding.py` module — their guidance will not match this codebase.

### Keeping up with upstream security fixes

```bash
git remote add upstream https://github.com/horilla/horilla-hr.git
git fetch upstream
git log --oneline upstream/2.0 --no-merges | head -30   # review first
git cherry-pick <commit>                                 # or merge deliberately
```

## 📄 License

This project is licensed under the [LGPL-2.1 License](LICENSE) — see the LICENSE
file for the full text and [NOTICE](NOTICE) for what this fork changed.

If you distribute this software (or a modified version of it) outside your
organisation, LGPL-2.1 requires you to keep the copyright notices and licence
intact, and to make the corresponding source available.

---

<sub>Built on [Horilla HRMS](https://github.com/horilla/horilla-hr), LGPL-2.1.
Rebranded and maintained as Acme HR. See [NOTICE](NOTICE).</sub>
