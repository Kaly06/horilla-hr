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

# ── Preview / reverse-proxy mode ────────────────────────────────────────────
# Set HORILLA_PREVIEW_MODE=1 when the app is served through an HTTPS reverse
# proxy on a host you do not control (CI previews, tunnels, embedded iframes).
#
# Without this, the app believes it is on plain HTTP, so it never marks the
# session and CSRF cookies Secure, and browsers refuse to store third-party
# cookies inside an embedded frame. The symptom is a login form that answers
# every submit with 403 "CSRF cookie not set".
#
# This is deliberately opt-in and never enabled by .env.dist or the Docker
# files: production keeps SAMEORIGIN framing and Lax cookies.
import os as _os

if _os.environ.get("HORILLA_PREVIEW_MODE") == "1":
    # Trust the proxy's X-Forwarded-Proto so Django knows the request is HTTPS.
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

    # Cookies must be Secure (required alongside SameSite=None) and
    # SameSite=None (required for cross-site, embedded contexts).
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SAMESITE = "None"

    # The preview renders the app inside a cross-origin iframe, and SAMEORIGIN
    # makes the browser refuse to display it. Django's clickjacking middleware
    # cannot be neutralised by setting X_FRAME_OPTIONS to None (it calls
    # .upper() on the value), so remove the middleware for previews only.
    # local_settings is consumed via `from .local_settings import *`, so base
    # names are not in this module's namespace: import the ones we extend.
    from .base import CSRF_TRUSTED_ORIGINS, MIDDLEWARE

    MIDDLEWARE = [
        m
        for m in MIDDLEWARE
        if m != "django.middleware.clickjacking.XFrameOptionsMiddleware"
    ]

    # Do not force an HTTPS redirect: TLS terminates at the proxy, and a
    # redirect on the internal hop would loop.
    SECURE_SSL_REDIRECT = False

    # Trust the preview host as a CSRF origin. The sandbox hostname is
    # generated per session, so match any subdomain rather than hardcoding it.
    CSRF_TRUSTED_ORIGINS = list(CSRF_TRUSTED_ORIGINS or []) + [
        "https://*.e2b.app",
        "https://*.arena.ai",
    ]



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
