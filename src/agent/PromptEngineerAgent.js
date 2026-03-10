import { TemplateBuilder } from '../utils/TemplateBuilder.js';
import { Analytics } from '../utils/Analytics.js';
import { Logger } from '../utils/Logger.js';
import { createPromptLibrary } from '../prompt-library/index.js';
import { IntentClassifier } from '../classifiers/IntentClassifier.js';
import { TaskDetector } from '../classifiers/TaskDetector.js';
import { PromptEnhancer } from './PromptEnhancer.js';
import { ConversationStore } from './ConversationStore.js';
import { FeedbackCollector } from '../utils/FeedbackCollector.js'; 

/**
 * PromptEngineerAgent - Main agent that orchestrates everything
 */
export class PromptEngineerAgent {
  constructor(config) {
    this.promptLibrary = createPromptLibrary();
    this.feedbackCollector = new FeedbackCollector();
    this.templateBuilder = new TemplateBuilder(this.promptLibrary);
    this.intentClassifier = new IntentClassifier();
    this.taskDetector = new TaskDetector();
    this.enhancer = new PromptEnhancer(config.apiKey, this.promptLibrary);
    this.conversationStore = new ConversationStore();
    this.analytics = new Analytics();
    this.logger = new Logger();
  }

  /**
   * Process a user request
   * @param {string} userMessage - The user's message
   * @param {Object} context - Additional context (schema, code, etc.)
   * @returns {Object} - Result with type and data
   */
  async processRequest(userMessage, context = {}) {const startTime = Date.now();
  // Step 1: Get or create conversation
  const conversationId = context.conversationId || 
    this.conversationStore.createConversation(context.userId || 'anonymous');

  // Step 2: Store user message
  this.conversationStore.addMessage(conversationId, 'user', userMessage);

  // Step 3: Classify the intent
  const intentResult = this.intentClassifier.classifyWithConfidence(userMessage,context);
  const intent = intentResult.intent;

  console.log(`🎯 Detected Intent: ${intent} (${(intentResult.confidence * 100).toFixed(1)}% confidence)`);

  // Step 4: Get conversation context
  const conversationContext = this.conversationStore.getContext(conversationId);
  const mergedContext = { ...conversationContext, ...context };

  // Step 5: Route to appropriate handler
  let result;
  switch(intent) {
    case 'sql_query':
      result = await this.handleSqlQuery(userMessage, mergedContext);
      break;
    
    case 'code_review':
      result = await this.handleCodeReview(userMessage, mergedContext);
      break;
    
    case 'prompt_enhancement':
    default:
      result = await this.handlePromptEnhancement(userMessage, mergedContext);
  }

  // Step 6: Store assistant response
  this.conversationStore.addMessage(
    conversationId, 
    'assistant', 
    JSON.stringify(result)
  );

  // Step 7: Update context if needed
  if (result.result && result.result.success) {
    this.conversationStore.updateContext(conversationId, {
      lastIntent: intent,
      lastTaskType: result.taskType
    });
  }
  // Track analytics
  const duration = Date.now() - startTime;
  this.analytics.trackRequest(intent, duration, result.result?.success !== false);
  this.logger.info('Request processed', { intent, duration, conversationId });

  // Step 8: Return result with conversation ID
  return {
    ...result,
    conversationId: conversationId,
    messageCount: this.conversationStore.getMessages(conversationId).length
  };
}

  /**
   * Handle prompt enhancement requests
   */
  async handlePromptEnhancement(userMessage, context) {
    console.log('🔄 Enhancing prompt...');
    
    // Detect task type
    const taskResult = this.taskDetector.detectWithConfidence(userMessage);
    const taskType = taskResult.task;
    
    console.log(`📋 Detected Task: ${taskType}`);

    // Enhance the prompt
    const result = await this.enhancer.enhance(
      userMessage,
      taskType,
      context.outputFormat || 'natural'
    );

    return {
      type: 'prompt_enhancement',
      intent: 'prompt_enhancement',
      taskType: taskType,
      result: result
    };
  }

  /**
   * Handle SQL query requests
   */
  async handleSqlQuery(userMessage, context) {
    console.log('🔄 Generating SQL...');

    if (!context.schema) {
      return {
        type: 'sql_query',
        intent: 'sql_query',
        result: {
          success: false,
          error: 'Database schema is required for SQL generation'
        }
      };
    }

    const result = await this.enhancer.generateSQL(
      userMessage,
      context.schema,
      context.dialect || 'PostgreSQL'
    );

    return {
      type: 'sql_query',
      intent: 'sql_query',
      result: result
    };
  }

  /**
   * Handle code review requests
   */
  async handleCodeReview(userMessage, context) {
    console.log('🔄 Reviewing code...');

    if (!context.code) {
      return {
        type: 'code_review',
        intent: 'code_review',
        result: {
          success: false,
          error: 'Code is required for code review'
        }
      };
    }

    const result = await this.enhancer.reviewCode(
      context.code,
      context.language || 'JavaScript',
      context.focus || 'all'
    );

    return {
      type: 'code_review',
      intent: 'code_review',
      result: result
    };
  }
}