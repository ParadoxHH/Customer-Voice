from __future__ import annotations

import pytest

from backend.app import create_app
from backend.models import Base, init_engine


@pytest.fixture()
def app(monkeypatch, tmp_path):
    db_path = tmp_path / "auth.db"
    database_url = f"sqlite:///{db_path}"
    monkeypatch.setenv("DATABASE_URL", database_url)
    monkeypatch.setenv("ALLOWED_ORIGIN", "http://localhost")
    monkeypatch.setenv("TOKEN_DIGEST_RUN", "test-token")
    monkeypatch.setenv("AUTH_TOKEN_SECRET", "auth-secret-value")

    engine = init_engine(database_url)
    Base.metadata.create_all(bind=engine)
    application = create_app()
    yield application


@pytest.fixture()
def client(app):
    return app.test_client()


def test_register_and_login_flow(client):
    register_payload = {
        "email": "owner@example.com",
        "password": "supersafe123",
        "display_name": "Owner One",
    }
    register_response = client.post("/auth/register", json=register_payload)
    assert register_response.status_code == 201

    register_body = register_response.get_json()
    assert register_body["user"]["email"] == "owner@example.com"
    assert register_body["user"]["is_admin"] is True
    assert register_body["token"]

    login_payload = {"email": "owner@example.com", "password": "supersafe123"}
    login_response = client.post("/auth/login", json=login_payload)
    assert login_response.status_code == 200

    login_body = login_response.get_json()
    assert login_body["user"]["user_id"] == register_body["user"]["user_id"]
    assert login_body["token"]

    token = login_body["token"]
    me_response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    me_body = me_response.get_json()
    assert me_body["user"]["email"] == "owner@example.com"

    admin_response = client.get("/auth/admin/check", headers={"Authorization": f"Bearer {token}"})
    assert admin_response.status_code == 200


def test_login_requires_valid_credentials(client):
    client.post(
        "/auth/register",
        json={"email": "member@example.com", "password": "correcthorse"},
    )

    bad_login = client.post(
        "/auth/login",
        json={"email": "member@example.com", "password": "wrong-password"},
    )
    assert bad_login.status_code == 401
    assert bad_login.get_json()["error"] == "unauthorized"

