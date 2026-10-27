"""
Client-specific overrides.

Imported last from horilla.settings.__init__ (after base + addons).
Override settings here; do NOT use ``from .base import *`` — that re-exports
base MEDIA_* values and wipes AWS S3 paths set by addons.py.

Branding lives in ``branding.py`` beside this file. This module applies it.
"""

from .branding import BRAND_NAME, DOC_BASE_URL

# ── Branding ────────────────────────────────────────────────────────────────
# Read the product name and logo from the Company record in the database.
# This is what makes the whole product adopt your organisation's identity:
# the login screen, page titles, sidebar, emails and favicons all follow.
WHITE_LABELLING = True

# Fallback name used before a company exists (login page, first-run wizard,
# error pages) and whenever white-labelling is switched off.
FALLBACK_BRAND_NAME = BRAND_NAME

# Where in-app help links point. Ships pointing at example.com on purpose:
# a fork should not silently send staff to the upstream vendor's docs.
DOC_BASE_URL = DOC_BASE_URL


# ── Examples of other common overrides ──────────────────────────────────────
#
#     DEBUG = False
#     ALLOWED_HOSTS = ["hr.example.com"]
#     CSRF_TRUSTED_ORIGINS = ["https://hr.example.com"]
#
#     # Extend lists via selective import (same list object as base):
#     from .base import INSTALLED_APPS, MIDDLEWARE
#
#     INSTALLED_APPS += ["client_portal"]
#     MIDDLEWARE += ["client_portal.middleware.ClientTrackingMiddleware"]
