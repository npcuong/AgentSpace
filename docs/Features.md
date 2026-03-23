# AgentSpace AEO Scanner Features

## Core Features

- **URL Scanning** — Enter any website URL to analyze
- **Multi-page Crawling** — Discovers and crawls up to 20 internal pages (depth 2)
- **llms.txt Generation** — Creates a machine-readable site summary for LLMs
- **agents.txt Generation** — Declares agent permissions, capabilities, API endpoints
- **AEO Score (0-100)** — Weighted score across 4 categories:
  - Structured Data (30%) — Schema.org / JSON-LD coverage
  - Semantic HTML (20%) — Usage of header, nav, main, article, section, footer
  - Meta Quality (20%) — Title, description, OpenGraph completeness
  - Agent Readiness (30%) — robots.txt, sitemap.xml, llms.txt, agents.txt presence

## UI Features

- Real-time scan progress with animated stage indicators
- Tabbed results view (Score / llms.txt / agents.txt)
- Code preview with line numbers
- Copy-to-clipboard and file download
- Responsive design (mobile/tablet/desktop)
- Dark mode with Fira Code/Sans typography

## Technical Features

- Async crawling with polite delays
- Special file detection (robots.txt, sitemap.xml, llms.txt, agents.txt)
- JSON-LD structured data extraction via extruct
- OpenGraph and meta tag parsing
- API endpoint discovery heuristic
- Capability detection (forms, search, auth, e-commerce)
- Rate limiting (5 scans/min per IP)
- File logging (logs/api.log)
