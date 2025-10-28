"""Authentication routes for account registration and login."""

from __future__ import annotations

from datetime import datetime, timezone

from flask import Blueprint, current_app, g, jsonify, request
from sqlalchemy import func, select
from werkzeug.exceptions import BadRequest, Conflict, Unauthorized
from werkzeug.security import check_password_hash, generate_password_hash

from ..models import User, session_scope
from ..security import generate_auth_token, require_auth

bp = Blueprint("auth", __name__, url_prefix="/auth")


def _serialize_user(user: User) -> dict[str, object]:
    """Return a safe JSON representation of a user record."""
    return {
        "user_id": str(user.id),
        "email": user.email,
        "display_name": user.display_name,
        "role": user.role,
        "is_admin": user.is_admin,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
        "updated_at": user.updated_at.isoformat(),
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
    }


def _resolve_admin_flag(invite_code: str | None, *, session) -> bool:
    """Determine whether the registering user should be granted admin privileges."""
    configured_invite = current_app.config.get("ADMIN_INVITE_CODE") or ""
    invite_matches = bool(invite_code and configured_invite and invite_code == configured_invite)

    if invite_matches:
        return True

    admins_count = session.execute(
        select(func.count()).select_from(User).where(User.is_admin.is_(True))
    ).scalar_one()
    # If no admins exist yet and no invite code is configured, allow the first user to become admin.
    if admins_count == 0 and not configured_invite:
        return True

    return False


@bp.post("/register")
def register():
    """Create a new user account and issue an auth token."""
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    display_name = (payload.get("display_name") or "").strip() or None
    admin_invite = (payload.get("admin_invite") or "").strip() or None

    min_length = int(current_app.config.get("AUTH_PASSWORD_MIN_LENGTH", 8))

    if "@" not in email:
        raise BadRequest(description="A valid email address is required.")
    if len(password) < min_length:
        raise BadRequest(description=f"Password must be at least {min_length} characters long.")

    with session_scope() as session:
        existing = session.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if existing:
            raise Conflict(description="An account with this email already exists.")

        is_admin = _resolve_admin_flag(admin_invite, session=session)
        role = "admin" if is_admin else "analyst"
        now = datetime.now(timezone.utc)
        user = User(
            email=email,
            display_name=display_name,
            role=role,
            password_hash=generate_password_hash(password),
            is_admin=is_admin,
            last_login_at=now,
        )
        session.add(user)
        session.flush()

        token = generate_auth_token(user_id=str(user.id), role=user.role, is_admin=user.is_admin)
        response_body = {"user": _serialize_user(user), "token": token}
        return jsonify(response_body), 201


@bp.post("/login")
def login():
    """Authenticate a user and return an auth token."""
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not email or not password:
        raise BadRequest(description="Email and password are required.")

    with session_scope() as session:
        user = session.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if not user or not check_password_hash(user.password_hash, password):
            raise Unauthorized(description="Invalid credentials.")
        if not user.is_active:
            raise Unauthorized(description="Account is inactive.")

        user.last_login_at = datetime.now(timezone.utc)
        session.add(user)
        token = generate_auth_token(user_id=str(user.id), role=user.role, is_admin=user.is_admin)
        response_body = {"user": _serialize_user(user), "token": token}
        return jsonify(response_body), 200


@bp.get("/me")
@require_auth()
def me():
    """Return the authenticated user's profile."""
    user: User = g.current_user
    return jsonify({"user": _serialize_user(user)}), 200


@bp.get("/admin/check")
@require_auth(admin=True)
def admin_check():
    """Simple endpoint to verify admin access."""
    user: User = g.current_user
    return jsonify({"user": _serialize_user(user)}), 200
