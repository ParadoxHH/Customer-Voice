"""Routes for batch ingesting customer reviews."""

from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field, ValidationError, root_validator
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from ..analysis import analyze_sentiment, extract_topics
from ..models import Review, ReviewTopic, Source, get_session, upsert_topic

bp = Blueprint("ingest", __name__)


class SourceMetadataModel(BaseModel):
    external_id: Optional[str] = None
    name: Optional[str] = None
    platform: Optional[str] = None
    url: Optional[str] = None


class ReviewIngestItemModel(BaseModel):
    source_review_id: str
    title: Optional[str] = None
    body: str
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    author_name: Optional[str] = None
    language: Optional[str] = None
    location: Optional[str] = None
    published_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @root_validator(pre=True)
    def ensure_body_present(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        body = values.get("body")
        if not body:
            raise ValueError("body is required")
        return values


class ReviewIngestRequestModel(BaseModel):
    source_id: UUID
    overwrite_source_metadata: bool = False
    source_metadata: Optional[SourceMetadataModel] = None
    reviews: List[ReviewIngestItemModel]


def _validation_error_response(error: ValidationError):
    details = [
        {"field": ".".join(map(str, err.get("loc", []))), "issue": err.get("msg")}
        for err in error.errors()
    ]
    return (
        jsonify(
            {
                "error": "validation_error",
                "message": "Request validation failed.",
                "details": details,
            }
        ),
        400,
    )


@bp.post("/ingest")
def ingest_reviews():
    """Persist incoming reviews with dedupe guarantees."""
    payload_raw = request.get_json(silent=True) or {}
    try:
        payload = ReviewIngestRequestModel.model_validate(payload_raw)
    except ValidationError as exc:
        return _validation_error_response(exc)

    session = get_session()
    dedupe_count = 0
    created_ids: List[str] = []

    try:
        source = session.get(Source, payload.source_id)
        if not source:
            source = Source(
                id=payload.source_id,
                name=payload.source_metadata.name if payload.source_metadata and payload.source_metadata.name else "Unnamed Source",
                platform=payload.source_metadata.platform if payload.source_metadata else None,
                external_id=payload.source_metadata.external_id if payload.source_metadata else None,
                url=payload.source_metadata.url if payload.source_metadata else None,
            )
            session.add(source)
        elif payload.overwrite_source_metadata and payload.source_metadata:
            source.name = payload.source_metadata.name or source.name
            source.platform = payload.source_metadata.platform or source.platform
            source.external_id = payload.source_metadata.external_id or source.external_id
            source.url = payload.source_metadata.url or source.url

        for review_item in payload.reviews:
            exists_stmt = select(Review.id).where(
                Review.source_id == payload.source_id,
                Review.source_review_id == review_item.source_review_id,
            )
            exists = session.execute(exists_stmt).scalar_one_or_none()
            if exists:
                dedupe_count += 1
                continue

            published_at = review_item.published_at
            if published_at.tzinfo is None:
                published_at = published_at.replace(tzinfo=timezone.utc)

            sentiment = analyze_sentiment(f"{review_item.title or ''}\n{review_item.body}")
            topics = extract_topics(review_item.body)

            review = Review(
                source_id=payload.source_id,
                source_review_id=review_item.source_review_id,
                title=review_item.title,
                body=review_item.body,
                rating=review_item.rating,
                language=review_item.language,
                location=review_item.location,
                sentiment_label=sentiment["label"],
                sentiment_score=Decimal(str(sentiment["score"])),
                published_at=published_at,
            )
            session.add(review)
            session.flush()  # Acquire review.id

            for topic_result in topics:
                topic = upsert_topic(session, topic_result["topic_label"])
                review_topic = ReviewTopic(
                    review_id=review.id,
                    topic_id=topic.id,
                    topic_label=topic.topic_label,
                    topic_confidence=Decimal(str(topic_result["topic_confidence"])),
                )
                session.add(review_topic)

            created_ids.append(str(review.id))

        session.commit()
    except SQLAlchemyError as exc:  # pragma: no cover - DB-level guard
        session.rollback()
        return (
            jsonify(
                {
                    "error": "database_error",
                    "message": "Could not persist reviews.",
                    "details": [{"issue": str(exc)}],
                }
            ),
            500,
        )

    response_body = {
        "ingested_count": len(created_ids),
        "duplicate_count": dedupe_count,
        "review_ids": created_ids,
        "message": "Reviews accepted for processing.",
    }
    return jsonify(response_body), 202
