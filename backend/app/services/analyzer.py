"""HTML analyzer — extracts structured data, meta info, semantic elements."""

from __future__ import annotations

import logging

from bs4 import BeautifulSoup

from app.models.schemas import PageAnalysis
from app.utils.helpers import clean_text

logger = logging.getLogger("aeo.analyzer")


def _extract_meta_tags(soup: BeautifulSoup) -> dict[str, str]:
    meta = {}
    for tag in soup.find_all("meta"):
        name = tag.get("name") or tag.get("property") or ""
        content = tag.get("content", "")
        if name and content:
            meta[name.lower()] = content
    return meta


def _extract_headings(soup: BeautifulSoup) -> list[dict[str, str]]:
    headings = []
    for level in range(1, 7):
        for h in soup.find_all(f"h{level}"):
            text = clean_text(h.get_text())
            if text:
                headings.append({"level": f"h{level}", "text": text})
    return headings


def _extract_open_graph(meta_tags: dict[str, str]) -> dict[str, str]:
    og = {}
    for key, value in meta_tags.items():
        if key.startswith("og:"):
            og[key.replace("og:", "")] = value
    return og


def _extract_schema_org(soup: BeautifulSoup) -> list[dict]:
    """Extract JSON-LD structured data."""
    import json

    schemas = []
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "{}")
            if isinstance(data, list):
                schemas.extend(data)
            else:
                schemas.append(data)
        except (json.JSONDecodeError, TypeError):
            continue
    return schemas


def _count_semantic_elements(soup: BeautifulSoup) -> dict[str, int]:
    semantic_tags = [
        "header", "nav", "main", "article", "section",
        "aside", "footer", "figure", "figcaption", "details",
        "summary", "mark", "time",
    ]
    counts = {}
    for tag in semantic_tags:
        count = len(soup.find_all(tag))
        if count > 0:
            counts[tag] = count
    return counts


def _extract_links(soup: BeautifulSoup) -> list[str]:
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if not href.startswith(("#", "mailto:", "tel:", "javascript:")):
            links.append(href)
    return links[:50]  # cap at 50


def analyze_page(url: str, html: str) -> PageAnalysis:
    """Analyze a single HTML page and return structured analysis."""
    soup = BeautifulSoup(html, "lxml")

    title_tag = soup.find("title")
    title = clean_text(title_tag.get_text()) if title_tag else ""

    meta_tags = _extract_meta_tags(soup)
    description = meta_tags.get("description", "")

    body = soup.find("body")
    body_text = clean_text(body.get_text()) if body else ""
    word_count = len(body_text.split())

    return PageAnalysis(
        url=url,
        title=title,
        description=description,
        headings=_extract_headings(soup),
        schema_org=_extract_schema_org(soup),
        open_graph=_extract_open_graph(meta_tags),
        meta_tags=meta_tags,
        semantic_elements=_count_semantic_elements(soup),
        links=_extract_links(soup),
        word_count=word_count,
    )


def analyze_pages(crawl_results: list) -> list[PageAnalysis]:
    """Analyze a batch of crawled pages."""
    analyses = []
    for result in crawl_results:
        try:
            analysis = analyze_page(result.url, result.html)
            analyses.append(analysis)
        except Exception as e:
            logger.warning("Failed to analyze %s: %s", result.url, e)
    return analyses
