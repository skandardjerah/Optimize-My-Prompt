/**
 * PromptOptimizer — Phase 2 core.
 * Orchestrates: classify → tips → streaming LLM optimization → quality score.
 *
 * Used by POST /api/optimize (SSE) and POST /api/tips (JSON).
 */
import Anthropic from '@anthropic-ai/sdk';
import { IntentClassifier } from './IntentClassifier.js';
import { TipEngine } from './TipEngine.js';
import { StreamHandler } from './StreamHandler.js';

// ── Quality scorer ─────────────────────────────────────────────────────────

/**
 * Score an optimized prompt on a 0–100 scale.
 * Returns { score, label, breakdown }.
 */
function scorePrompt(original, optimized) {
  const breakdown = {};

  // 1. Length improvement — reward elaboration up to 3× original length
  const ratio = optimized.length / Math.max(original.length, 1);
  breakdown.lengthScore = Math.round(Math.min(ratio / 3, 1) * 25);

  // 2. Specificity markers — numbers, named entities, quoted strings
  const specifiers = (optimized.match(/\d+|["'][^"']{2,}["']|\b[A-Z][a-z]+[A-Z]\w*/g) || []).length;
  breakdown.specificityScore = Math.min(specifiers * 4, 25);

  // 3. Structure markers — bullet points, numbered lists, headers
  const structure = (optimized.match(/^[-*•]\s|\b\d+\.\s|^#+\s/mg) || []).length;
  breakdown.structureScore = Math.min(structure * 5, 25);

  // 4. Clarity signals — explicit role, format, or constraint statements
  const clarityRe = /\b(as a|you are|format|output|return|respond|do not|must|should|always|never|step[- ]by[- ]step)\b/gi;
  const clarity = (optimized.match(clarityRe) || []).length;
  breakdown.clarityScore = Math.min(clarity * 5, 25);

  const score = Math.min(
    breakdown.lengthScore + breakdown.specificityScore + breakdown.structureScore + breakdown.clarityScore,
    100
  );

  const label = score >= 85 ? 'Excellent'
    : score >= 70 ? 'Good'
    : score >= 50 ? 'Fair'
    : 'Needs work';

  return { score, label, breakdown };
}

// ── System prompt builder ──────────────────────────────────────────────────

function buildSystemPrompt(intent, subtype) {
  const base = `You are an expert prompt engineer. Your task is to rewrite the user's prompt to be clearer, more specific, and more effective for AI models.

Guidelines:
- Preserve the original goal and intent exactly
- Add concrete constraints, context, and expected output format
- Do NOT add unnecessary caveats or meta-commentary
- Output ONLY the improved prompt — no preamble, no explanation`;

  if (intent === 'CODE') {
    return `${base}
- Specify language, version, and framework when not present
- Include input/output types or examples
- Mention error handling and edge cases as appropriate`;
  }

  if (intent === 'HYBRID') {
    return `${base}
- Balance technical precision with clear prose structure
- Suggest code examples or diagrams where useful
- Keep the educational tone while adding specificity`;
  }

  // NATURAL_LANGUAGE
  return `${base}
- Clarify audience, tone, and length expectations
- Add structural guidance (e.g., sections, format)
- Include any relevant domain context`;
}

// ── PromptOptimizer ────────────────────────────────────────────────────────

export class PromptOptimizer {
  constructor({ apiKey } = {}) {
    this.anthropic = new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY });
    this.classifier = new IntentClassifier();
    this.tipEngine = new TipEngine();
  }

  /**
   * Stream an optimization over SSE.
   * Emits: intent → tip(×N) → chunk(×N) → quality → done
   *
   * @param {string} prompt  Original user prompt
   * @param {StreamHandler} stream
   * @param {{ intentHint?: string, tipCount?: number }} options
   */
  async optimize(prompt, stream, { intentHint = null, tipCount = 4 } = {}) {
    stream.open();

    try {
      // ── Step 1: Classify ─────────────────────────────────────────────────
      const classification = this.classifier.classify(prompt, intentHint);
      const { intent, confidence, subtype } = classification;

      stream.sendIntent(intent, confidence, subtype);

      // ── Step 2: Tips (non-blocking — send before LLM starts) ─────────────
      const { tips } = this.tipEngine.getTips(intent, subtype?.code || subtype?.nl || null, tipCount);
      for (const tip of tips) {
        stream.sendTip(tip);
      }

      // ── Step 3: Streaming LLM optimization ──────────────────────────────
      let fullOutput = '';

      const streamResponse = await this.anthropic.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: buildSystemPrompt(intent, subtype),
        messages: [{ role: 'user', content: prompt }],
      });

      for await (const event of streamResponse) {
        if (
          event.type === 'content_block_delta' &&
          event.delta?.type === 'text_delta'
        ) {
          const text = event.delta.text;
          fullOutput += text;
          stream.sendChunk(text);
        }
      }

      // ── Step 4: Quality score ────────────────────────────────────────────
      const quality = scorePrompt(prompt, fullOutput);
      stream.sendQuality(quality.score, quality.label, quality.breakdown);

      stream.done();

    } catch (err) {
      stream.error(err.message || 'Optimization failed');
    }
  }

  /**
   * Return tips only (non-streaming JSON).
   * @param {string} prompt
   * @param {{ intentHint?: string, count?: number }} options
   * @returns {{ intent, confidence, tips }}
   */
  getTipsOnly(prompt, { intentHint = null, count = 5 } = {}) {
    const classification = this.classifier.classify(prompt, intentHint);
    const { intent, confidence, subtype } = classification;
    const { tips, fromCache, generatedMs } = this.tipEngine.getTips(
      intent,
      subtype?.code || subtype?.nl || null,
      count
    );
    return { intent, confidence, subtype, tips, fromCache, generatedMs };
  }
}
