"""Competitor management and comparison endpoints."""

from __future__ import annotations

from datetime import date, datetime, time, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field, ValidationError
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models import (
    Review,
    ReviewTopic,
    Competitor,
    get_session,
)

bp = Blueprint("competitors", __name__, url_prefix="/competitors")


class CompetitorCreateModel(BaseModel):
    name: str = Field(min_length=1)
    url: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None


class CompetitorUpdateModel(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None


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


@bp.get("")
def list_competitors():
    """Return paginated competitors."""
    page = max(int(request.args.get("page", 1)), 1)
    page_size = max(min(int(request.args.get("page_size", 25)), 100), 1)

    session = get_session()
    query = session.query(Competitor).order_by(Competitor.created_at.desc())
    total_items = query.count()
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    response = {
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": (total_items + page_size - 1) // page_size if page_size else 0,
        },
        "items": [_serialize_competitor(item) for item in items],
    }
    return jsonify(response), 200


@bp.post("")
def create_competitor():
    """Create a new competitor record."""
    payload_raw = request.get_json(silent=True) or {}
    try:
        payload = CompetitorCreateModel.model_validate(payload_raw)
    except ValidationError as exc:
        return _validation_error_response(exc)

    session = get_session()
    competitor = Competitor(
        name=payload.name,
        url=payload.url,
        description=payload.description,
        tags=payload.tags or [],
    )
    session.add(competitor)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        return (
            jsonify(
                {
                    "error": "conflict",
                    "message": "Competitor with this name already exists.",
                    "details": [{"field": "name", "issue": "must be unique"}],
                }
            ),
            409,
        )

    return jsonify(_serialize_competitor(competitor)), 201


@bp.get("/<uuid:competitor_id>")
def get_competitor(competitor_id: UUID):
    session = get_session()
    competitor = session.get(Competitor, competitor_id)
    if not competitor:
        return _not_found()
    return jsonify(_serialize_competitor(competitor)), 200


@bp.patch("/<uuid:competitor_id>")
def update_competitor(competitor_id: UUID):
    payload_raw = request.get_json(silent=True) or {}
    try:
        payload = CompetitorUpdateModel.model_validate(payload_raw)
    except ValidationError as exc:
        return _validation_error_response(exc)

    session = get_session()
    competitor = session.get(Competitor, competitor_id)
    if not competitor:
        return _not_found()

    if payload.name is not None:
        competitor.name = payload.name
    if payload.url is not None:
        competitor.url = payload.url
    if payload.description is not None:
        competitor.description = payload.description
    if payload.tags is not None:
        competitor.tags = payload.tags

    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        return (
            jsonify(
                {
                    "error": "conflict",
                    "message": "Competitor with this name already exists.",
                    "details": [{"field": "name", "issue": "must be unique"}],
                }
            ),
            409,
        )

    session.refresh(competitor)
    return jsonify(_serialize_competitor(competitor)), 200


@bp.delete("/<uuid:competitor_id>")
def delete_competitor(competitor_id: UUID):
    session = get_session()
    competitor = session.get(Competitor, competitor_id)
    if not competitor:
        return _not_found()
    session.delete(competitor)
    session.commit()
    return ("", 204)


@bp.get("/<uuid:competitor_id>/comparison")
def compare_competitor(competitor_id: UUID):
    """Compare competitor metrics against our product."""
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    filters = []

    if start_date:
        start_dt = datetime.combine(date.fromisoformat(start_date), time.min).replace(
            tzinfo=timezone.utc
        )
        filters.append(Review.published_at >= start_dt)
    if end_date:
        end_dt = datetime.combine(date.fromisoformat(end_date), time.max).replace(
            tzinfo=timezone.utc
        )
        filters.append(Review.published_at <= end_dt)

    session = get_session()
    competitor = session.get(Competitor, competitor_id)
    if not competitor:
        return _not_found()

    self_filters = list(filters) + [Review.competitor_id.is_(None)]
    competitor_filters = list(filters) + [Review.competitor_id == competitor_id]

    self_sentiment = _compute_sentiment_summary(session, self_filters)
    competitor_sentiment = _compute_sentiment_summary(session, competitor_filters)
    top_topics = _compute_topic_comparison(session, self_filters, competitor_filters)

    response = {
        "competitor": _serialize_competitor(competitor),
        "self_sentiment": self_sentiment,
        "competitor_sentiment": competitor_sentiment,
        "top_topics": top_topics,
    }
    return jsonify(response), 200


def _serialize_competitor(competitor: Competitor) -> Dict[str, Any]:
    return {
        "competitor_id": str(competitor.id),
        "name": competitor.name,
        "url": competitor.url,
        "description": competitor.description,
        "tags": competitor.tags or [],
        "created_at": competitor.created_at.isoformat(),
        "updated_at": competitor.updated_at.isoformat(),
    }


def _not_found():
    return (
        jsonify(
            {
                "error": "not_found",
                "message": "Competitor not found.",
                "details": [],
            }
        ),
        404,
    )


def _compute_sentiment_summary(session: Session, filters) -> Dict[str, Any]:
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

    total_score = 0.0
    for row in rows:
        count = row.count or 0
        avg_score = float(row.avg_score) if isinstance(row.avg_score, (float, Decimal)) else 0.0
        label = row.sentiment_label.lower()
        if label in summary:
            summary[label] = count
        total_score += avg_score * count
        summary["review_count"] += count

    if summary["review_count"]:
        summary["average_score"] = round(total_score / summary["review_count"], 2)

    return summary


def _compute_topic_comparison(
    session: Session, self_filters, competitor_filters, limit: int = 5
) -> List[Dict[str, Any]]:
    self_topics = _topic_shares(session, self_filters)
    competitor_topics = _topic_shares(session, competitor_filters)

    topic_labels = set(self_topics) | set(competitor_topics)
    comparisons = []
    for label in topic_labels:
        self_share = self_topics.get(label, 0.0)
        competitor_share = competitor_topics.get(label, 0.0)
        delta = round(competitor_share - self_share, 4)
        comparisons.append(
            {
                "topic_label": label,
                "self_share": round(self_share, 4),
                "competitor_share": round(competitor_share, 4),
                "delta": delta,
            }
        )

    comparisons.sort(key=lambda item: abs(item["delta"]), reverse=True)
    return comparisons[:limit]


def _topic_shares(session: Session, filters) -> Dict[str, float]:
    stmt = (
        select(
            ReviewTopic.topic_label,
            func.count(ReviewTopic.review_id).label("count"),
        )
        .join(Review, Review.id == ReviewTopic.review_id)
        .filter(*filters)
        .group_by(ReviewTopic.topic_label)
    )
    rows = session.execute(stmt).all()
    totals = {row.topic_label: row.count for row in rows}
    total_reviews = sum(totals.values())
    if not total_reviews:
        return {}
    return {label: count / total_reviews for label, count in totals.items()}
