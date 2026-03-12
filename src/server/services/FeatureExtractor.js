/**
 * FeatureExtractor — keyword sets and token utilities shared by IntentClassifier.
 * Tokenizes by splitting on non-alpha characters so "Node.js" → ["node","js"],
 * "async/await" → ["async","await"], etc.
 *
 * Context-aware scoring: each domain set has a dedicated scorer that examines
 * ±windowSize neighbours around every matched token.  Same-domain neighbours
 * reinforce the score (+0.3 each).  When matches from multiple domains are found,
 * scoreDomains() uses the full prompt token list to resolve ambiguity — tech/code
 * matches whose local window contains NL keywords are softened, since the user is
 * likely asking ABOUT the technology in natural language rather than requesting code.
 */
export class FeatureExtractor {
  constructor() {
    // Actual programming language keywords (appear inside code).
    // INCLUSION RULE: only keep tokens that almost never appear in natural English prose.
    this.codeKeywords = new Set([
      // Variable / scope declarators
      'const', 'var', 'def', 'let',
      // Type keywords
      'typeof', 'instanceof', 'boolean', 'struct', 'enum', 'undefined',
      // Async primitives
      'async', 'await', 'yield',
      // Module system
      'import', 'export', 'require',
      // OOP — rare in NL prose
      'extends', 'implements',
      // Low-ambiguity numeric types
      'int', 'float',
      // Exception keyword
      'throw',
    ]);

    // Programming-specific vocabulary — strongest CODE domain signal.
    this.techDomain = new Set([
      // Languages & runtimes
      'javascript', 'typescript', 'python', 'java', 'ruby', 'go', 'rust', 'php',
      'swift', 'kotlin', 'scala', 'haskell', 'bash', 'shell', 'powershell', 'perl',
      // Frameworks & libraries
      'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'express', 'fastify',
      'django', 'flask', 'rails', 'spring', 'laravel', 'nestjs', 'graphql',
      // Databases
      'sql', 'nosql', 'postgresql', 'mysql', 'sqlite', 'mongodb', 'redis', 'cassandra',
      'firebase', 'supabase', 'dynamodb', 'elasticsearch',
      // Infrastructure & tooling
      'docker', 'kubernetes', 'nginx', 'webpack', 'vite', 'babel', 'eslint', 'jest',
      'mocha', 'cypress', 'git', 'github', 'gitlab', 'ci', 'cd', 'npm', 'yarn', 'pip',
      'aws', 'azure', 'gcp', 'heroku', 'vercel', 'netlify', 'terraform', 'ansible',
      // Concepts & constructs
      'api', 'rest', 'http', 'cors', 'jwt', 'oauth', 'websocket', 'sse', 'grpc',
      'database', 'schema', 'migration', 'query', 'endpoint', 'middleware', 'webhook',
      'algorithm', 'sorting', 'recursion', 'complexity',
      'hook', 'hooks', 'component', 'render', 'state', 'props', 'redux', 'context',
      'async', 'await', 'promise', 'promises', 'callback', 'callbacks', 'closure', 'closures',
      'prototype', 'decorator', 'decorators', 'generator', 'generators', 'iterator', 'iterators',
      'repository', 'pipeline', 'microservice', 'microservices', 'monolith', 'serverless',
      'cache', 'caching', 'pagination', 'authentication', 'authorization', 'encryption',
      'hash', 'heap', 'stack', 'queue', 'tree', 'graph', 'linked', 'binary',
      'server', 'client', 'frontend', 'backend', 'fullstack', 'devops',
      'css', 'html', 'dom', 'flexbox', 'grid', 'viewport', 'responsive',
      'regex', 'parser', 'compiler', 'runtime', 'bytecode', 'memory', 'thread',
      'mutex', 'concurrency', 'parallelism', 'socket', 'port', 'protocol',
      'json', 'xml', 'yaml', 'csv', 'orm', 'crud', 'mvc', 'sdk', 'cli',
      'websockets',
      'garbage', 'collection',     // garbage collection
      // ML / AI terms
      'gradient', 'descent', 'neural', 'pytorch', 'tensorflow', 'keras',
      'embedding', 'tensor', 'backpropagation', 'epoch', 'inference',
      // Additional specifics
      'node', 'js', 'ts', 'py', 'rb', 'rs',
      'framework', 'library', 'package', 'module', 'dependency', 'scaffold',
      'lint', 'mock', 'stub', 'coverage', 'deployment', 'production', 'staging',
      'coding', 'codebase', 'refactor', 'debug', 'breakpoint', 'exception',
      'interface', 'abstract', 'generic', 'generics', 'polymorphism', 'inheritance', 'encapsulation',
      'variable', 'function', 'method', 'class', 'object', 'array', 'loop', 'iteration',
      'script', 'automation', 'build', 'compile', 'transpile', 'bundle',
    ]);

    // Words that signal educational/documentation writing — key HYBRID indicator.
    this.hybridTriggers = new Set([
      'tutorial', 'guide', 'documentation', 'readme', 'walkthrough', 'overview',
      'introduction', 'blog', 'article', 'course', 'lesson', 'examples', 'example',
      'postmortem', 'report', 'specification', 'spec', 'whitepaper', 'presentation',
      'comparison', 'explanation', 'implementation', 'handbook', 'cheatsheet',
      'study', 'analysis', 'primer', 'notes', 'breakdown', 'explainer',
      'difference', 'differences', 'roadmap', 'document',
    ]);

    // Natural language writing/task keywords.
    this.nlKeywords = new Set([
      'write', 'explain', 'describe', 'tell', 'show', 'help', 'make',
      'give', 'list', 'what', 'how', 'why', 'when', 'where', 'who', 'which',
      'please', 'could', 'would', 'should', 'need', 'want', 'think', 'feel',
      'understand', 'summarize', 'analyze', 'discuss', 'compare', 'suggest',
      'interested', 'plan', 'learning', 'studying', 'looking',
    ]);

    this.creativeDomain = new Set([
      'story', 'poem', 'essay', 'blog', 'creative', 'fiction', 'narrative',
      'character', 'plot', 'metaphor', 'tone', 'voice', 'novel', 'screenplay',
      'script', 'lyrics', 'prose', 'dialogue', 'genre', 'theme',
    ]);

    this.businessDomain = new Set([
      'strategy', 'marketing', 'revenue', 'customer', 'product', 'market',
      'business', 'company', 'growth', 'roi', 'sales', 'proposal',
      'stakeholder', 'roadmap', 'kpi', 'metrics', 'brand', 'startup', 'investor',
      'pitch', 'budget', 'forecast', 'acquisition', 'retention', 'conversion',
    ]);

    this.scientificDomain = new Set([
      'research', 'hypothesis', 'experiment', 'methodology', 'results',
      'conclusion', 'statistical', 'scientific', 'survey', 'correlation',
      'causation', 'sample', 'population', 'peer',
    ]);

    // Common English prose function words — used ONLY by scoreCodeIntent to
    // distinguish natural-language sentences from actual code blocks.
    // Not part of the main vote system.
    this.proseIndicators = new Set([
      'is', 'are', 'was', 'were', 'be', 'been', 'am',
      'the', 'an', 'me', 'my', 'your', 'our', 'its',
      'it', 'this', 'that', 'these', 'those',
      'do', 'does', 'did', 'have', 'has', 'had',
      'not', 'but', 'and', 'or', 'so', 'also',
    ]);
  }

  /**
   * Tokenize prompt into clean sub-tokens, supporting Unicode letters.
   * "Node.js" → ["node","js"], "async/await" → ["async","await"]
   * Accented and non-Latin letters (é, ñ, Cyrillic, Arabic) are preserved.
   */
  tokenize(prompt) {
    return prompt.toLowerCase().split(/[^\p{L}]+/u).filter(t => t.length > 1);
  }

  /**
   * Shared context-window scorer used by every per-domain method.
   *
   * For each token that belongs to `domainSet`:
   *   - Adds +1 (base match)
   *   - Inspects the `windowSize` tokens on each side
   *   - Adds +0.3 for every same-domain neighbour found (cluster reinforcement)
   *
   * @param {string[]} tokens     Full tokenized prompt array.
   * @param {Set<string>} domainSet
   * @param {number} windowSize   Tokens to inspect on each side (default 5).
   * @returns {{ score: number, matches: Array<{token: string, index: number, context: string[]}> }}
   */
  _scoreSet(tokens, domainSet, windowSize = 5) {
    let score = 0;
    const matches = [];

    for (let i = 0; i < tokens.length; i++) {
      if (!domainSet.has(tokens[i])) continue;

      score += 1;

      const start = Math.max(0, i - windowSize);
      const end   = Math.min(tokens.length - 1, i + windowSize);
      const context = [];

      for (let j = start; j <= end; j++) {
        if (j === i) continue;
        const neighbour = tokens[j];
        context.push(neighbour);
        if (domainSet.has(neighbour)) score += 0.3;
      }

      matches.push({ token: tokens[i], index: i, context });
    }

    return { score, matches };
  }

  /**
   * Context-aware scorer for programming language keywords (codeKeywords).
   * Reinforces when low-level syntax tokens cluster together in the prompt.
   */
  scoreCodeKeywords(tokens, windowSize = 5) {
    return this._scoreSet(tokens, this.codeKeywords, windowSize);
  }

  /**
   * Context-aware scorer for tech/framework/library vocabulary (techDomain).
   * Reinforces when multiple tech terms appear near each other (e.g. "React with TypeScript").
   */
  scoreTechDomain(tokens, windowSize = 5) {
    return this._scoreSet(tokens, this.techDomain, windowSize);
  }

  /**
   * Context-aware scorer for educational/doc-writing triggers (hybridTriggers).
   * Reinforces when educational terms cluster (e.g. "tutorial guide walkthrough").
   */
  scoreHybridTriggers(tokens, windowSize = 5) {
    return this._scoreSet(tokens, this.hybridTriggers, windowSize);
  }

  /**
   * Context-aware scorer for natural-language request words (nlKeywords).
   * Reinforces when conversational intent words appear together (e.g. "how would you explain").
   */
  scoreNlKeywords(tokens, windowSize = 5) {
    return this._scoreSet(tokens, this.nlKeywords, windowSize);
  }

  /**
   * Context-aware scorer for creative writing vocabulary (creativeDomain).
   * Reinforces when narrative/literary terms cluster (e.g. "story plot character").
   */
  scoreCreativeDomain(tokens, windowSize = 5) {
    return this._scoreSet(tokens, this.creativeDomain, windowSize);
  }

  /**
   * Context-aware scorer for business vocabulary (businessDomain).
   * Reinforces when commercial terms cluster (e.g. "revenue growth roi").
   */
  scoreBusinessDomain(tokens, windowSize = 5) {
    return this._scoreSet(tokens, this.businessDomain, windowSize);
  }

  /**
   * Context-aware scorer for scientific vocabulary (scientificDomain).
   * Reinforces when research terms cluster (e.g. "hypothesis experiment methodology").
   */
  scoreScientificDomain(tokens, windowSize = 5) {
    return this._scoreSet(tokens, this.scientificDomain, windowSize);
  }

  /**
   * Score all domain sets against the prompt with context-window reinforcement
   * and cross-domain ambiguity resolution.
   *
   * Single-domain prompt: scores are used as-is.
   *
   * Multi-domain prompt (≥2 domains active): the full token list is used as context.
   * For each tech/codeKw match, if any NL keyword appears in its local window, its
   * base contribution is softened by −0.5 — the user is likely asking ABOUT the
   * technology in natural language rather than requesting code generation.
   *
   * @param {string} prompt
   * @param {object|null} langConfig  Language config from src/i18n/languages.js.
   *   When provided, translated keyword arrays are merged with the base English Sets
   *   before scoring so non-English prompts are classified correctly.
   *   For CJK languages (langConfig.useSubstringMatch === true) a supplementary
   *   substring pass is added since the tokenizer cannot split continuous script.
   * @returns {{ tech, nl, hybrid, creative, business, scientific, codeKw, total, ambiguous }}
   */
  scoreDomains(prompt, langConfig = null) {
    const tokens = this.tokenize(prompt);

    // ── Build language-augmented Sets ────────────────────────────────────────
    // codeKeywords and techDomain stay English-only (universal for developers).
    // The NL-signal sets get merged with the translated equivalents.
    const hasLang = langConfig && (langConfig.nlKeywords?.length > 0);
    const nlSet       = hasLang ? new Set([...this.nlKeywords,       ...langConfig.nlKeywords])       : this.nlKeywords;
    const hybridSet   = hasLang ? new Set([...this.hybridTriggers,   ...langConfig.hybridTriggers])   : this.hybridTriggers;
    const creativeSet = hasLang ? new Set([...this.creativeDomain,   ...langConfig.creativeDomain])   : this.creativeDomain;
    const bizSet      = hasLang ? new Set([...this.businessDomain,   ...langConfig.businessDomain])   : this.businessDomain;
    const sciSet      = hasLang ? new Set([...this.scientificDomain, ...langConfig.scientificDomain]) : this.scientificDomain;

    const techResult     = this.scoreTechDomain(tokens);
    const codeKwResult   = this.scoreCodeKeywords(tokens);
    const hybridResult   = this._scoreSet(tokens, hybridSet);
    const nlResult       = this._scoreSet(tokens, nlSet);
    const creativeResult = this._scoreSet(tokens, creativeSet);
    const bizResult      = this._scoreSet(tokens, bizSet);
    const sciResult      = this._scoreSet(tokens, sciSet);

    let techScore   = techResult.score;
    let codeKwScore = codeKwResult.score;
    let nlScore     = nlResult.score;
    let hybridScore = hybridResult.score;
    let creativeScore = creativeResult.score;
    let bizScore    = bizResult.score;
    let sciScore    = sciResult.score;

    // ── CJK substring supplement ─────────────────────────────────────────────
    // For zh/ja the tokenizer cannot split continuous script into individual words.
    // Fall back to checking whether each translated keyword appears as a substring.
    if (langConfig?.useSubstringMatch) {
      const lower = prompt.toLowerCase();
      for (const kw of langConfig.nlKeywords       || []) { if (lower.includes(kw)) nlScore++;      }
      for (const kw of langConfig.hybridTriggers   || []) { if (lower.includes(kw)) hybridScore++;  }
      for (const kw of langConfig.creativeDomain   || []) { if (lower.includes(kw)) creativeScore++; }
      for (const kw of langConfig.businessDomain   || []) { if (lower.includes(kw)) bizScore++;     }
      for (const kw of langConfig.scientificDomain || []) { if (lower.includes(kw)) sciScore++;     }
    }

    // ── Cross-domain ambiguity resolution (whole-prompt context) ────────────
    const activeDomains = [
      techScore, codeKwScore, hybridScore,
      nlScore, creativeScore, bizScore, sciScore,
    ].filter(s => s > 0).length;

    const ambiguous = activeDomains >= 2;

    if (ambiguous) {
      // Tech matches: soften each one whose context window contains an NL keyword.
      for (const { context } of techResult.matches) {
        if (context.some(t => nlSet.has(t))) {
          techScore = Math.max(0, techScore - 0.5);
        }
      }
      // CodeKw matches: same softening.
      for (const { context } of codeKwResult.matches) {
        if (context.some(t => nlSet.has(t))) {
          codeKwScore = Math.max(0, codeKwScore - 0.5);
        }
      }
    }

    return {
      tech:       techScore,
      nl:         nlScore,
      hybrid:     hybridScore,
      creative:   creativeScore,
      business:   bizScore,
      scientific: sciScore,
      codeKw:     codeKwScore,
      total:      tokens.length,
      ambiguous,
    };
  }

  /**
   * Score how strongly the prompt appears to BE code (not just discuss it).
   *
   * For each matched codeKeyword, examine its ±5-token context window:
   *   - Neighbours from codeKeywords or techDomain, with NO prose/NL words nearby
   *     → the token sits inside actual code → high score (+1.5)
   *   - Neighbours include prose indicators or NL keywords
   *     → the token is being discussed in natural language → low score (+0.3)
   *   - Isolated (no neighbours from any set)
   *     → moderate signal (+0.8)
   *
   * A score ≥ 1.5 in IntentClassifier stage 3 means intent = CODE.
   *
   * @param {string[]} tokens
   * @param {object|null} langConfig
   * @returns {number}
   */
  scoreCodeIntent(tokens, langConfig = null) {
    const { matches } = this._scoreSet(tokens, this.codeKeywords);
    if (matches.length === 0) return 0;

    const nlSet = langConfig?.nlKeywords?.length
      ? new Set([...this.nlKeywords, ...langConfig.nlKeywords])
      : this.nlKeywords;

    let score = 0;
    for (const { context } of matches) {
      const hasNlNeighbour = context.some(
        t => nlSet.has(t) || this.proseIndicators.has(t)
      );
      const hasCodeNeighbour = context.some(
        t => this.codeKeywords.has(t) || this.techDomain.has(t)
      );

      if (hasNlNeighbour) {
        // Code keyword surrounded by prose — user is discussing code, not writing it
        score += 0.3;
      } else if (hasCodeNeighbour) {
        // Code keyword surrounded by other code/tech tokens — this IS code
        score += 1.5;
      } else {
        // Isolated code keyword — moderate signal
        score += 0.8;
      }
    }

    return score;
  }

  /**
   * @deprecated Use scoreDomains() — kept for backward compatibility with IntentClassifier.
   */
  countDomains(prompt) {
    return this.scoreDomains(prompt);
  }
}
