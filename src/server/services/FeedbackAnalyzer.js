/**
 * FeedbackAnalyzer — Phase 5 accuracy feedback loop.
 *
 * Collects post-optimization ratings and surfaces patterns that indicate
 * classifier drift or quality-score miscalibration.
 *
 * Stored in-memory (restart-safe via periodic JSON dump to logs/).
 * Entries shape: { prompt, intent, confidence, rating, comment, ts }
 *
 * Surface via GET /api/feedback/analysis
 */
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE_PATH = join(__dirname, '../../../logs/feedback.json');

export class FeedbackAnalyzer {
  constructor() {
    this.entries = [];
    this._load();
  }

  // ── Collect ───────────────────────────────────────────────────────────────

  /**
   * Record a user rating after optimization.
   * @param {{ conversationId, rating, comment, promptId, prompt, intent, confidence }} opts
   */
  collect({ conversationId, rating, comment, promptId, prompt = '', intent = null, confidence = null } = {}) {
    if (rating == null || rating < 1 || rating > 5) return;

    this.entries.push({
      conversationId,
      promptId,
      prompt: String(prompt).slice(0, 500),
      intent,
      confidence,
      rating: Number(rating),
      comment: comment ? String(comment).slice(0, 1000) : null,
      ts: new Date().toISOString(),
    });

    this._persist();
  }

  // ── Analyze ───────────────────────────────────────────────────────────────

  /**
   * Aggregate feedback into classifier accuracy signals.
   * Returns a report useful for manual review and future tuning.
   */
  analyze() {
    if (this.entries.length === 0) {
      return { totalFeedback: 0, message: 'No feedback collected yet.' };
    }

    const total = this.entries.length;
    const avgRating = this.entries.reduce((s, e) => s + e.rating, 0) / total;

    // Rating distribution
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const e of this.entries) dist[e.rating]++;

    // Low-rated entries (rating ≤ 2) by intent — surfaces systematic issues
    const lowRated = this.entries.filter(e => e.rating <= 2);
    const lowByIntent = {};
    for (const e of lowRated) {
      const k = e.intent || 'unknown';
      lowByIntent[k] = (lowByIntent[k] || 0) + 1;
    }

    // Low-confidence entries that received low ratings — classifier uncertainty
    const uncertainAndBad = this.entries.filter(e => e.confidence != null && e.confidence < 0.75 && e.rating <= 2);

    // Satisfaction rate (rating ≥ 4)
    const satisfied = this.entries.filter(e => e.rating >= 4).length;
    const satisfactionRate = satisfied / total;

    // Recent trend (last 20 entries)
    const recent = this.entries.slice(-20);
    const recentAvg = recent.length
      ? recent.reduce((s, e) => s + e.rating, 0) / recent.length
      : null;

    return {
      totalFeedback: total,
      averageRating: parseFloat(avgRating.toFixed(2)),
      satisfactionRate: parseFloat((satisfactionRate * 100).toFixed(1)),
      ratingDistribution: dist,
      recentAverageRating: recentAvg ? parseFloat(recentAvg.toFixed(2)) : null,
      lowRatedByIntent: lowByIntent,
      uncertainMisclassifications: uncertainAndBad.length,
      // Surface the 5 most recent low-rated prompts for manual inspection
      recentLowRated: lowRated.slice(-5).map(e => ({
        prompt: e.prompt.slice(0, 120),
        intent: e.intent,
        confidence: e.confidence,
        rating: e.rating,
        comment: e.comment,
        ts: e.ts,
      })),
    };
  }

  // ── Persistence ───────────────────────────────────────────────────────────

  _persist() {
    try {
      writeFileSync(STORE_PATH, JSON.stringify(this.entries, null, 2));
    } catch (_) {
      // Non-fatal — data is still in memory for this session
    }
  }

  _load() {
    try {
      if (existsSync(STORE_PATH)) {
        this.entries = JSON.parse(readFileSync(STORE_PATH, 'utf8'));
      }
    } catch (_) {
      this.entries = [];
    }
  }
}
