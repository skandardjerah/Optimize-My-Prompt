/**
 * SSE streaming load test — /api/optimize
 *
 * Uses k6's experimental http module to read chunked SSE responses.
 * Keeps connections open for the full LLM stream duration.
 *
 * Run: k6 run tests/load/optimize.js
 *
 * NOTE: This hits the real Anthropic API and incurs token costs.
 *       Use --env BASE_URL=http://localhost:3000 to target local server.
 *       Keep VUs low (3–10) to avoid rate-limiting from Anthropic.
 */
import { check, sleep } from 'k6';
import http from 'k6/http';
import { Trend, Rate, Counter } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

const streamDuration  = new Trend('stream_duration_ms', true);
const chunkCount      = new Trend('chunks_per_stream');
const streamErrors    = new Counter('stream_errors');
const errorRate       = new Rate('error_rate');

export const options = {
  stages: [
    { duration: '30s', target: 2 },   // warm-up with 2 VUs
    { duration: '2m',  target: 5 },   // hold at 5 concurrent streams
    { duration: '30s', target: 0 },   // ramp-down
  ],
  thresholds: {
    http_req_failed:   ['rate<0.05'],       // <5% connection failures
    stream_duration_ms: ['p(95)<15000'],    // p95 stream completes < 15s
    error_rate:         ['rate<0.05'],
  },
};

const HEADERS = { 'Content-Type': 'application/json' };

const PROMPTS = [
  'Write a Python function to implement quicksort with detailed comments',
  'Explain the concept of closures in JavaScript to a beginner',
  'Create a REST API endpoint that handles user authentication with JWT',
  'Write a blog post introduction about the benefits of TypeScript',
  'Debug a React component that is not re-rendering when state changes',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export default function () {
  const prompt = pick(PROMPTS);
  const startMs = Date.now();

  // POST the optimize request — server streams back SSE
  const res = http.post(
    `${BASE}/api/optimize`,
    JSON.stringify({ prompt, tipCount: 3 }),
    {
      headers: HEADERS,
      // k6 buffers the full response body for us; SSE events arrive inline
      timeout: '30s',
    }
  );

  const elapsed = Date.now() - startMs;
  streamDuration.add(elapsed);

  // Parse SSE events from the response body
  const body = res.body || '';
  const events = body.split('\n\n').filter(e => e.startsWith('data: '));
  const parsed = events.map(e => {
    try { return JSON.parse(e.slice(6)); } catch { return null; }
  }).filter(Boolean);

  const chunks  = parsed.filter(e => e.type === 'chunk');
  const hasIntent  = parsed.some(e => e.type === 'intent');
  const hasTips    = parsed.some(e => e.type === 'tip');
  const hasQuality = parsed.some(e => e.type === 'quality');
  const hasDone    = parsed.some(e => e.type === 'done');
  const hasError   = parsed.some(e => e.type === 'error');

  chunkCount.add(chunks.length);

  const ok = check(res, {
    'optimize status 200':   r => r.status === 200,
    'stream has intent':     () => hasIntent,
    'stream has tips':       () => hasTips,
    'stream has chunks':     () => chunks.length > 0,
    'stream has quality':    () => hasQuality,
    'stream done cleanly':   () => hasDone && !hasError,
  });

  if (!ok || hasError) streamErrors.add(1);
  errorRate.add(!ok || hasError);

  sleep(Math.random() * 3 + 2); // 2–5s between requests per VU
}
