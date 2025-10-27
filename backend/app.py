"""Flask application factory for the Customer Voice Dashboard API."""

from __future__ import annotations

import json
import os
from typing import Any, Dict, Tuple

from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from .models import init_app as init_models
from .routes.analyze import bp as analyze_bp
from .routes.competitors import bp as competitors_bp
from .routes.digest import bp as digest_bp
from .routes.ingest import bp as ingest_bp
from .routes.insights import bp as insights_bp


def create_app() -> Flask:
    """Application factory used by Render and local development."""
    app = Flask(__name__)

    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable must be set.")
    allowed_origin = os.environ.get("ALLOWED_ORIGIN")
    if not allowed_origin:
        raise RuntimeError("ALLOWED_ORIGIN environment variable must be set.")

    app.config["DATABASE_URL"] = database_url
    app.config["ALLOWED_ORIGIN"] = allowed_origin
    app.config["TOKEN_DIGEST_RUN"] = os.environ.get("TOKEN_DIGEST_RUN", "")
    app.config["OPENAI_API_KEY"] = os.environ.get("OPENAI_API_KEY")
    app.config["RESEND_API_KEY"] = os.environ.get("RESEND_API_KEY")

    init_models(app)

    CORS(
        app,
        origins=[allowed_origin],
        methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=False,
        max_age=600,
    )

    register_blueprints(app)
    register_routes(app)
    register_error_handlers(app)

    return app


def register_blueprints(app: Flask) -> None:
    """Attach route blueprints to the Flask app."""
    app.register_blueprint(ingest_bp)
    app.register_blueprint(analyze_bp)
    app.register_blueprint(insights_bp)
    app.register_blueprint(competitors_bp)
    app.register_blueprint(digest_bp)


def register_routes(app: Flask) -> None:
    """Register lightweight app routes that are not part of a blueprint."""

    @app.get("/health")
    def health() -> Tuple[Response, int]:
        """Simple liveness check for Render/GitHub Actions probes."""
        payload: Dict[str, Any] = {
            "status": "ok",
            "service": "customer-voice-api",
        }
        return jsonify(payload), 200


def register_error_handlers(app: Flask) -> None:
    """Ensure the API returns JSON errors conforming to the contract."""

    @app.errorhandler(HTTPException)
    def handle_http_exception(exc: HTTPException) -> Tuple[Response, int]:
        retry_after = exc.response.headers.get("Retry-After") if exc.response else None
        payload: Dict[str, Any] = {
            "error": getattr(exc, "name", "error").lower().replace(" ", "_"),
            "message": exc.description or "An error occurred.",
            "details": [],
        }
        if exc.code == 429:
            retry_after_seconds = int(retry_after or 60)
            payload.update(
                {
                    "retry_after_seconds": retry_after_seconds,
                    "guidance": "Reduce request frequency or wait before retrying.",
                }
            )
        response = jsonify(payload)
        if retry_after:
            response.headers["Retry-After"] = str(retry_after)
        response.status_code = exc.code or 500
        return response, response.status_code

    @app.errorhandler(429)
    def handle_rate_limit(exc: HTTPException) -> Tuple[Response, int]:
        retry_after_seconds = _extract_retry_after(exc, default=60)
        payload: Dict[str, Any] = {
            "error": "rate_limited",
            "message": exc.description or "Too many requests.",
            "details": [],
            "retry_after_seconds": retry_after_seconds,
            "guidance": "Back off and retry after the indicated delay.",
        }
        response = jsonify(payload)
        response.status_code = 429
        response.headers["Retry-After"] = str(retry_after_seconds)
        return response, 429

    @app.errorhandler(Exception)
    def handle_generic_exception(exc: Exception) -> Tuple[Response, int]:
        app.logger.exception("Unhandled exception: %s", exc)
        payload = {
            "error": "internal_server_error",
            "message": "Unexpected error occurred. Please try again later.",
            "details": [],
        }
        return jsonify(payload), 500


def _extract_retry_after(exc: HTTPException, default: int = 60) -> int:
    """Derive a Retry-After value from an exception or default."""
    retry_after = None
    if exc.response and exc.response.headers.get("Retry-After"):
        retry_after = exc.response.headers["Retry-After"]
    elif isinstance(exc.description, (int, float)):
        retry_after = exc.description
    try:
        return int(retry_after) if retry_after is not None else default
    except (TypeError, ValueError):
        return default


if __name__ == "__main__":
    application = create_app()
    port = int(os.environ.get("PORT", "5000"))
    application.run(host="0.0.0.0", port=port)
