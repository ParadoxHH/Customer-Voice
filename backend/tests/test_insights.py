from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

import pytest

from backend.app import create_app
from backend.models import (
    Base,
    Review,
    ReviewTopic,
    Source,
    init_engine,
    session_scope,
    upsert_topic,
)


@pytest.fixture()
def app(monkeypatch, tmp_path):
    db_path = tmp_path / "test.db"
    database_url = f"sqlite:///{db_path}"
    monkeypatch.setenv("DATABASE_URL", database_url)
    monkeypatch.setenv("ALLOWED_ORIGIN", "http://localhost")
    monkeypatch.setenv("TOKEN_DIGEST_RUN", "test-token")
    monkeypatch.setenv("AUTH_TOKEN_SECRET", "test-secret-key")

    engine = init_engine(database_url)
    Base.metadata.create_all(bind=engine)
    application = create_app()
    yield application


@pytest.fixture()
def client(app):
    return app.test_client()


def _seed_basic_reviews():
    with session_scope() as session:
        source = Source(name="App Store", platform="app_store")
        session.add(source)
        session.flush()

        review = Review(
            source_id=source.id,
            source_review_id="r-1",
            title="Great dashboard",
            body="Love the sentiment chart and fast insights!",
            rating=Decimal("4.5"),
            sentiment_label="Positive",
            sentiment_score=Decimal("0.85"),
            published_at=datetime(2025, 3, 1, 12, tzinfo=timezone.utc),
        )
        session.add(review)
        session.flush()

        topic = upsert_topic(session, "Dashboard UX")
        review_topic = ReviewTopic(
            review_id=review.id,
            topic_id=topic.id,
            topic_label=topic.topic_label,
            topic_confidence=Decimal("0.90"),
        )
        session.add(review_topic)


def test_insights_returns_metrics(app, client):
    _seed_basic_reviews()

    response = client.get("/insights")
    assert response.status_code == 200

    payload = response.get_json()
    assert payload["pagination"]["total_items"] == 1
    assert payload["sentiment_trend"], "Expected sentiment trend to contain entries."
    assert payload["topic_distribution"][0]["topic_label"] == "Dashboard UX"
    assert payload["source_breakdown"][0]["review_count"] == 1
    assert payload["recent_reviews"][0]["sentiment"]["label"] == "Positive"


def test_insights_empty_dataset(app, client):
    response = client.get("/insights")
    assert response.status_code == 200

    payload = response.get_json()
    assert payload["pagination"]["total_items"] == 0
    assert payload["recent_reviews"] == []
    assert payload["sentiment_trend"] == []
    assert payload["topic_distribution"] == []
    assert payload["source_breakdown"] == []
