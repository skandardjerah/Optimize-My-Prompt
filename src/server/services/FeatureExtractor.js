/**
 * FeatureExtractor — keyword sets and token utilities shared by IntentClassifier.
 * Tokenizes by splitting on non-alpha characters so "Node.js" → ["node","js"],
 * "async/await" → ["async","await"], etc.
 */
export class FeatureExtractor {
  constructor() {
    // Actual programming language keywords (appear inside code)
    // INCLUSION RULE: only keep tokens that almost never appear in natural English prose.
    // Excluded: SQL words (caught by Stage 1), and ambiguous English words like
    // for/while/if/else/class/new/this/return/null/true/false/type/string/number.
    this.codeKeywords = new Set([
      // Variable / scope declarators
      'const', 'var', 'def', 'let',
      // Type keywords
      'typeof', 'instanceof', 'boolean', 'struct', 'enum', 'undefined',
      // Async primitives (also in techDomain — double-signal is intentional)
      'async', 'await', 'yield',
      // Module system
      'import', 'export', 'require',
      // OOP — rare in NL prose
      'extends', 'implements',
      // Low-ambiguity numeric types
      'int', 'float',
      // Exception keyword (less common than try/catch in English)
      'throw',
    ]);

    // Programming-specific vocabulary — strongest CODE domain signal
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
      'websocket', 'websockets',   // both singular and plural
      'garbage', 'collection',     // garbage collection
      // ML / AI terms
      'gradient', 'descent', 'neural', 'pytorch', 'tensorflow', 'keras',
      'embedding', 'tensor', 'backpropagation', 'epoch', 'inference',
      // Additional specifics
      'node', 'js', 'ts', 'py', 'rb', 'go', 'rs',
      'framework', 'library', 'package', 'module', 'dependency', 'scaffold',
      'lint', 'mock', 'stub', 'coverage', 'deployment', 'production', 'staging',
      'coding', 'codebase', 'refactor', 'debug', 'breakpoint', 'exception',
      'interface', 'abstract', 'generic', 'generics', 'polymorphism', 'inheritance', 'encapsulation',
      'variable', 'function', 'method', 'class', 'object', 'array', 'loop', 'iteration',
      'script', 'automation', 'build', 'compile', 'transpile', 'bundle',
      // NOTE: 'code' and 'coding' are intentionally excluded — they appear in natural-language
      // requests ("write a code for X") and cause false CODE classifications. Specific signals
      // like language names, frameworks, and constructs are sufficient for real code prompts.
    ]);

    // Words that signal educational/documentation writing — key HYBRID indicator
    this.hybridTriggers = new Set([
      'tutorial', 'guide', 'documentation', 'readme', 'walkthrough', 'overview',
      'introduction', 'blog', 'article', 'course', 'lesson', 'examples', 'example',
      'postmortem', 'report', 'specification', 'spec', 'whitepaper', 'presentation',
      'comparison', 'explanation', 'implementation', 'handbook', 'cheatsheet',
      'study', 'analysis', 'primer', 'notes', 'breakdown', 'explainer',
      'difference', 'differences', 'roadmap', 'document',
    ]);

    // Natural language writing/task keywords
    this.nlKeywords = new Set([
      'write', 'explain', 'describe', 'tell', 'show', 'help', 'make',
      'give', 'list', 'what', 'how', 'why', 'when', 'where', 'who', 'which',
      'please', 'could', 'would', 'should', 'need', 'want', 'think', 'feel',
      'understand', 'summarize', 'analyze', 'discuss', 'compare', 'suggest',
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
  }

  /**
   * Tokenize prompt into clean alpha sub-tokens.
   * "Node.js" → ["node","js"], "async/await" → ["async","await"]
   */
  tokenize(prompt) {
    return prompt.toLowerCase().split(/[^a-z]+/).filter(t => t.length > 1);
  }

  /**
   * Count occurrences of tokens that belong to each domain set.
   * Returns { techCount, nlCount, hybridCount, creativeCount, businessCount,
   *           scientificCount, codeKwCount }
   */
  countDomains(prompt) {
    const tokens = this.tokenize(prompt);
    let tech = 0, nl = 0, hybrid = 0, creative = 0, business = 0, scientific = 0, codeKw = 0;
    for (const t of tokens) {
      if (this.techDomain.has(t)) tech++;
      if (this.nlKeywords.has(t)) nl++;
      if (this.hybridTriggers.has(t)) hybrid++;
      if (this.creativeDomain.has(t)) creative++;
      if (this.businessDomain.has(t)) business++;
      if (this.scientificDomain.has(t)) scientific++;
      if (this.codeKeywords.has(t)) codeKw++;
    }
    return { tech, nl, hybrid, creative, business, scientific, codeKw, total: tokens.length };
  }
}
