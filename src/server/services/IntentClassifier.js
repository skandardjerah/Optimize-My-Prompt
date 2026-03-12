import { FeatureExtractor } from './FeatureExtractor.js';
import { getLanguage } from '../../i18n/languages.js';

/**
 * IntentClassifier (Tier 2 — Server-Side)
 * Two-stage classification:
 *   1. Hard rules — SQL pattern, code fences, dense punctuation → CODE
 *   2. Context-aware vote — codeIntentScore insists on CODE only when code keywords
 *      appear inside a code-like context; everything else → NATURAL_LANGUAGE
 *
 * Output intent values: 'CODE' | 'NATURAL_LANGUAGE'
 *
 * HYBRID is intentionally removed — a natural-language sentence about a technical
 * topic is still a prompt that needs enhancement, not code review.  Both cases
 * are handled identically as NATURAL_LANGUAGE.
 */
export class IntentClassifier {
  constructor() {
    this.extractor = new FeatureExtractor();

    // SQL DML/DDL: must have a verb AND a table keyword
    this.sqlRe = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE\s+TABLE|DROP\s+TABLE|ALTER\s+TABLE)\b/i;
    this.sqlCtxRe = /\b(FROM|INTO|SET|TABLE|JOIN|WHERE|GROUP\s+BY|ORDER\s+BY)\b/i;
  }

  /**
   * Classify a prompt.
   * @param {string} prompt
   * @param {string|null} intentHint  Tier 1 hint: 'CODE'|'NL'|'NATURAL_LANGUAGE'
   * @param {string} lang  Language code (default 'en')
   * @returns {{ intent, confidence, tier, subtype, features, processingMs }}
   */
  classify(prompt, intentHint = null, lang = 'en') {
    const startMs = Date.now();

    // ── Stage 1: Hard rules ────────────────────────────────────────────────
    if (this.sqlRe.test(prompt) && this.sqlCtxRe.test(prompt)) {
      return this._result('CODE', 0.97, prompt, 1, startMs, { rule: 'sql' });
    }

    if (/`{3}/.test(prompt)) {
      return this._result('CODE', 0.95, prompt, 1, startMs, { rule: 'code_fence' });
    }

    const curly    = (prompt.match(/[{}]/g) || []).length;
    const semi     = (prompt.match(/;/g)    || []).length;
    const backtick = (prompt.match(/`/g)    || []).length;
    // Python-style: multiline block OR one-liner function/class definition
    const pythonBlock = /^\s*(def|class|if|for|while|with|elif|else|try|except)\b.*:\s*$/m.test(prompt)
                     || /\bdef\s+\w+\s*\(/.test(prompt)
                     || /\bclass\s+\w+[\s:(]/.test(prompt);
    if (curly + semi * 2 + backtick * 3 >= 4 || pythonBlock) {
      return this._result('CODE', 0.94, prompt, 1, startMs, { rule: 'dense_punctuation' });
    }

    // ── Stage 2: Context-aware vote ───────────────────────────────────────
    const langConfig = getLanguage(lang);
    const counts = this.extractor.scoreDomains(prompt, langConfig);
    const { tech, nl, creative, business, scientific, codeKw } = counts;

    let adjTech = tech + (intentHint === 'CODE' ? 1 : 0);
    let adjNl   = nl   + (intentHint === 'NL' || intentHint === 'NATURAL_LANGUAGE' ? 1 : 0);

    // scoreCodeIntent checks whether code keywords appear in a code-like context
    // (surrounded by other code/tech tokens, no prose words nearby).
    // Only a score ≥ 1.5 — meaning the context truly insists on code — produces CODE.
    const tokens = this.extractor.tokenize(prompt);
    const codeIntentScore = this.extractor.scoreCodeIntent(tokens, langConfig);

    const codeVotes = adjTech * 2 + codeKw;
    const nlVotes   = adjNl  * 2 + creative * 3 + business * 2 + scientific * 2;

    let intent, confidence;

    if (codeIntentScore >= 1.5) {
      intent = 'CODE';
      confidence = Math.min(0.97, 0.70 + Math.min(codeIntentScore, 3) * 0.05);
    } else {
      // Everything else is a text prompt — enhance it regardless of tech vocabulary.
      intent = 'NATURAL_LANGUAGE';
      const margin = Math.abs(codeVotes - nlVotes);
      confidence = Math.min(0.92, 0.65 + margin * 0.04);
    }

    return this._result(intent, confidence, prompt, 2, startMs, { tech, nl, codeVotes, nlVotes, codeIntentScore });
  }

  _result(intent, confidence, prompt, tier, startMs, featureHints = {}) {
    return {
      intent,
      confidence: parseFloat(confidence.toFixed(3)),
      tier,
      subtype: this._subtype(prompt, intent),
      features: featureHints,
      processingMs: Date.now() - startMs,
    };
  }

  _subtype(prompt, intent) {
    if (intent === 'CODE') {
      if (/\b(bug|error|fix|debug|issue|problem|crash|fail|broken)\b/i.test(prompt))
        return { code: 'debug', nl: null };
      if (/\b(review|check|audit|inspect|assess|evaluate)\b/i.test(prompt))
        return { code: 'review', nl: null };
      if (/\b(explain|understand|what does|how does|what is|how do)\b/i.test(prompt))
        return { code: 'explain', nl: null };
      return { code: 'generate', nl: null };
    }
    if (/\b(story|poem|essay|blog|creative|fiction|narrative|lyrics)\b/i.test(prompt))
      return { code: null, nl: 'creative' };
    return { code: null, nl: 'analytical' };
  }
}
