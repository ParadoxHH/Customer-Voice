"""Lightweight analysis utilities (placeholders until LLM integration)."""

from __future__ import annotations

import math
import re
from collections import Counter
from typing import Dict, Iterable, List

SentimentResult = Dict[str, float | str]
TopicResult = Dict[str, float | str]

POSITIVE_TERMS = {
    "love",
    "great",
    "good",
    "amazing",
    "fast",
    "helpful",
    "useful",
    "polish",
    "improved",
    "excellent",
    "happy",
    "awesome",
}
NEGATIVE_TERMS = {
    "bad",
    "slow",
    "crash",
    "broken",
    "missing",
    "late",
    "confusing",
    "poor",
    "terrible",
    "hate",
    "bug",
    "issue",
    "problem",
    "wait",
}

TOPIC_KEYWORDS: Dict[str, Iterable[str]] = {
    "Dashboard UX": {"dashboard", "chart", "insight", "ui", "ux"},
    "Email Digests": {"digest", "email", "summary"},
    "Integrations": {"integration", "sync", "api", "hubspot", "export"},
    "Support Response": {"support", "response", "helpdesk"},
    "Mobile Experience": {"mobile", "phone", "ios", "android"},
    "Performance": {"slow", "fast", "load"},
}


def analyze_sentiment(text: str) -> SentimentResult:
    """Return a naive sentiment analysis result in OpenAPI format."""
    tokens = _tokenize(text)
    if not tokens:
        return {"label": "Neutral", "score": 0.0}

    pos_hits = sum(1 for token in tokens if token in POSITIVE_TERMS)
    neg_hits = sum(1 for token in tokens if token in NEGATIVE_TERMS)

    raw_score = (pos_hits - neg_hits) / max(len(tokens), 1)
    score = max(-1.0, min(1.0, round(raw_score, 2)))

    if score > 0.15:
        label = "Positive"
    elif score < -0.15:
        label = "Negative"
    else:
        label = "Neutral"

    return {"label": label, "score": score}


def extract_topics(text: str) -> List[TopicResult]:
    """Produce simple keyword-based topics with pseudo confidence scores."""
    tokens = _tokenize(text)
    if not tokens:
        return [{"topic_label": "General Feedback", "topic_confidence": 0.5}]

    token_counts = Counter(tokens)
    matched_topics: List[TopicResult] = []

    for topic_label, keywords in TOPIC_KEYWORDS.items():
        hits = sum(token_counts.get(keyword, 0) for keyword in keywords)
        if hits:
            confidence = 0.5 + min(0.5, hits / (len(tokens)))
            matched_topics.append(
                {
                    "topic_label": topic_label,
                    "topic_confidence": round(confidence, 2),
                }
            )

    if not matched_topics:
        matched_topics.append({"topic_label": "General Feedback", "topic_confidence": 0.5})

    return matched_topics


def _tokenize(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z']+", text.lower())
