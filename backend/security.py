"""Security helpers for bearer token verification and auth utilities."""

from __future__ import annotations

from functools import wraps
from typing import Any, Callable, Dict, Optional, TypeVar, cast

from flask import current_app, g, request
from itsdangerous import BadSignature, BadTimeSignature, URLSafeTimedSerializer
from werkzeug.exceptions import Forbidden, Unauthorized

from .models import User, get_session

F = TypeVar("F", bound=Callable[..., Any])

AUTH_SERIALIZER_SALT = "customer-voice-auth"


def extract_bearer_token(header_value: Optional[str]) -> Optional[str]:
    """Return the token component from a standard Bearer header."""
    if not header_value:
        return None
    parts = header_value.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1]


def _get_token_serializer() -> URLSafeTimedSerializer:
    secret = current_app.config.get("AUTH_TOKEN_SECRET")
    if not secret:
        raise RuntimeError("AUTH_TOKEN_SECRET is not configured.")
    return URLSafeTimedSerializer(secret_key=secret, salt=AUTH_SERIALIZER_SALT)


def generate_auth_token(*, user_id: str, role: str, is_admin: bool) -> str:
    """Issue a signed token for the given user claims."""
    serializer = _get_token_serializer()
    payload = {"sub": user_id, "role": role, "is_admin": is_admin}
    return serializer.dumps(payload)


def verify_auth_token(token: str) -> Dict[str, Any]:
    """Validate an auth token and return its payload."""
    serializer = _get_token_serializer()
    max_age = int(current_app.config.get("AUTH_TOKEN_TTL_SECONDS", 60 * 60 * 24 * 7))
    try:
        data = cast(Dict[str, Any], serializer.loads(token, max_age=max_age))
    except BadTimeSignature as exc:  # type: ignore[no-untyped-call]
        raise Unauthorized(description="Token has expired.") from exc
    except BadSignature as exc:  # type: ignore[no-untyped-call]
        raise Unauthorized(description="Invalid token.") from exc
    return data


def require_auth(*, admin: bool = False) -> Callable[[F], F]:
    """Decorator for routes that require an authenticated (optionally admin) user."""

    def decorator(fn: F) -> F:
        @wraps(fn)
        def wrapper(*args, **kwargs):
            header = request.headers.get("Authorization")
            token = extract_bearer_token(header)
            if not token:
                raise Unauthorized(description="Authentication required.")

            payload = verify_auth_token(token)
            user_id = payload.get("sub")
            if not user_id:
                raise Unauthorized(description="Invalid token payload.")

            session = get_session()
            user = session.get(User, user_id)
            if not user or not user.is_active:
                raise Unauthorized(description="User is not active.")

            if admin and not user.is_admin:
                raise Forbidden(description="Admin privileges required.")

            g.current_user = user
            g.auth_payload = payload
            return fn(*args, **kwargs)

        return cast(F, wrapper)

    return decorator


def require_digest_token(auth_header: Optional[str]) -> None:
    """Ensure the provided Authorization header matches TOKEN_DIGEST_RUN."""
    expected = current_app.config.get("TOKEN_DIGEST_RUN")
    if not expected:
        raise Unauthorized(description="Digest token is not configured.")

    provided = extract_bearer_token(auth_header)
    if not provided or provided != expected:
        raise Unauthorized(description="Invalid bearer token.")
