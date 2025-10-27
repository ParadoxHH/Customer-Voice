"""Security helpers for bearer token verification and auth utilities."""

from __future__ import annotations

from typing import Optional

from flask import current_app
from werkzeug.exceptions import Unauthorized


def extract_bearer_token(header_value: Optional[str]) -> Optional[str]:
    """Return the token component from a standard Bearer header."""
    if not header_value:
        return None
    parts = header_value.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1]


def require_digest_token(auth_header: Optional[str]) -> None:
    """Ensure the provided Authorization header matches TOKEN_DIGEST_RUN."""
    expected = current_app.config.get("TOKEN_DIGEST_RUN")
    if not expected:
        raise Unauthorized(description="Digest token is not configured.")

    provided = extract_bearer_token(auth_header)
    if not provided or provided != expected:
        raise Unauthorized(description="Invalid bearer token.")
