"""AEO Score calculator — rates website agent-readiness on a 0-100 scale."""

from __future__ import annotations

from app.models.schemas import AEOScore, PageAnalysis, ScoreBreakdown


def _score_structured_data(pages: list[PageAnalysis]) -> int:
    """Score based on Schema.org / JSON-LD coverage."""
    if not pages:
        return 0

    pages_with_schema = sum(1 for p in pages if p.schema_org)
    coverage = pages_with_schema / len(pages)

    total_schemas = sum(len(p.schema_org) for p in pages)
    variety_bonus = min(total_schemas * 5, 30)

    return min(int(coverage * 70 + variety_bonus), 100)


def _score_semantic_html(pages: list[PageAnalysis]) -> int:
    """Score based on semantic HTML element usage."""
    if not pages:
        return 0

    important_elements = {"header", "nav", "main", "article", "section", "footer"}
    total_score = 0

    for page in pages:
        found = set(page.semantic_elements.keys()) & important_elements
        page_score = (len(found) / len(important_elements)) * 100
        total_score += page_score

    return min(int(total_score / len(pages)), 100)


def _score_meta_quality(pages: list[PageAnalysis]) -> int:
    """Score based on meta tag completeness."""
    if not pages:
        return 0

    total_score = 0
    for page in pages:
        score = 0
        if page.title:
            score += 25
        if page.description:
            score += 25
        if page.open_graph:
            score += 20
        if page.meta_tags.get("viewport"):
            score += 10
        if page.meta_tags.get("robots"):
            score += 10
        if page.meta_tags.get("canonical") or page.meta_tags.get("og:url"):
            score += 10
        total_score += score

    return min(int(total_score / len(pages)), 100)


def _score_agent_readiness(pages: list[PageAnalysis], special_files: dict[str, bool] | None = None) -> int:
    """Score based on agent-specific features."""
    special = special_files or {}
    score = 0

    # robots.txt
    if special.get("robots.txt"):
        score += 15

    # sitemap.xml
    if special.get("sitemap.xml"):
        score += 20

    # llms.txt
    if special.get("llms.txt"):
        score += 30

    # agents.txt
    if special.get("agents.txt"):
        score += 25

    # API endpoints detected
    api_patterns = ["/api/", "/v1/", "/v2/", "/graphql"]
    has_api = any(
        any(pattern in link.lower() for pattern in api_patterns)
        for page in pages
        for link in page.links
    )
    if has_api:
        score += 10

    return min(score, 100)


def _grade(total: int) -> str:
    if total >= 90:
        return "A+"
    elif total >= 80:
        return "A"
    elif total >= 70:
        return "B"
    elif total >= 60:
        return "C"
    elif total >= 40:
        return "D"
    return "F"


def _generate_recommendations(breakdown: ScoreBreakdown, special_files: dict[str, bool] | None = None) -> list[str]:
    recs: list[str] = []
    special = special_files or {}

    if breakdown.structured_data < 50:
        recs.append("Add Schema.org JSON-LD markup to your pages (Organization, WebSite, BreadcrumbList)")
    if breakdown.semantic_html < 50:
        recs.append("Use semantic HTML5 elements (<header>, <main>, <nav>, <article>, <footer>)")
    if breakdown.meta_quality < 60:
        recs.append("Add missing meta tags: description, Open Graph tags (og:title, og:description, og:image)")
    if not special.get("llms.txt"):
        recs.append("Create an llms.txt file in your site root to help AI models understand your content")
    if not special.get("agents.txt"):
        recs.append("Create an agents.txt file to declare what AI agents can do on your site")
    if not special.get("sitemap.xml"):
        recs.append("Add a sitemap.xml to improve discoverability by both search engines and AI agents")
    if not special.get("robots.txt"):
        recs.append("Add a robots.txt file with crawling directives")
    if breakdown.agent_readiness < 30:
        recs.append("Consider exposing a public API or structured data endpoints for agent consumption")

    return recs


def calculate_score(pages: list[PageAnalysis], special_files: dict[str, bool] | None = None) -> AEOScore:
    """Calculate comprehensive AEO score."""
    breakdown = ScoreBreakdown(
        structured_data=_score_structured_data(pages),
        semantic_html=_score_semantic_html(pages),
        meta_quality=_score_meta_quality(pages),
        agent_readiness=_score_agent_readiness(pages, special_files),
    )

    weights = {
        "structured_data": 0.30,
        "semantic_html": 0.20,
        "meta_quality": 0.20,
        "agent_readiness": 0.30,
    }

    total = int(
        breakdown.structured_data * weights["structured_data"]
        + breakdown.semantic_html * weights["semantic_html"]
        + breakdown.meta_quality * weights["meta_quality"]
        + breakdown.agent_readiness * weights["agent_readiness"]
    )

    recommendations = _generate_recommendations(breakdown, special_files)

    return AEOScore(
        total=total,
        grade=_grade(total),
        breakdown=breakdown,
        recommendations=recommendations,
    )
