# AgentSpace Architecture

## System Overview

```
┌─────────────────┐     HTTP/JSON      ┌──────────────────────┐
│   Next.js 15    │ ◄──────────────── ► │   FastAPI Backend    │
│   (Frontend)    │     REST API        │   (Python 3.11+)     │
│   Port 3000     │                     │   Port 8000          │
└─────────────────┘                     └──────────────────────┘
                                               │
                                        ┌──────┴──────┐
                                        │  Services   │
                                        ├─────────────┤
                                        │ Crawler     │ ── httpx (async)
                                        │ Analyzer    │ ── BeautifulSoup + extruct
                                        │ LLMs Gen    │ ── llms.txt spec
                                        │ Agents Gen  │ ── agents.txt spec
                                        │ Scorer      │ ── AEO scoring engine
                                        └─────────────┘
```

## Data Flow

1. User enters URL in ScanForm
2. Frontend calls `POST /api/scan` → backend starts background task
3. Frontend polls `GET /api/scan/{id}/status` every 1s
4. Backend: Crawl → Analyze → Generate → Score (pipeline)
5. Frontend: Progress bar updates → Results displayed on completion

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Lucide Icons |
| Backend | Python, FastAPI, httpx, BeautifulSoup4, extruct |
| Fonts | Fira Code (headings), Fira Sans (body) |
| Design | Dark mode, blue palette (#3B82F6), glassmorphism nav |

## Storage

MVP uses in-memory storage (Python dicts). No database required.
Results are held until server restart.
