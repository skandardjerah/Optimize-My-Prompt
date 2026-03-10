/**
 * IntentClassifier - Detects user intent from their message
 */
export class IntentClassifier {
  constructor() {
    // Define keyword patterns for each intent
    this.patterns = {
      'sql_query': [
        /\b(database|sql|query|select|table|join|where)\b/i,
        /\b(show me|get|find|list|count|sum|give me|fetch|retrieve)\b.*\b(users|data|records|rows)\b/i,
        /\b(create|insert|update|delete)\b.*\b(table|record)\b/i,
        /\b(users who|get all|find all|list all)\b/i
      ],
      'code_review': [
        /\b(review|check|analyze|audit|inspect)\b.*\b(code|function|script)\b/i,
        /\b(bug|error|issue|problem)\b.*\b(code|my code|this code)\b/i,
        /\b(improve|optimize|refactor)\b.*\b(code)\b/i,
        /\b(security|vulnerability|performance)\b.*\b(check|review)\b/i
      ],
      'prompt_enhancement': [
        /\b(improve|enhance|better|optimize)\b.*\b(prompt|question|query)\b/i,
        /\b(help me (ask|write|phrase))\b/i,
        /\b(rephrase|rewrite)\b/i,
        /how (do i|can i|should i) (ask|write|phrase)/i
      ]
    };
  }

  /**
   * Classify user message using context-first approach, then pattern matching
   * @param {string} userMessage - The user's input message
   * @param {Object} context - Additional context (schema, code, etc.)
   * @returns {string} - The detected intent
   */
  classify(userMessage, context = {}) {
    const lowerMessage = userMessage.toLowerCase();

    console.log('🔍 IntentClassifier received context:', context);
    console.log('🔍 Context.code exists?', !!(context && context.code));
    console.log('🔍 Context.schema exists?', !!(context && context.schema));
    console.log('🔍 Message:', userMessage);

    // PRIORITY 1: If schema is provided with parenthesis, it's ALWAYS SQL query
    if (context && context.schema && context.schema.trim().length > 0) {
      if (context.schema.includes('(') && context.schema.includes(')')) {
        console.log('✅ Valid schema with parenthesis detected → sql_query');
        return 'sql_query';
      } else {
        console.log('⚠️ Schema provided but invalid format (no parenthesis)');
      }
    }

    // PRIORITY 3: If actual code is provided in context, validate and classify
    if (context && context.code && context.code.trim().length > 0) {
      // Validate that it's actually code
      if (!this.isActualCode(context.code)) {
        console.log('❌ Text in code field is not actual code → prompt_enhancement');
        return 'prompt_enhancement';
      }
      console.log('✅ Code detected in context → code_review');
      return 'code_review';
    }

    // PRIORITY 4: Pattern matching fallback
    for (const [intent, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(userMessage)) {
          console.log(`✅ Pattern matched → ${intent}`);
          return intent;
        }
      }
    }
    
    // Default to prompt enhancement if no match
    console.log('✅ No match, defaulting → prompt_enhancement');
    return 'prompt_enhancement';
  }

  /**
   * Check if the input is actually code
   * @param {string} text - The text to check
   * @returns {boolean} - True if it's code, false otherwise
   */
  isActualCode(text) {
    const trimmedText = text.trim();
    
    // Too short to be code
    if (trimmedText.length < 10) {
      return false;
    }

    // Check for code-like patterns
    const codePatterns = [
      /function\s+\w+\s*\(/i,           // function declarations
      /\bclass\s+\w+/i,                 // class declarations
      /\bdef\s+\w+\s*\(/i,              // Python function
      /\bconst\s+\w+\s*=/i,             // const declarations
      /\blet\s+\w+\s*=/i,               // let declarations
      /\bvar\s+\w+\s*=/i,               // var declarations
      /\bpublic\s+(class|void|static)/i, // Java/C# keywords
      /\bprivate\s+(class|void|static)/i,
      /\bif\s*\(/i,                     // if statements
      /\bfor\s*\(/i,                    // for loops
      /\bwhile\s*\(/i,                  // while loops
      /\breturn\s+/i,                   // return statements
      /\bimport\s+/i,                   // imports
      /\bfrom\s+\w+\s+import/i,         // Python imports
      /#include\s*</i,                  // C/C++ includes
      /\{[\s\S]*\}/,                    // Code blocks with braces
      /SELECT\s+.*\s+FROM/i,            // SQL queries
      /<\?php/i,                        // PHP
      /\bfn\s+\w+/i,                    // Rust function
      /\bfunc\s+\w+/i,                  // Go function
      /<html|<div|<body|<script/i,      // HTML
      /\.(class|id)\s*\{/,              // CSS
      /=>|::|->|\[\]|\(\)/,             // Common code symbols
    ];

    // If at least one code pattern matches, it's code
    const hasCodePattern = codePatterns.some(pattern => pattern.test(trimmedText));
    
    if (!hasCodePattern) {
      return false;
    }

    // Additional check: if it's mostly English sentences, probably not code
    const sentences = trimmedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = trimmedText.split(/\s+/);
    
    // If many sentences and few code symbols, it's probably text
    if (sentences.length > 3 && words.length > 20) {
      const hasCodeSymbols = /[{}()\[\];=<>]/.test(trimmedText);
      if (!hasCodeSymbols) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get confidence score for classification
   * @param {string} userMessage - The user's input message
   * @param {Object} context - Additional context (schema, code, etc.)
   * @returns {Object} - Intent with confidence scores
   */
  classifyWithConfidence(userMessage, context = {}) {
    // Use context-first approach
    const intent = this.classify(userMessage, context);
    
    const scores = {};
    
    // Score each intent based on patterns
    for (const [intentType, patterns] of Object.entries(this.patterns)) {
      let matchCount = 0;
      for (const pattern of patterns) {
        if (pattern.test(userMessage)) {
          matchCount++;
        }
      }
      scores[intentType] = matchCount;
    }
    
    // If context determined intent, boost its score
    if (context && context.code && intent === 'code_review') {
      scores['code_review'] = (scores['code_review'] || 0) + 10;
    }
    if (context && context.schema && intent === 'sql_query') {
      scores['sql_query'] = (scores['sql_query'] || 0) + 10;
    }
    
    // Calculate confidence
    const totalPatterns = Object.values(this.patterns).reduce(
      (sum, patterns) => sum + patterns.length, 0
    );
    const maxScore = Math.max(...Object.values(scores));
    const confidence = maxScore / (totalPatterns + 10); // +10 for context boost
    
    return {
      intent: intent,
      confidence: Math.min(confidence, 1.0), // Cap at 1.0
      scores: scores
    };
  }

  /**
   * Add a new pattern for an intent
   * @param {string} intent - The intent name
   * @param {RegExp} pattern - The regex pattern to match
   */
  addPattern(intent, pattern) {
    if (!this.patterns[intent]) {
      this.patterns[intent] = [];
    }
    this.patterns[intent].push(pattern);
  }
}
