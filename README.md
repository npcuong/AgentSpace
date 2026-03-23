# AgentSpace — AEO Scanner

> **Agent Engine Optimization** — Make any website agent-ready.

Generate `llms.txt`, `agents.txt`, and get your AEO score for any website. Free & open-source.

## What is AEO?

Just like SEO optimizes websites for search engines, **AEO (Agent Engine Optimization)** optimizes websites for AI agents. As AI agents become the primary consumers of web content, websites need to be machine-readable, not just human-readable.

AgentSpace AEO helps you:
- **Generate `llms.txt`** — A file that helps LLMs understand your site structure and content
- **Generate `agents.txt`** — Declare what AI agents can do on your site (permissions, APIs, capabilities)
- **Score your website (0-100)** — Measure agent-readiness across 4 key dimensions

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter a URL to scan.

## How It Works

1. **Enter a URL** in the scan form
2. **Crawler** discovers up to 20 internal pages (depth 2)
3. **Analyzer** extracts structured data, meta tags, semantic HTML, Schema.org
4. **Generator** creates `llms.txt` and `agents.txt` files
5. **Scorer** rates the website on a 0-100 scale

## AEO Score Breakdown

| Category | Weight | What It Measures |
|----------|--------|-----------------|
| Structured Data | 30% | Schema.org / JSON-LD coverage |
| Agent Readiness | 30% | robots.txt, sitemap, llms.txt, agents.txt |
| Semantic HTML | 20% | header, nav, main, article, section usage |
| Meta Quality | 20% | Title, description, OpenGraph tags |

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Lucide Icons
- **Backend:** Python, FastAPI, httpx, BeautifulSoup4, extruct
- **Design:** Fira Code + Fira Sans, dark mode, glassmorphism

## License

MIT
