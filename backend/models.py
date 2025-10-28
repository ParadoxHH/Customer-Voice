"""SQLAlchemy models and session management for the Customer Voice Dashboard."""

from __future__ import annotations

import contextlib
import logging
import os
import uuid
from datetime import datetime
from typing import Generator, Iterable, Optional

from alembic import command
from alembic.config import Config
from sqlalchemy import (
    ARRAY,
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Index,
    JSON,
    Numeric,
    PrimaryKeyConstraint,
    String,
    UniqueConstraint,
    create_engine,
    func,
    select,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
    scoped_session,
    sessionmaker,
)
from sqlalchemy.types import CHAR, TypeDecorator

logger = logging.getLogger(__name__)


class GUID(TypeDecorator):
    """Platform-independent GUID/UUID type.

    Uses PostgreSQL's UUID type when available, otherwise stores as CHAR(36).
    """

    cache_ok = True
    impl = CHAR

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import UUID

            return dialect.type_descriptor(UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(uuid.UUID(str(value)))

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return uuid.UUID(str(value))


Base = declarative_base()

engine = None
SessionLocal: Optional[scoped_session] = None


def init_engine(database_url: str, **kwargs):
    """Initialise SQLAlchemy engine and scoped session factory."""
    global engine, SessionLocal
    if engine and str(engine.url) == database_url:
        return engine
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        future=True,
        **kwargs,
    )
    SessionLocal = scoped_session(
        sessionmaker(bind=engine, autoflush=False, expire_on_commit=False, future=True)
    )
    return engine


def init_app(app) -> None:
    """Attach SQLAlchemy session lifecycle hooks to a Flask app."""
    database_url = app.config.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL missing from app config.")

    init_engine(database_url)

    @app.teardown_appcontext
    def cleanup_session(exception=None):  # pragma: no cover - flask teardown
        if SessionLocal:
            SessionLocal.remove()


def get_session():
    """Return the current scoped session."""
    if not SessionLocal:
        raise RuntimeError("SessionLocal is not initialised. Call init_engine first.")
    return SessionLocal()


@contextlib.contextmanager
def session_scope() -> Generator:
    """Provide a transactional scope for database operations."""
    session = get_session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


# --- Models ----------------------------------------------------------------- #


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    display_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    role: Mapped[str] = mapped_column(String, nullable=False, default="analyst")
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    reviews: Mapped[Iterable["Review"]] = relationship("Review", back_populates="user")


class Source(Base):
    __tablename__ = "sources"
    __table_args__ = (
        UniqueConstraint("platform", "external_id", name="uq_sources_platform_external"),
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    platform: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    external_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    reviews: Mapped[Iterable["Review"]] = relationship("Review", back_populates="source")


class Competitor(Base):
    __tablename__ = "competitors"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    tags: Mapped[Optional[list[str]]] = mapped_column(
        ARRAY(String).with_variant(JSON, "sqlite"), default=list
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    reviews: Mapped[Iterable["Review"]] = relationship("Review", back_populates="competitor")


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("source_id", "source_review_id", name="uq_reviews_source_review"),
        CheckConstraint(
            "sentiment_label IN ('Positive', 'Neutral', 'Negative')",
            name="ck_reviews_sentiment_label",
        ),
        Index("idx_reviews_source", "source_id"),
        Index("idx_reviews_created_at", "created_at"),
        Index("idx_reviews_sentiment_label", "sentiment_label"),
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    source_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    competitor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(), ForeignKey("competitors.id", ondelete="SET NULL"), nullable=True
    )
    source_review_id: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    body: Mapped[str] = mapped_column(String, nullable=False)
    rating: Mapped[Optional[float]] = mapped_column(Numeric(2, 1), nullable=True)
    language: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sentiment_label: Mapped[str] = mapped_column(String, nullable=False)
    sentiment_score: Mapped[float] = mapped_column(Numeric(3, 2), nullable=False)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    source: Mapped["Source"] = relationship("Source", back_populates="reviews")
    user: Mapped[Optional["User"]] = relationship("User", back_populates="reviews")
    competitor: Mapped[Optional["Competitor"]] = relationship("Competitor", back_populates="reviews")
    topics: Mapped[list["ReviewTopic"]] = relationship(
        "ReviewTopic",
        back_populates="review",
        cascade="all, delete-orphan",
    )


class Topic(Base):
    __tablename__ = "topics"
    __table_args__ = (
        UniqueConstraint("topic_label", name="uq_topics_label"),
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    topic_label: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    review_topics: Mapped[list["ReviewTopic"]] = relationship("ReviewTopic", back_populates="topic")


class ReviewTopic(Base):
    __tablename__ = "review_topics"
    __table_args__ = (
        PrimaryKeyConstraint("review_id", "topic_id", name="pk_review_topic"),
        UniqueConstraint("review_id", "topic_label", name="uq_review_topic_label"),
        Index("idx_review_topics_topic_label", "topic_label"),
        Index("idx_review_topics_pair", "review_id", "topic_label"),
    )

    review_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False
    )
    topic_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False
    )
    topic_label: Mapped[str] = mapped_column(String, nullable=False)
    topic_confidence: Mapped[float] = mapped_column(Numeric(4, 3), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    review: Mapped["Review"] = relationship("Review", back_populates="topics")
    topic: Mapped["Topic"] = relationship("Topic", back_populates="review_topics")


class Digest(Base):
    __tablename__ = "digests"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    timeframe_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    timeframe_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    summary: Mapped[dict] = mapped_column(
        JSONB().with_variant(JSON, "sqlite"), nullable=False
    )
    sentiment_snapshot: Mapped[dict] = mapped_column(
        JSONB().with_variant(JSON, "sqlite"), nullable=False
    )
    topics_snapshot: Mapped[dict] = mapped_column(
        JSONB().with_variant(JSON, "sqlite"), nullable=False
    )
    competitor_snapshot: Mapped[Optional[dict]] = mapped_column(
        JSONB().with_variant(JSON, "sqlite"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


# --- Alembic helpers -------------------------------------------------------- #


def make_alembic_config(
    database_url: Optional[str] = None, script_location: str = "backend/migrations"
) -> Config:
    """Create a lightweight Alembic Config for running migrations programmatically."""
    cfg = Config()
    cfg.set_main_option("script_location", script_location)
    cfg.set_main_option(
        "sqlalchemy.url", database_url or os.environ.get("DATABASE_URL", "")
    )
    return cfg


def run_migrations(database_url: Optional[str] = None) -> None:
    """Run Alembic migrations in online mode using current metadata."""
    cfg = make_alembic_config(database_url)
    command.upgrade(cfg, "head")


def get_metadata():
    """Expose metadata for Alembic env.py."""
    return Base.metadata


# --- Utility aggregation helpers ------------------------------------------- #


def upsert_topic(session, label: str) -> "Topic":
    """Fetch an existing topic by label or create a new one."""
    stmt = select(Topic).where(Topic.topic_label == label)
    topic = session.execute(stmt).scalar_one_or_none()
    if topic:
        return topic
    topic = Topic(topic_label=label)
    session.add(topic)
    session.flush()
    return topic
