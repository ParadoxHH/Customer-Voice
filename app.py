"""WSGI entrypoint for gunicorn."""

from backend.app import create_app

app = create_app()
