# AEO Platform — Agent Engine Optimization Tool

## Goal

Build a **free, open-source** tool that takes a URL as input and generates `llms.txt`, `agents.txt`, and a structured data report — helping agencies/freelancers make any website agent-ready.

## Project Type: WEB (Full-Stack)

## Success Criteria

- [ ] User inputs a URL → system crawls & analyzes the website
- [ ] Generates `llms.txt` file (AI-readable site summary)
- [ ] Generates `agents.txt` file (agent permissions & capabilities)
- [ ] Generates structured data report (Schema.org coverage, missing markup, AEO score)
- [ ] Clean, modern UI with real-time scan progress
- [ ] Deployable as open-source on GitHub

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 15 (App Router) | SSR, great DX, React ecosystem |
| **Backend API** | Python FastAPI | Async crawling, fast parsing, rich scraping ecosystem |
| **Crawling** | `httpx` + `BeautifulSoup4` + `lxml` | Async HTTP + robust HTML parsing |
| **Structured Data** | `extruct` (Python) | Extracts JSON-LD, Microdata, RDFa, OpenGraph |
| **Styling** | Tailwind CSS v4 | Rapid prototyping, utility-first |
| **Deployment** | Vercel (frontend) + Railway/Render (API) | Free tiers for open-source |
| **Monorepo** | Turborepo or simple folder split | `frontend/` + `backend/` |

## File Structure

```
aeo-platform/
├── frontend/                    # Next.js 15
│   ├── app/
│   │   ├── layout.tsx          # Root layout + fonts
│   │   ├── page.tsx            # Landing + URL input
│   │   └── results/
│   │       └── page.tsx        # Scan results dashboard
│   ├── components/
│   │   ├── ScanForm.tsx        # URL input + scan trigger
│   │   ├── ScanProgress.tsx    # Real-time progress indicator
│   │   ├── ResultsPanel.tsx    # Tabbed results view
│   │   ├── FilePreview.tsx     # llms.txt / agents.txt preview + download
│   │   ├── ScoreCard.tsx       # AEO score visualization
│   │   └── Header.tsx          # Nav + branding
│   ├── lib/
│   │   └── api.ts              # API client helpers
│   ├── public/
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                     # Python FastAPI
│   ├── app/
│   │   ├── main.py             # FastAPI app + CORS
│   │   ├── routers/
│   │   │   └── scan.py         # POST /scan, GET /scan/{id}/status
│   │   ├── services/
│   │   │   ├── crawler.py      # Async website crawler (httpx)
│   │   │   ├── analyzer.py     # HTML analysis + structured data extraction
│   │   │   ├── llms_generator.py    # Generate llms.txt content
│   │   │   ├── agents_generator.py  # Generate agents.txt content
│   │   │   └── scorer.py       # Calculate AEO score
│   │   ├── models/
│   │   │   └── schemas.py      # Pydantic models
│   │   └── utils/
│   │       └── helpers.py      # URL validation, text processing
│   ├── requirements.txt
│   └── Dockerfile
│
├── docs/
│   ├── Architecture.md         # System architecture
│   ├── Features.md             # Feature list
│   └── Checklist.md            # Dev checklist
│
├── logs/                        # Runtime logs
│   └── .gitkeep
│
├── README.md                    # Project overview + setup
├── LICENSE                      # MIT
└── .gitignore
```

## Task Breakdown

### Phase 1: Foundation (Backend Core)
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `python-patterns`

- [ ] **T1:** Init FastAPI project in `backend/` with `main.py`, CORS config, health endpoint
  - INPUT: Empty `backend/` folder
  - OUTPUT: `uvicorn app.main:app` starts on port 8000, `GET /health` returns 200
  - VERIFY: `curl http://localhost:8000/health` → `{"status": "ok"}`

- [ ] **T2:** Create Pydantic models in `schemas.py` — `ScanRequest(url)`, `ScanResponse`, `ScanStatus`, `AEOReport`
  - INPUT: Feature requirements
  - OUTPUT: Type-safe request/response models
  - VERIFY: Import models in Python REPL without errors

- [ ] **T3:** Build async crawler service (`crawler.py`) — fetch URL + discover internal pages (max 20 pages, depth 2)
  - INPUT: URL string
  - OUTPUT: List of `{url, html, status_code, headers}` dicts
  - VERIFY: `python -c "from app.services.crawler import crawl; ..."` returns pages

- [ ] **T4:** Build analyzer service (`analyzer.py`) — extract title, meta, headings, Schema.org, OpenGraph, links, semantic HTML check
  - INPUT: Raw HTML string
  - OUTPUT: `AnalysisResult` dict with all extracted data
  - VERIFY: Feed sample HTML → get structured extraction

- [ ] **T5:** Build `llms_generator.py` — generate llms.txt from analysis results following the llms.txt spec
  - INPUT: `AnalysisResult` for all crawled pages
  - OUTPUT: Valid `llms.txt` string content
  - VERIFY: Output follows llms.txt format (title, description, sections, links)

- [ ] **T6:** Build `agents_generator.py` — generate agents.txt from analysis results
  - INPUT: `AnalysisResult` for all crawled pages
  - OUTPUT: Valid `agents.txt` string content
  - VERIFY: Output contains agent permissions, API endpoints, allowed actions

- [ ] **T7:** Build `scorer.py` — calculate AEO score (0-100) based on structured data coverage, semantic HTML, accessibility
  - INPUT: `AnalysisResult`
  - OUTPUT: `AEOScore(total, breakdown={structured_data, semantic_html, meta_quality, agent_readiness})`
  - VERIFY: Known good site scores 70+, bad site scores <30

- [ ] **T8:** Create scan router (`scan.py`) — `POST /api/scan` (start scan), `GET /api/scan/{id}/status` (poll progress), `GET /api/scan/{id}/results` (get results)
  - INPUT: All services wired together
  - OUTPUT: Working API endpoints with background task processing
  - VERIFY: Full flow via `curl` — submit URL → poll → get results with llms.txt + agents.txt + score

### Phase 2: Frontend UI
**Agent:** `frontend-specialist` | **Skill:** `frontend-design`, `clean-code`

- [ ] **T9:** Init Next.js 15 project in `frontend/` with Tailwind CSS, Inter font, dark mode support
  - INPUT: Empty `frontend/` folder
  - OUTPUT: `npm run dev` starts on port 3000, clean landing page renders
  - VERIFY: Open `http://localhost:3000` → page loads without errors

- [ ] **T10:** Build `ScanForm` component — URL input with validation, scan button, loading state
  - INPUT: Design spec
  - OUTPUT: Form that calls `POST /api/scan` and redirects to results
  - VERIFY: Enter URL → loading animation shows → redirects to results page

- [ ] **T11:** Build `ScanProgress` component — real-time progress bar with step indicators (Crawling → Analyzing → Generating)
  - INPUT: Scan status polling
  - OUTPUT: Animated progress UI that polls `GET /api/scan/{id}/status`
  - VERIFY: Progress updates in real-time during scan

- [ ] **T12:** Build `ResultsPanel` — tabbed view with 3 tabs: llms.txt preview, agents.txt preview, AEO Report
  - INPUT: Scan results JSON
  - OUTPUT: Tabbed UI with syntax-highlighted file previews + download buttons
  - VERIFY: All 3 tabs render, download buttons produce valid files

- [ ] **T13:** Build `ScoreCard` — circular AEO score (0-100) with breakdown chart + recommendations
  - INPUT: AEO score data
  - OUTPUT: Visual score card with animated number + category breakdown
  - VERIFY: Score renders with correct breakdown values

- [ ] **T14:** Build landing page (`page.tsx`) — hero section, ScanForm, feature highlights, open-source CTA
  - INPUT: All components
  - OUTPUT: Complete landing page with professional design
  - VERIFY: Full page renders, responsive on mobile/tablet/desktop

### Phase 3: Integration & Polish
**Agent:** `frontend-specialist` + `backend-specialist`

- [ ] **T15:** Wire frontend to backend — API client, error handling, CORS
  - INPUT: Both apps running
  - OUTPUT: Full flow works: input URL → scan → view results → download files
  - VERIFY: End-to-end test with a real URL

- [ ] **T16:** Add error states — invalid URL, timeout, server error, rate limiting
  - INPUT: Error scenarios
  - OUTPUT: User-friendly error messages for all failure cases
  - VERIFY: Test each error case manually

- [ ] **T17:** Create docs — `Architecture.md`, `Features.md`, `Checklist.md`, `README.md`
  - INPUT: Completed project
  - OUTPUT: Full documentation set
  - VERIFY: README has setup instructions that work from scratch

- [ ] **T18:** Setup logging — request logs, scan logs, error logs in `logs/` directory
  - INPUT: All services
  - OUTPUT: Structured logging with rotation
  - VERIFY: Logs appear in `logs/` during scan operations

## Phase X: Verification

- [ ] Backend API starts without errors (`uvicorn`)
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Full scan flow works end-to-end (URL → results → download)
- [ ] llms.txt output follows spec format
- [ ] agents.txt output is valid
- [ ] AEO score calculation is consistent
- [ ] Responsive design works on mobile
- [ ] README setup instructions reproducible from scratch
- [ ] GitHub repo ready (LICENSE, .gitignore, README)

## Notes

- **No database needed for MVP** — scan results held in memory (or temp files). Add Redis/DB later for caching.
- **Rate limiting** — simple in-memory rate limit (5 scans/min per IP) to prevent abuse.
- **Open-source strategy** — MIT license, good README with GIF demo, post on Hacker News / Reddit / Product Hunt.
- **Future features (post-MVP):** WebMCP declaration generator, MCP server scaffold, batch scanning, API key access, historical comparison.
