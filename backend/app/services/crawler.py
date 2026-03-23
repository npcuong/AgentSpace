"""Async website crawler — fetches pages and discovers internal links."""

from __future__ import annotations

import asyncio
import logging
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

from app.utils.helpers import is_same_domain, normalize_url, resolve_url

logger = logging.getLogger("aeo.crawler")

DEFAULT_HEADERS = {
    "User-Agent": "AEO-Platform/1.0 (+https://github.com/aeo-platform)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

MAX_PAGES = 20
MAX_DEPTH = 2
TIMEOUT = 15.0


class CrawlResult:
    def __init__(self, url: str, html: str, status_code: int, headers: dict):
        self.url = url
        self.html = html
        self.status_code = status_code
        self.headers = headers


async def fetch_page(client: httpx.AsyncClient, url: str) -> CrawlResult | None:
    try:
        resp = await client.get(url, headers=DEFAULT_HEADERS, timeout=TIMEOUT, follow_redirects=True)
        content_type = resp.headers.get("content-type", "")
        if "text/html" not in content_type and "application/xhtml" not in content_type:
            return None
        return CrawlResult(
            url=str(resp.url),
            html=resp.text,
            status_code=resp.status_code,
            headers=dict(resp.headers),
        )
    except Exception as e:
        logger.warning("Failed to fetch %s: %s", url, e)
        return None


def extract_links(html: str, base_url: str) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    links: set[str] = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue
        full_url = resolve_url(base_url, href)
        full_url = normalize_url(full_url)
        if is_same_domain(base_url, full_url):
            links.add(full_url)
    return list(links)


async def check_special_files(client: httpx.AsyncClient, base_url: str) -> dict[str, bool]:
    parsed = urlparse(base_url)
    root = f"{parsed.scheme}://{parsed.netloc}"
    results = {}
    for filename in ("robots.txt", "sitemap.xml", "llms.txt", "agents.txt"):
        try:
            resp = await client.head(f"{root}/{filename}", timeout=5.0)
            results[filename] = resp.status_code == 200
        except Exception:
            results[filename] = False
    return results


async def crawl(url: str, on_progress=None) -> tuple[list[CrawlResult], dict[str, bool]]:
    """Crawl a website starting from `url`. Returns list of CrawlResult + special file checks."""
    url = normalize_url(url)
    visited: set[str] = set()
    results: list[CrawlResult] = []
    queue: list[tuple[str, int]] = [(url, 0)]

    async with httpx.AsyncClient() as client:
        special_files = await check_special_files(client, url)

        while queue and len(results) < MAX_PAGES:
            current_url, depth = queue.pop(0)
            normalized = normalize_url(current_url)

            if normalized in visited:
                continue
            visited.add(normalized)

            result = await fetch_page(client, current_url)
            if result is None:
                continue

            results.append(result)
            logger.info("Crawled [%d/%d]: %s", len(results), MAX_PAGES, current_url)

            if on_progress:
                on_progress(len(results), MAX_PAGES)

            if depth < MAX_DEPTH:
                new_links = extract_links(result.html, current_url)
                for link in new_links:
                    if normalize_url(link) not in visited:
                        queue.append((link, depth + 1))

            await asyncio.sleep(0.2)  # polite delay

    return results, special_files
