"""Pydantic models for the AEO Platform API."""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, HttpUrl


class ScanRequest(BaseModel):
    url: HttpUrl = Field(..., description="URL to scan for AEO analysis")


class ScanStage(str, Enum):
    QUEUED = "queued"
    CRAWLING = "crawling"
    ANALYZING = "analyzing"
    GENERATING = "generating"
    SCORING = "scoring"
    COMPLETED = "completed"
    FAILED = "failed"


class ScanStatus(BaseModel):
    scan_id: str
    status: ScanStage
    progress: int = Field(0, ge=0, le=100)
    stage_detail: str = ""
    pages_crawled: int = 0
    total_pages: int = 0
    error: str | None = None


class PageAnalysis(BaseModel):
    url: str
    title: str = ""
    description: str = ""
    headings: list[dict[str, str]] = Field(default_factory=list)
    schema_org: list[dict] = Field(default_factory=list)
    open_graph: dict[str, str] = Field(default_factory=dict)
    meta_tags: dict[str, str] = Field(default_factory=dict)
    semantic_elements: dict[str, int] = Field(default_factory=dict)
    links: list[str] = Field(default_factory=list)
    word_count: int = 0
    has_robots_txt: bool = False
    has_sitemap: bool = False


class ScoreBreakdown(BaseModel):
    structured_data: int = Field(0, ge=0, le=100, description="Schema.org & JSON-LD coverage")
    semantic_html: int = Field(0, ge=0, le=100, description="Semantic element usage")
    meta_quality: int = Field(0, ge=0, le=100, description="Meta tags completeness")
    agent_readiness: int = Field(0, ge=0, le=100, description="API endpoints, llms.txt presence")


class AEOScore(BaseModel):
    total: int = Field(0, ge=0, le=100)
    grade: str = "F"
    breakdown: ScoreBreakdown = Field(default_factory=ScoreBreakdown)
    recommendations: list[str] = Field(default_factory=list)


class ScanResult(BaseModel):
    scan_id: str
    url: str
    scanned_at: datetime = Field(default_factory=datetime.utcnow)
    pages_analyzed: int = 0
    llms_txt: str = ""
    agents_txt: str = ""
    score: AEOScore = Field(default_factory=AEOScore)
    pages: list[PageAnalysis] = Field(default_factory=list)


class ScanResponse(BaseModel):
    scan_id: str
    status: ScanStage
    message: str = "Scan queued"


def new_scan_id() -> str:
    return uuid.uuid4().hex[:12]
