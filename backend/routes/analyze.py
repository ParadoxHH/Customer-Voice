"""On-demand analysis endpoints."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from flask import Blueprint, jsonify, request
from pydantic import BaseModel, Field, ValidationError

from ..analysis import analyze_sentiment, extract_topics

bp = Blueprint("analyze", __name__)


class AnalyzeRequestModel(BaseModel):
    text: str = Field(min_length=1)
    language: Optional[str] = None


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


@bp.post("/analyze")
def analyze_text():
    """Return quick sentiment and topic analysis for the provided text."""
    payload_raw = request.get_json(silent=True) or {}
    try:
        payload = AnalyzeRequestModel.model_validate(payload_raw)
    except ValidationError as exc:
        return _validation_error_response(exc)

    sentiment = analyze_sentiment(payload.text)
    topics = extract_topics(payload.text)

    response = {
        "sentiment": sentiment,
        "topics": topics,
    }
    return jsonify(response), 200
