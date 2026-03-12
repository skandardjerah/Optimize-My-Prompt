import { FeatureExtractor } from './FeatureExtractor.js';
import { getLanguage } from '../../i18n/languages.js';

/**
 * IntentClassifier (Tier 2 — Server-Side)
 * Three-stage classification:
 *   1. Hard rules — SQL pattern, code fences, dense punctuation → CODE
 *   2. HYBRID gate — tech term + educational trigger → HYBRID
 *   3. Weighted vote — techScore vs nlScore → CODE or NATURAL_LANGUAGE
 *
 * Target: ≥ 95% F1-score, <50ms processing time.
 * Output intent values: 'CODE' | 'NATURAL_LANGUAGE' | 'HYBRID'
 */
export class IntentClassifier {
  constructor() {
    this.extractor = new FeatureExtractor();

    // SQL DML/DDL: must have a verb AND a table keyword
    this.sqlRe = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE\s+TABLE|DROP\s+TABLE|ALTER\s+TABLE)\b/i;
    this.sqlCtxRe = /\b(FROM|INTO|SET|TABLE|JOIN|WHERE|GROUP\s+BY|ORDER\s+BY)\b/i;

    // Direct code-analysis verbs: signal a request to inspect/fix existing code, not produce docs
    this.directAnalysisRe = /\b(analyze|analyse|debug|fix|review|audit|inspect|benchmark|profile|measure|trace)\b/i;
    // Educational-output verbs: signal the user wants a written/produced artifact
    this.educationalOutputRe = /\b(write|create|draft|produce|generate|document|publish|make)\b/i;
  }

  /**
   * Classify a prompt.
   * @param {string} prompt
   * @param {string|null} intentHint  Tier 1 hint: 'CODE'|'NL'|'NATURAL_LANGUAGE'|'HYBRID'
   * @returns {{ intent, confidence, tier, subtype, features, processingMs }}
   */
  classify(prompt, intentHint = null, lang = 'en') {
    const startMs = Date.now();

    // ── Stage 1: Hard rules ────────────────────────────────────────────────
    // SQL statement
    if (this.sqlRe.test(prompt) && this.sqlCtxRe.test(prompt)) {
      return this._result('CODE', 0.97, prompt, 1, startMs, { rule: 'sql' });
    }

    // Markdown code fence
    if (/`{3}/.test(prompt)) {
      return this._result('CODE', 0.95, prompt, 1, startMs, { rule: 'code_fence' });
    }

    // Dense code punctuation (at least 4 points: {} ; ` weighted)
    const curly = (prompt.match(/[{}]/g) || []).length;
    const semi = (prompt.match(/;/g) || []).length;
    const backtick = (prompt.match(/`/g) || []).length;
    if (curly + semi * 2 + backtick * 3 >= 4) {
      return this._result('CODE', 0.94, prompt, 1, startMs, { rule: 'dense_punctuation' });
    }

    // ── Stage 2–3: Domain counting ────────────────────────────────────────
    const langConfig = getLanguage(lang);
    const counts = this.extractor.scoreDomains(prompt, langConfig);
    const { tech, nl, hybrid: hybridTriggers, creative, business, scientific, codeKw } = counts;

    // Apply Tier 1 hint by nudging counts
    let adjTech = tech + (intentHint === 'CODE' ? 1 : 0);
    let adjNl = nl + (intentHint === 'NL' || intentHint === 'NATURAL_LANGUAGE' ? 1 : 0);

    // ── Stage 2: HYBRID gate ──────────────────────────────────────────────
    // HYBRID = technical topic discussed in an educational/documentary writing context.
    // Skip gate when the prompt is a direct code-analysis request (analyze/debug/review)
    // WITHOUT an explicit educational-output verb (write/create/produce/document).
    const isDirectAnalysis = this.directAnalysisRe.test(prompt) && !this.educationalOutputRe.test(prompt);
    if (!isDirectAnalysis && adjTech >= 1 && hybridTriggers >= 1) {
      const conf = Math.min(0.92, 0.70 + Math.min(adjTech, 3) * 0.05 + Math.min(hybridTriggers, 2) * 0.05);
      return this._result('HYBRID', conf, prompt, 2, startMs, { tech, hybridTriggers, nl });
    }

    // ── Stage 3: CODE vs NATURAL_LANGUAGE vote ────────────────────────────
    // codeVotes: each tech term counts 2, code keyword counts 1
    const codeVotes = adjTech * 2 + codeKw;
    // nlVotes: NL keyword counts 2, creative/business/scientific domain counts 3/2/2
    const nlVotes = adjNl * 2 + creative * 3 + business * 2 + scientific * 2;

    let intent, confidence;
    if (codeVotes > nlVotes) {
      intent = 'CODE';
      const margin = codeVotes - nlVotes;
      confidence = Math.min(0.97, 0.65 + margin * 0.06);
    } else if (nlVotes > codeVotes) {
      intent = 'NATURAL_LANGUAGE';
      const margin = nlVotes - codeVotes;
      confidence = Math.min(0.97, 0.65 + margin * 0.06);
    } else {
      // Tie — CODE wins when there is any technical signal, NL otherwise
      intent = adjTech > 0 ? 'CODE' : 'NATURAL_LANGUAGE';
      confidence = 0.65;
    }

    return this._result(intent, confidence, prompt, 2, startMs, { tech, nl, codeVotes, nlVotes });
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
    if (intent === 'CODE' || intent === 'HYBRID') {
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
