"""Insights aggregation endpoints."""

from __future__ import annotations

from datetime import date, datetime, time, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field, ValidationError, model_validator
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Review, ReviewTopic, Source, get_session

bp = Blueprint("insights", __name__)


class InsightsQueryModel(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    source_id: Optional[UUID] = None
    sentiment: Optional[str] = Field(default=None)

    @model_validator(mode="after")
    def validate_sentiment(cls, values):
        sentiment = values.sentiment
        if sentiment and sentiment not in {"Positive", "Neutral", "Negative"}:
            raise ValueError("sentiment must be Positive, Neutral, or Negative")
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


@bp.get("/insights")
def get_insights():
    """Return aggregated insights with pagination and filtering."""
    query_params = request.args.to_dict(flat=True)
    try:
        payload = InsightsQueryModel.model_validate(query_params)
    except ValidationError as exc:
        return _validation_error_response(exc)

    session = get_session()
    filters = []

    if payload.start_date:
        start_dt = datetime.combine(payload.start_date, time.min).replace(tzinfo=timezone.utc)
        filters.append(Review.published_at >= start_dt)
    if payload.end_date:
        end_dt = datetime.combine(payload.end_date, time.max).replace(tzinfo=timezone.utc)
        filters.append(Review.published_at <= end_dt)
    if payload.source_id:
        filters.append(Review.source_id == payload.source_id)
    if payload.sentiment:
        filters.append(Review.sentiment_label == payload.sentiment)

    base_query = session.query(Review).filter(*filters)
    total_items = base_query.count()
    page_size = payload.page_size
    current_page = payload.page
    offset = (current_page - 1) * page_size

    recent_reviews = (
        base_query.order_by(Review.published_at.desc()).offset(offset).limit(page_size).all()
    )

    sentiment_trend = _build_sentiment_trend(session, filters)
    topic_distribution = _build_topic_distribution(session, filters)
    source_breakdown = _build_source_breakdown(session, filters)
    recent_reviews_payload = [_serialize_review(review) for review in recent_reviews]

    pagination = {
        "page": current_page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": (total_items + page_size - 1) // page_size if page_size else 0,
    }

    response = {
        "pagination": pagination,
        "sentiment_trend": sentiment_trend,
        "topic_distribution": topic_distribution,
        "source_breakdown": source_breakdown,
        "recent_reviews": recent_reviews_payload,
    }
    return jsonify(response), 200


def _build_sentiment_trend(session: Session, filters):
    dialect = session.bind.dialect.name if session.bind else "postgresql"
    if dialect == "postgresql":
        date_bucket = func.date_trunc("day", Review.published_at)
    else:
        date_bucket = func.date(Review.published_at)

    stmt = (
        select(
            date_bucket.label("bucket"),
            Review.sentiment_label,
            func.count(Review.id).label("review_count"),
            func.avg(Review.sentiment_score).label("avg_score"),
        )
        .filter(*filters)
        .group_by("bucket", Review.sentiment_label)
        .order_by("bucket")
    )

    rows = session.execute(stmt).all()

    trend_map: Dict[str, Dict[str, Any]] = {}
    for row in rows:
        bucket_value = row.bucket
        if isinstance(bucket_value, datetime):
            bucket_str = bucket_value.date().isoformat()
        else:
            bucket_str = str(bucket_value)

        entry = trend_map.setdefault(
            bucket_str,
            {"date": bucket_str, "positive": 0, "neutral": 0, "negative": 0, "average_score": 0.0},
        )

        label = row.sentiment_label.lower()
        if label == "positive":
            entry["positive"] += row.review_count
        elif label == "neutral":
            entry["neutral"] += row.review_count
        elif label == "negative":
            entry["negative"] += row.review_count

        avg_score = float(row.avg_score) if isinstance(row.avg_score, (float, Decimal)) else 0.0
        entry.setdefault("_score_total", 0.0)
        entry.setdefault("_count_total", 0)
        entry["_score_total"] += avg_score * row.review_count
        entry["_count_total"] += row.review_count

    for entry in trend_map.values():
        total_count = entry.pop("_count_total", 0)
        total_score = entry.pop("_score_total", 0.0)
        entry["average_score"] = round(total_score / total_count, 2) if total_count else 0.0

    if not trend_map:
        return []

    return [trend_map[key] for key in sorted(trend_map.keys())]


def _build_topic_distribution(session: Session, filters):
    stmt = (
        select(
            ReviewTopic.topic_label,
            func.count(ReviewTopic.review_id).label("review_count"),
            func.avg(ReviewTopic.topic_confidence).label("avg_confidence"),
        )
        .join(Review, Review.id == ReviewTopic.review_id)
        .filter(*filters)
        .group_by(ReviewTopic.topic_label)
        .order_by(func.count(ReviewTopic.review_id).desc())
    )

    rows = session.execute(stmt).all()
    return [
        {
            "topic_label": row.topic_label,
            "review_count": row.review_count,
            "average_confidence": round(
                float(row.avg_confidence) if isinstance(row.avg_confidence, (float, Decimal)) else 0.0,
                2,
            ),
        }
        for row in rows
    ]


def _build_source_breakdown(session: Session, filters):
    stmt = (
        select(
            Source.id,
            Source.name,
            func.count(Review.id).label("review_count"),
            func.avg(Review.sentiment_score).label("avg_score"),
        )
        .join(Review, Review.source_id == Source.id)
        .filter(*filters)
        .group_by(Source.id, Source.name)
        .order_by(func.count(Review.id).desc())
    )

    rows = session.execute(stmt).all()
    return [
        {
            "source_id": str(row.id),
            "source_name": row.name,
            "review_count": row.review_count,
            "average_sentiment_score": round(
                float(row.avg_score) if isinstance(row.avg_score, (float, Decimal)) else 0.0,
                2,
            ),
        }
        for row in rows
    ]


def _serialize_review(review: Review):
    sentiment_score = float(review.sentiment_score) if isinstance(review.sentiment_score, Decimal) else review.sentiment_score

    topics_payload = [
        {
            "topic_label": topic.topic_label,
            "topic_confidence": float(topic.topic_confidence)
            if isinstance(topic.topic_confidence, Decimal)
            else topic.topic_confidence,
        }
        for topic in review.topics
    ]

    return {
        "review_id": str(review.id),
        "source_id": str(review.source_id),
        "source_review_id": review.source_review_id,
        "title": review.title or "",
        "body": review.body,
        "sentiment": {"label": review.sentiment_label, "score": float(round(sentiment_score, 2))},
        "topics": topics_payload,
        "rating": float(review.rating) if review.rating is not None else None,
        "published_at": review.published_at.isoformat(),
    }
