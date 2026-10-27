"""
Brand definition — the single place to make this product yours.

Everything below is a plain Python constant. Change it here, restart the app,
and the login screen, page titles, emails, sidebar and favicons all follow.

Nothing in this file affects business logic, the database schema, or the
migration history, so it is safe to edit and safe to revert.

Two layers of branding, in priority order:

1. WHITE_LABELLING = True (set in local_settings.py)
   The product name and logo are read from the Company record in the database.
   This is the strongest form of "ours": change the company name in the UI and
   the whole product renames itself. Recommended.

2. The constants below
   Used for screens shown before a company exists — the login page, the
   first-run setup wizard, and error pages — and as the fallback whenever
   white-labelling is off.
"""

# ── Identity ────────────────────────────────────────────────────────────────
# Shown on the login page, in page titles and in the sidebar.
BRAND_NAME = "Acme HR"

# Short form for tight spaces (mobile header, favicon tooltip).
BRAND_SHORT_NAME = "Acme"

# Used by screen readers and email clients that cannot load images.
BRAND_LOGO_ALT = "Acme HR logo"

# ── Support and legal ───────────────────────────────────────────────────────
# In-app help links are built from this. Point it at your own docs.
DOC_BASE_URL = "https://example.com/help"

# Shown in the footer of outbound mail templates.
BRAND_SUPPORT_EMAIL = "help@example.com"

# ── Colour palette ──────────────────────────────────────────────────────────
# 13 palettes ship with Horilla; this one is ours and is marked default.
# The Tailwind scale runs 50 (lightest surface) to 900 (darkest ink).
BRAND_THEME_NAME = "Acme Indigo (Default)"
BRAND_THEME_DESCRIPTION = "Deep indigo primary with a cool neutral base."

BRAND_PRIMARY = {
    "primary_50": "#f5f6ff",
    "primary_100": "#eceeff",
    "primary_200": "#dde1ff",
    "primary_300": "#c3c9ff",
    "primary_400": "#9aa4ff",
    "primary_500": "#6b78f8",
    "primary_600": "#4f5bd5",
    "primary_700": "#3f49ad",
    "primary_800": "#333c8c",
    "primary_900": "#20264f",
}

BRAND_DARK = {
    "dark_50": "#e8e8ef",
    "dark_100": "#b9b9c7",
    "dark_200": "#6d6d80",
    "dark_300": "#3a3a4a",
    "dark_400": "#5a5a6e",
    "dark_500": "#1b1b26",
    "dark_600": "#0d0d14",
}

BRAND_SECONDARY = {
    "secondary_50": "#f7f8fa",
    "secondary_100": "#eef0f4",
    "secondary_200": "#e2e5ec",
    "secondary_300": "#cbd0db",
    "secondary_400": "#dde1ff",
    "secondary_500": "#c3c9ff",
    "secondary_600": "#4f5bd5",
    "secondary_700": "#3f4757",
    "secondary_800": "#272c38",
    "secondary_900": "#14181f",
}


def theme_data() -> dict:
    """The brand palette in the shape horilla_theme expects."""
    return {
        "name": BRAND_THEME_NAME,
        "description": BRAND_THEME_DESCRIPTION,
        "is_default": True,
        **BRAND_PRIMARY,
        **BRAND_DARK,
        **BRAND_SECONDARY,
    }
