"""CLI helper to generate and print digest payloads."""

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timedelta, timezone

from ..models import init_engine, session_scope
from ..routes.digest import assemble_digest


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate digest JSON from Neon data.")
    parser.add_argument(
        "--start",
        help="ISO timestamp or date for the timeframe start (default: 7 days ago).",
    )
    parser.add_argument(
        "--end",
        help="ISO timestamp or date for the timeframe end (default: now).",
    )
    parser.add_argument(
        "--no-competitors",
        action="store_true",
        help="Exclude competitor summary from the digest.",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print the resulting JSON.",
    )
    return parser.parse_args()


def parse_timestamp(value: str) -> datetime:
    if value.endswith("Z"):
        value = value.replace("Z", "+00:00")
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def main() -> None:
    args = parse_args()
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise SystemExit("DATABASE_URL must be set to run the digest script.")

    init_engine(database_url)

    now = datetime.now(timezone.utc)
    timeframe_end = parse_timestamp(args.end) if args.end else now
    timeframe_start = (
        parse_timestamp(args.start)
        if args.start
        else timeframe_end - timedelta(days=7)
    )

    with session_scope() as session:
        digest = assemble_digest(
            session,
            timeframe_start=timeframe_start,
            timeframe_end=timeframe_end,
            include_competitors=not args.no_competitors,
        )

    indent = 2 if args.pretty else None
    print(json.dumps(digest, indent=indent, sort_keys=bool(args.pretty)))


if __name__ == "__main__":
    main()
