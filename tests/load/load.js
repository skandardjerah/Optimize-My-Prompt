/**
 * Load test — ramp to 40 VUs over 2 minutes, hold for 3 minutes, ramp down.
 * Simulates realistic concurrent usage across all JSON endpoints.
 * SSE /api/optimize is tested in optimize.js (separate — it holds connections).
 *
 * Run: k6 run tests/load/load.js
 *      k6 run tests/load/load.js --out json=results/load.json
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

// Custom metrics
const classifyLatency = new Trend('classify_p95_ms', true);
const tipLatency      = new Trend('tip_p95_ms',      true);
const errors          = new Counter('request_errors');
const errorRate       = new Rate('error_rate');

export const options = {
  stages: [
    { duration: '30s', target: 10  },  // ramp-up
    { duration: '1m',  target: 40  },  // ramp to peak
    { duration: '3m',  target: 40  },  // hold at peak
    { duration: '30s', target: 0   },  // ramp-down
  ],
  thresholds: {
    http_req_failed:   ['rate<0.02'],       // <2% HTTP errors
    http_req_duration: ['p(95)<800'],       // overall p95 < 800ms
    classify_p95_ms:   ['p(95)<150'],       // classify p95 < 150ms
    tip_p95_ms:        ['p(95)<400'],       // tips p95 < 400ms
    error_rate:        ['rate<0.02'],
  },
};

const HEADERS = { 'Content-Type': 'application/json' };

// Prompt pool — varied to prevent cache-only results
const CODE_PROMPTS = [
  'Write a binary search algorithm in TypeScript',
  'Debug this React component causing infinite re-renders',
  'Optimize a slow SQL query joining three tables',
  'Implement JWT authentication middleware in Express',
  'Create a Python decorator that retries on failure',
];
const NL_PROMPTS = [
  'Write a blog post about the future of AI in healthcare',
  'Help me craft a professional email requesting a raise',
  'Summarize key findings from climate change research',
  'Create a marketing strategy for a fitness app',
  'Write a persuasive essay on renewable energy',
];
const HYBRID_PROMPTS = [
  'Write a tutorial on React hooks with code examples',
  'Explain microservices architecture with a Node.js example',
  'Create a beginner guide to SQL with example queries',
  'Write API documentation for an authentication endpoint',
  'Compare sorting algorithms with Python code examples',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function allPrompts() { return [...CODE_PROMPTS, ...NL_PROMPTS, ...HYBRID_PROMPTS]; }

export default function () {
  // Each VU randomly exercises endpoints in proportion to real usage
  const roll = Math.random();

  if (roll < 0.15) {
    // ── Health check (15%) ──────────────────────────────────────────────────
    group('health', () => {
      const res = http.get(`${BASE}/health`);
      const ok = check(res, { 'health 200': r => r.status === 200 });
      if (!ok) errors.add(1);
      errorRate.add(!ok);
    });

  } else if (roll < 0.45) {
    // ── /api/classify (30%) ─────────────────────────────────────────────────
    group('classify', () => {
      const prompt = pick(allPrompts());
      const res = http.post(`${BASE}/api/classify`,
        JSON.stringify({ prompt }), { headers: HEADERS });
      classifyLatency.add(res.timings.duration);
      const ok = check(res, {
        'classify 200':       r => r.status === 200,
        'classify has intent': r => {
          try { return !!JSON.parse(r.body).intent; } catch { return false; }
        },
      });
      if (!ok) errors.add(1);
      errorRate.add(!ok);
    });

  } else {
    // ── /api/tips (55%) — the primary endpoint ───────────────────────────────
    group('tips', () => {
      const prompt = pick(allPrompts());
      const count = Math.floor(Math.random() * 3) + 3; // 3–5 tips
      const res = http.post(`${BASE}/api/tips`,
        JSON.stringify({ prompt, count }), { headers: HEADERS });
      tipLatency.add(res.timings.duration);
      const ok = check(res, {
        'tips 200':       r => r.status === 200,
        'tips is array':  r => {
          try { return Array.isArray(JSON.parse(r.body).tips); } catch { return false; }
        },
        'tips not empty': r => {
          try { return JSON.parse(r.body).tips.length > 0; } catch { return false; }
        },
      });
      if (!ok) errors.add(1);
      errorRate.add(!ok);
    });
  }

  sleep(Math.random() * 1.5 + 0.5); // 0.5–2s think time
}
