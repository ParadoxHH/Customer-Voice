"""Digest generation endpoint and shared helpers."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, ValidationError, field_validator, model_validator
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Competitor, Digest, Review, ReviewTopic, get_session
from ..security import require_digest_token

bp = Blueprint("digest", __name__)


class DigestRequestModel(BaseModel):
    timeframe_start: Optional[datetime] = None
    timeframe_end: Optional[datetime] = None
    include_competitors: bool = True

    @field_validator("timeframe_start", "timeframe_end", mode="before")
    @classmethod
    def parse_datetime(cls, value):
        if value is None:
            return value
        if isinstance(value, datetime):
            dt = value
        else:
            value_str = str(value)
            if value_str.endswith("Z"):
                value_str = value_str.replace("Z", "+00:00")
            dt = datetime.fromisoformat(value_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)

    @model_validator(mode="after")
    def validate_range(cls, values):
        start = values.timeframe_start
        end = values.timeframe_end
        if start and end and start >= end:
            raise ValueError("timeframe_end must be after timeframe_start")
        return values


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


@bp.post("/digest/run")
def run_digest():
    """Generate an insights digest and persist the snapshot."""
    require_digest_token(request.headers.get("Authorization"))

    payload_raw = request.get_json(silent=True) or {}
    try:
        payload = DigestRequestModel.model_validate(payload_raw)
    except ValidationError as exc:
        return _validation_error_response(exc)

    now = datetime.now(timezone.utc)
    timeframe_end = payload.timeframe_end or now
    timeframe_start = payload.timeframe_start or (timeframe_end - timedelta(days=7))

    session = get_session()
    digest_payload = assemble_digest(
        session,
        timeframe_start=timeframe_start,
        timeframe_end=timeframe_end,
        include_competitors=payload.include_competitors,
    )

    digest_record = Digest(
        timeframe_start=timeframe_start,
        timeframe_end=timeframe_end,
        summary={"highlights": digest_payload["highlights"]},
        sentiment_snapshot=digest_payload.get("sentiment_snapshot", {}),
        topics_snapshot={"topic_spotlight": digest_payload.get("topic_spotlight", [])},
        competitor_snapshot={"items": digest_payload.get("competitor_summary", [])}
        if payload.include_competitors
        else None,
    )
    session.add(digest_record)
    session.flush()

    digest_payload["digest_id"] = str(digest_record.id)
    digest_payload["generated_at"] = digest_record.generated_at.isoformat()
    digest_payload["timeframe_start"] = timeframe_start.isoformat()
    digest_payload["timeframe_end"] = timeframe_end.isoformat()

    session.commit()
    return jsonify(digest_payload), 200


def assemble_digest(
    session: Session,
    *,
    timeframe_start: datetime,
    timeframe_end: datetime,
    include_competitors: bool = True,
) -> Dict[str, Any]:
    """Assemble digest data reused by API route and CLI script."""
    base_filters = [
        Review.published_at >= timeframe_start,
        Review.published_at <= timeframe_end,
        Review.competitor_id.is_(None),
    ]
    sentiment_snapshot = _sentiment_summary(session, base_filters)
    topic_spotlight = _topic_spotlight(session, base_filters, limit=3)

    total_reviews = sentiment_snapshot["review_count"]
    unique_sources = session.execute(
        select(func.count(func.distinct(Review.source_id))).filter(*base_filters)
    ).scalar_one_or_none() or 0

    highlights = [
        f"Total reviews: {total_reviews} across {unique_sources} sources.",
        f"Positive/Neutral/Negative split: {sentiment_snapshot['positive']}/{sentiment_snapshot['neutral']}/{sentiment_snapshot['negative']}.",
    ]
    if topic_spotlight:
        highlights.append(
            f"Top topic: {topic_spotlight[0]['topic_label']} ({topic_spotlight[0]['change_vs_previous']} trend)."
        )

    key_metrics = {
        "total_reviews": total_reviews,
        "average_sentiment": sentiment_snapshot["average_score"],
        "positive_ratio": round(
            sentiment_snapshot["positive"] / total_reviews, 2
        )
        if total_reviews
        else 0.0,
        "unique_sources": unique_sources,
    }

    competitor_summary: List[Dict[str, Any]] = []
    if include_competitors:
        competitor_summary = _competitor_overview(
            session,
            timeframe_start=timeframe_start,
            timeframe_end=timeframe_end,
            baseline_avg=sentiment_snapshot["average_score"],
        )

    digest_payload = {
        "highlights": highlights,
        "key_metrics": key_metrics,
        "sentiment_snapshot": sentiment_snapshot,
        "topic_spotlight": topic_spotlight,
        "competitor_summary": competitor_summary,
    }
    return digest_payload


def _sentiment_summary(session: Session, filters) -> Dict[str, Any]:
    stmt = (
        select(
            Review.sentiment_label,
            func.count(Review.id).label("count"),
            func.avg(Review.sentiment_score).label("avg_score"),
        )
        .filter(*filters)
        .group_by(Review.sentiment_label)
    )
    rows = session.execute(stmt).all()
    summary = {"positive": 0, "neutral": 0, "negative": 0, "average_score": 0.0, "review_count": 0}

    score_total = 0.0
    for row in rows:
        count = row.count or 0
        avg_score = float(row.avg_score) if isinstance(row.avg_score, (float, Decimal)) else 0.0
        label = row.sentiment_label.lower()
        if label in summary:
            summary[label] = count
        summary["review_count"] += count
        score_total += avg_score * count

    if summary["review_count"]:
        summary["average_score"] = round(score_total / summary["review_count"], 2)

    return summary


def _topic_spotlight(
    session: Session, filters, limit: int = 3
) -> List[Dict[str, Any]]:
    stmt = (
        select(
            ReviewTopic.topic_label,
            func.count(ReviewTopic.review_id).label("count"),
        )
        .join(Review, Review.id == ReviewTopic.review_id)
        .filter(*filters)
        .group_by(ReviewTopic.topic_label)
        .order_by(func.count(ReviewTopic.review_id).desc())
        .limit(limit)
    )
    rows = session.execute(stmt).all()
    spotlight = []
    for row in rows:
        quotes_stmt = (
            select(Review.body)
            .join(ReviewTopic, ReviewTopic.review_id == Review.id)
            .filter(ReviewTopic.topic_label == row.topic_label, *filters)
            .limit(2)
        )
        quotes = [text[:140] for text in session.execute(quotes_stmt).scalars().all()]
        spotlight.append(
            {
                "topic_label": row.topic_label,
                "change_vs_previous": 0.0,  # TODO: compare against prior window
                "sample_quotes": quotes,
            }
        )
    return spotlight


def _competitor_overview(
    session: Session,
    *,
    timeframe_start: datetime,
    timeframe_end: datetime,
    baseline_avg: float,
) -> List[Dict[str, Any]]:
    competitors = session.execute(select(Competitor)).scalars().all()
    snapshot: List[Dict[str, Any]] = []
    for competitor in competitors:
        filters = [
            Review.published_at >= timeframe_start,
            Review.published_at <= timeframe_end,
            Review.competitor_id == competitor.id,
        ]
        sentiment = _sentiment_summary(session, filters)
        delta = round(sentiment["average_score"] - baseline_avg, 2)
        highlight = (
            f"{sentiment['review_count']} reviews, average {sentiment['average_score']}"
            if sentiment["review_count"]
            else "No new reviews in this window."
        )
        snapshot.append(
            {
                "competitor_id": str(competitor.id),
                "name": competitor.name,
                "sentiment_delta": delta,
                "highlight": highlight,
            }
        )
    snapshot.sort(key=lambda item: item["sentiment_delta"], reverse=True)
    return snapshot
