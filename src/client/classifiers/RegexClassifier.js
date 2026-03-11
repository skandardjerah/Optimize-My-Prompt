/**
 * RegexClassifier — Tier 1 Client-Side Classifier
 * Runs synchronously in <5ms after 300ms debounce.
 * Outputs a quick intent badge without an API roundtrip.
 * Compatible with ES modules in modern browsers.
 */
export class RegexClassifier {
  constructor() {
    this.CODE_SIGNALS = {
      strong: [
        /\b(function|class|const|let|var|import|export|def|return|async|await)\b/,
        /[{};].*[{};]/,                        // multiple code punctuation
        /```[\s\S]*?```/,                       // markdown code fence
        /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP)\b.*\bFROM\b|\bWHERE\b/i, // SQL
        /=>/,                                   // arrow function
      ],
      medium: [
        /\b(algorithm|variable|loop|endpoint|middleware|schema)\b/i,
        /\b(debug|refactor|implement|parse|compile|deploy|optimize)\b/i,
        /\b(javascript|typescript|python|react|node|express|sql|api|jwt|docker)\b/i,
        /\b(if|else|for|while|try|catch)\s*\(/,
      ],
    };

    this.NL_SIGNALS = {
      strong: [
        /\b(write me|tell me|what is|how do i|help me|explain to)\b/i,
        /\b(essay|blog post|story|poem|email|letter|speech|cover letter)\b/i,
        /\b(marketing|strategy|business plan|proposal|presentation)\b/i,
      ],
      medium: [
        /\b(please|I (want|need|would like)|could you|can you)\b/i,
        /\b(creative|professional|persuasive|casual|formal) (writing|tone|style)\b/i,
        /\b(summarize|brainstorm|compare|discuss|describe)\b/i,
      ],
    };
  }

  /**
   * Classify a prompt into CODE, NATURAL_LANGUAGE, or HYBRID.
   * @param {string} prompt
   * @returns {{ intent: string, codeScore: number, nlScore: number, tier: number }}
   */
  classify(prompt) {
    let codeScore = 0;
    let nlScore = 0;

    for (const pattern of this.CODE_SIGNALS.strong) {
      if (pattern.test(prompt)) codeScore += 3;
    }
    for (const pattern of this.CODE_SIGNALS.medium) {
      if (pattern.test(prompt)) codeScore += 1;
    }
    for (const pattern of this.NL_SIGNALS.strong) {
      if (pattern.test(prompt)) nlScore += 3;
    }
    for (const pattern of this.NL_SIGNALS.medium) {
      if (pattern.test(prompt)) nlScore += 1;
    }

    const diff = Math.abs(codeScore - nlScore);
    const isHybrid = diff < 3 && codeScore > 0 && nlScore > 0;

    let intent;
    if (isHybrid) intent = 'HYBRID';
    else if (codeScore > nlScore) intent = 'CODE';
    else if (nlScore > codeScore) intent = 'NATURAL_LANGUAGE';
    else intent = 'NATURAL_LANGUAGE'; // default

    return { intent, codeScore, nlScore, tier: 1 };
  }
}
