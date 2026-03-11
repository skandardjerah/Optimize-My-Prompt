/**
 * FeatureExtractor — keyword sets and token utilities shared by IntentClassifier.
 * Tokenizes by splitting on non-alpha characters so "Node.js" → ["node","js"],
 * "async/await" → ["async","await"], etc.
 */
export class FeatureExtractor {
  constructor() {
    // Actual programming language keywords (appear inside code)
    this.codeKeywords = new Set([
      'function', 'class', 'const', 'let', 'var', 'import', 'export', 'def', 'return',
      'async', 'await', 'promise', 'callback', 'interface', 'type', 'struct', 'enum',
      'public', 'private', 'protected', 'static', 'void', 'null', 'undefined',
      'true', 'false', 'new', 'this', 'super', 'extends', 'implements', 'require',
      'module', 'prototype', 'string', 'number', 'boolean', 'int', 'float',
      'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue',
      'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'yield',
      // SQL keywords
      'select', 'from', 'join', 'where', 'group', 'having', 'order', 'insert',
      'update', 'delete', 'drop', 'alter', 'create', 'index', 'view',
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
      'algorithm', 'sorting', 'recursion', 'complexity', 'implementation',
      'hook', 'hooks', 'component', 'render', 'state', 'props', 'redux', 'context',
      'async', 'await', 'promise', 'callback', 'closure', 'prototype', 'decorator',
      'repository', 'pipeline', 'microservice', 'microservices', 'monolith', 'serverless',
      'cache', 'caching', 'pagination', 'authentication', 'authorization', 'encryption',
      'hash', 'heap', 'stack', 'queue', 'tree', 'graph', 'linked', 'binary',
      'server', 'client', 'frontend', 'backend', 'fullstack', 'devops',
      'css', 'html', 'dom', 'flexbox', 'grid', 'viewport', 'responsive',
      'regex', 'parser', 'compiler', 'runtime', 'bytecode', 'memory', 'thread',
      'mutex', 'concurrency', 'parallelism', 'socket', 'port', 'protocol',
      'json', 'xml', 'yaml', 'csv', 'orm', 'crud', 'mvc', 'sdk', 'cli',
      // Additional specifics
      'node', 'js', 'ts', 'py', 'rb', 'go', 'rs',
      'framework', 'library', 'package', 'module', 'dependency', 'scaffold',
      'lint', 'test', 'mock', 'stub', 'coverage', 'deployment', 'production', 'staging',
      'code', 'coding', 'codebase', 'refactor', 'debug', 'breakpoint', 'exception',
      'interface', 'abstract', 'generic', 'polymorphism', 'inheritance', 'encapsulation',
      'variable', 'function', 'method', 'class', 'object', 'array', 'loop', 'iteration',
      'script', 'automation', 'build', 'compile', 'transpile', 'bundle',
    ]);

    // Words that signal educational/documentation writing — key HYBRID indicator
    this.hybridTriggers = new Set([
      'tutorial', 'guide', 'documentation', 'readme', 'walkthrough', 'overview',
      'introduction', 'blog', 'article', 'course', 'lesson', 'examples', 'example',
      'postmortem', 'report', 'specification', 'spec', 'whitepaper', 'presentation',
      'comparison', 'explanation', 'implementation', 'handbook', 'cheatsheet',
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
