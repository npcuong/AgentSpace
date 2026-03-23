"""Scan router — API endpoints for website AEO scanning."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.models.schemas import (
    PageAnalysis,
    ScanRequest,
    ScanResponse,
    ScanResult,
    ScanStage,
    ScanStatus,
    new_scan_id,
)
from app.services.analyzer import analyze_pages
from app.services.crawler import crawl
from app.services.llms_generator import generate_llms_txt
from app.services.agents_generator import generate_agents_txt
from app.services.scorer import calculate_score

logger = logging.getLogger("aeo.scan")

router = APIRouter(prefix="/api", tags=["scan"])

# In-memory scan storage (MVP — no DB)
_scans: dict[str, ScanStatus] = {}
_results: dict[str, ScanResult] = {}


def _update_status(scan_id: str, stage: ScanStage, progress: int, detail: str = "",
                   pages_crawled: int = 0, total_pages: int = 0):
    _scans[scan_id] = ScanStatus(
        scan_id=scan_id,
        status=stage,
        progress=progress,
        stage_detail=detail,
        pages_crawled=pages_crawled,
        total_pages=total_pages,
    )


async def _run_scan(scan_id: str, url: str):
    """Background task: crawl, analyze, generate files, score."""
    try:
        # Stage 1: Crawl
        _update_status(scan_id, ScanStage.CRAWLING, 10, "Discovering pages...")

        def on_crawl_progress(current: int, total: int):
            progress = 10 + int((current / max(total, 1)) * 30)
            _update_status(scan_id, ScanStage.CRAWLING, progress,
                           f"Crawling page {current}/{total}",
                           pages_crawled=current, total_pages=total)

        crawl_results, special_files = await crawl(url, on_progress=on_crawl_progress)

        if not crawl_results:
            _scans[scan_id] = ScanStatus(
                scan_id=scan_id,
                status=ScanStage.FAILED,
                progress=0,
                error="Could not crawl any pages from the provided URL",
            )
            return

        # Stage 2: Analyze
        _update_status(scan_id, ScanStage.ANALYZING, 45, "Analyzing HTML structure...")
        pages: list[PageAnalysis] = analyze_pages(crawl_results)

        # Update special file info on home page
        if pages:
            pages[0].has_robots_txt = special_files.get("robots.txt", False)
            pages[0].has_sitemap = special_files.get("sitemap.xml", False)

        _update_status(scan_id, ScanStage.ANALYZING, 60, f"Analyzed {len(pages)} pages")

        # Stage 3: Generate files
        _update_status(scan_id, ScanStage.GENERATING, 70, "Generating llms.txt...")
        llms_txt = generate_llms_txt(pages, url)

        _update_status(scan_id, ScanStage.GENERATING, 80, "Generating agents.txt...")
        agents_txt = generate_agents_txt(pages, url, special_files)

        # Stage 4: Score
        _update_status(scan_id, ScanStage.SCORING, 90, "Calculating AEO score...")
        score = calculate_score(pages, special_files)

        # Done
        _results[scan_id] = ScanResult(
            scan_id=scan_id,
            url=url,
            scanned_at=datetime.utcnow(),
            pages_analyzed=len(pages),
            llms_txt=llms_txt,
            agents_txt=agents_txt,
            score=score,
            pages=pages,
        )
        _update_status(scan_id, ScanStage.COMPLETED, 100, "Scan complete!")
        logger.info("Scan %s completed — %d pages, score %d", scan_id, len(pages), score.total)

    except Exception as e:
        logger.exception("Scan %s failed: %s", scan_id, e)
        _scans[scan_id] = ScanStatus(
            scan_id=scan_id,
            status=ScanStage.FAILED,
            progress=0,
            error=str(e),
        )


# Simple in-memory rate limiting
_rate_limit: dict[str, list[float]] = {}
RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW = 60.0


def _check_rate_limit(client_ip: str) -> bool:
    import time
    now = time.time()
    if client_ip not in _rate_limit:
        _rate_limit[client_ip] = []
    _rate_limit[client_ip] = [t for t in _rate_limit[client_ip] if now - t < RATE_LIMIT_WINDOW]
    if len(_rate_limit[client_ip]) >= RATE_LIMIT_MAX:
        return False
    _rate_limit[client_ip].append(now)
    return True


@router.post("/scan", response_model=ScanResponse)
async def start_scan(req: ScanRequest, background_tasks: BackgroundTasks):
    """Start a new AEO scan for the given URL."""
    scan_id = new_scan_id()
    url = str(req.url).rstrip("/")

    _update_status(scan_id, ScanStage.QUEUED, 0, "Queued for scanning")

    background_tasks.add_task(_run_scan, scan_id, url)

    return ScanResponse(
        scan_id=scan_id,
        status=ScanStage.QUEUED,
        message=f"Scan queued for {url}",
    )


@router.get("/scan/{scan_id}/status", response_model=ScanStatus)
async def get_scan_status(scan_id: str):
    """Get current scan status and progress."""
    if scan_id not in _scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    return _scans[scan_id]


@router.get("/scan/{scan_id}/results", response_model=ScanResult)
async def get_scan_results(scan_id: str):
    """Get completed scan results."""
    if scan_id not in _scans:
        raise HTTPException(status_code=404, detail="Scan not found")

    status = _scans[scan_id]
    if status.status == ScanStage.FAILED:
        raise HTTPException(status_code=500, detail=status.error or "Scan failed")
    if status.status != ScanStage.COMPLETED:
        raise HTTPException(status_code=202, detail="Scan still in progress")

    if scan_id not in _results:
        raise HTTPException(status_code=500, detail="Results not available")

    return _results[scan_id]
