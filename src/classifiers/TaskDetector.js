/**
 * TaskDetector - Detects the type of task the user wants to accomplish
 * Used primarily for prompt enhancement
 */
export class TaskDetector {
  constructor() {
    // Define keywords for each task type
    this.keywords = {
      'creative_writing': [
        'write', 'story', 'article', 'blog', 'essay', 'creative',
        'novel', 'poem', 'script', 'content', 'post'
      ],
      'code_generation': [
        'code', 'function', 'script', 'program', 'implement',
        'create', 'build', 'develop', 'algorithm', 'class'
      ],
      'data_analysis': [
        'analyze', 'data', 'statistics', 'trends', 'insights',
        'chart', 'graph', 'report', 'metrics', 'dashboard'
      ],
      'explanation': [
        'explain', 'how', 'what', 'why', 'describe', 'tell me about',
        'understand', 'learn', 'teach', 'clarify'
      ],
      'problem_solving': [
        'solve', 'problem', 'solution', 'help with', 'fix',
        'debug', 'troubleshoot', 'resolve', 'figure out'
      ],
      'summarization': [
        'summarize', 'summary', 'brief', 'tldr', 'overview',
        'key points', 'main ideas', 'condense', 'shorten'
      ]
    };
  }

  /**
   * Detect task type from user message
   * @param {string} userMessage - The user's input message
   * @returns {string} - The detected task type
   */
  detect(userMessage) {
    const message = userMessage.toLowerCase();
    const scores = {};
    
    // Score each task type based on keyword matches
    for (const [task, words] of Object.entries(this.keywords)) {
      let score = 0;
      for (const word of words) {
        if (message.includes(word)) {
          score++;
        }
      }
      scores[task] = score;
    }
    
    // Find task with highest score
    let maxScore = 0;
    let detectedTask = 'general_query';
    
    for (const [task, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedTask = task;
      }
    }
    
    return detectedTask;
  }

  /**
   * Detect task with confidence score
   * @param {string} userMessage - The user's input message
   * @returns {Object} - Task type with confidence
   */
  detectWithConfidence(userMessage) {
    const message = userMessage.toLowerCase();
    const scores = {};
    let totalKeywords = 0;
    
    // Count all keywords
    for (const words of Object.values(this.keywords)) {
      totalKeywords += words.length;
    }
    
    // Score each task
    for (const [task, words] of Object.entries(this.keywords)) {
      let matchCount = 0;
      for (const word of words) {
        if (message.includes(word)) {
          matchCount++;
        }
      }
      scores[task] = matchCount;
    }
    
    // Find highest score
    let maxScore = 0;
    let detectedTask = 'general_query';
    
    for (const [task, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedTask = task;
      }
    }
    
    const confidence = maxScore / totalKeywords;
    
    return {
      task: detectedTask,
      confidence: confidence,
      scores: scores
    };
  }

  /**
   * Add keywords for a task type
   * @param {string} taskType - The task type
   * @param {Array} keywords - Array of keyword strings
   */
  addKeywords(taskType, keywords) {
    if (!this.keywords[taskType]) {
      this.keywords[taskType] = [];
    }
    this.keywords[taskType].push(...keywords);
  }
}