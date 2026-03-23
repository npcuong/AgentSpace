"""Utility helpers for URL validation and text processing."""

from __future__ import annotations

import re
from urllib.parse import urljoin, urlparse


def is_valid_url(url: str) -> bool:
    try:
        result = urlparse(url)
        return all([result.scheme in ("http", "https"), result.netloc])
    except Exception:
        return False


def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    scheme = parsed.scheme or "https"
    netloc = parsed.netloc.lower().rstrip(".")
    path = parsed.path.rstrip("/") or "/"
    return f"{scheme}://{netloc}{path}"


def is_same_domain(base_url: str, target_url: str) -> bool:
    base = urlparse(base_url)
    target = urlparse(target_url)
    return base.netloc.lower() == target.netloc.lower()


def resolve_url(base_url: str, relative_url: str) -> str:
    return urljoin(base_url, relative_url)


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def truncate(text: str, max_len: int = 200) -> str:
    if len(text) <= max_len:
        return text
    return text[: max_len - 3].rsplit(" ", 1)[0] + "..."


def get_domain(url: str) -> str:
    return urlparse(url).netloc
