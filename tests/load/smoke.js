/**
 * Smoke test — 1 VU, 30 seconds.
 * Verifies every endpoint responds correctly under zero load.
 * Run: k6 run tests/load/smoke.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

const tipLatency      = new Trend('tip_latency_ms',      true);
const classifyLatency = new Trend('classify_latency_ms', true);
const errorRate       = new Rate('error_rate');

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed:   ['rate<0.01'],          // <1% failures
    tip_latency_ms:    ['p(95)<300'],          // tips: p95 < 300ms
    classify_latency_ms: ['p(95)<100'],        // classify: p95 < 100ms
    error_rate:        ['rate<0.01'],
  },
};

const HEADERS = { 'Content-Type': 'application/json' };

export default function () {
  // ── /health ──────────────────────────────────────────────────────────────
  {
    const res = http.get(`${BASE}/health`);
    const ok = check(res, {
      'health status 200':  r => r.status === 200,
      'health body ok':     r => JSON.parse(r.body).status === 'ok',
    });
    errorRate.add(!ok);
  }

  sleep(0.5);

  // ── /api/classify ─────────────────────────────────────────────────────────
  {
    const payload = JSON.stringify({ prompt: 'Write a Python function to sort a list', intentHint: null });
    const res = http.post(`${BASE}/api/classify`, payload, { headers: HEADERS });
    classifyLatency.add(res.timings.duration);
    const ok = check(res, {
      'classify status 200':  r => r.status === 200,
      'classify has intent':  r => !!JSON.parse(r.body).intent,
      'classify < 100ms':     r => r.timings.duration < 100,
    });
    errorRate.add(!ok);
  }

  sleep(0.5);

  // ── /api/tips ─────────────────────────────────────────────────────────────
  {
    const payload = JSON.stringify({ prompt: 'Explain React hooks with examples', count: 4 });
    const res = http.post(`${BASE}/api/tips`, payload, { headers: HEADERS });
    tipLatency.add(res.timings.duration);
    const ok = check(res, {
      'tips status 200':  r => r.status === 200,
      'tips array':       r => Array.isArray(JSON.parse(r.body).tips),
      'tips count ≥ 1':   r => JSON.parse(r.body).tips.length >= 1,
    });
    errorRate.add(!ok);
  }

  sleep(1);
}
