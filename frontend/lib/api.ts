const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ScanResponse {
  scan_id: string;
  status: string;
  message: string;
}

export interface ScanStatus {
  scan_id: string;
  status: string;
  progress: number;
  stage_detail: string;
  pages_crawled: number;
  total_pages: number;
  error: string | null;
}

export interface ScoreBreakdown {
  structured_data: number;
  semantic_html: number;
  meta_quality: number;
  agent_readiness: number;
}

export interface AEOScore {
  total: number;
  grade: string;
  breakdown: ScoreBreakdown;
  recommendations: string[];
}

export interface PageAnalysis {
  url: string;
  title: string;
  description: string;
  headings: { level: string; text: string }[];
  schema_org: Record<string, unknown>[];
  open_graph: Record<string, string>;
  meta_tags: Record<string, string>;
  semantic_elements: Record<string, number>;
  links: string[];
  word_count: number;
}

export interface ScanResult {
  scan_id: string;
  url: string;
  scanned_at: string;
  pages_analyzed: number;
  llms_txt: string;
  agents_txt: string;
  score: AEOScore;
  pages: PageAnalysis[];
}

export async function startScan(url: string): Promise<ScanResponse> {
  const res = await fetch(`${API_BASE}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(`Scan request failed: ${res.status}`);
  return res.json();
}

export async function getScanStatus(scanId: string): Promise<ScanStatus> {
  const res = await fetch(`${API_BASE}/api/scan/${scanId}/status`);
  if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
  return res.json();
}

export async function getScanResults(scanId: string): Promise<ScanResult> {
  const res = await fetch(`${API_BASE}/api/scan/${scanId}/results`);
  if (!res.ok) {
    if (res.status === 202) throw new Error("SCAN_IN_PROGRESS");
    throw new Error(`Results fetch failed: ${res.status}`);
  }
  return res.json();
}
