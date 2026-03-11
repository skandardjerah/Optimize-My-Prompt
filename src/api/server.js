import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PromptEngineerAgent } from '../agent/PromptEngineerAgent.js';
import helmet from 'helmet';
import { apiLimiter, enhanceLimiter } from './middleware/rateLimiter.js';
import { IntentClassifier } from '../server/services/IntentClassifier.js';
import { PromptOptimizer } from '../server/services/PromptOptimizer.js';
import { StreamHandler } from '../server/services/StreamHandler.js';
import { validateClassifyRequest } from '../server/middleware/requestValidator.js';
import { errorHandler } from '../server/middleware/errorHandler.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(helmet());
app.use('/api/', apiLimiter);

const agent = new PromptEngineerAgent({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const classifier = new IntentClassifier();
const optimizer = new PromptOptimizer({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/classify', validateClassifyRequest, (req, res, next) => {
  try {
    const result = classifier.classify(req.body.prompt, req.body.intentHint || null);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    service: 'Prompt Engineer Agent'
  });
});

app.post('/api/process', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required'
      });
    }
    
    console.log('📨 Received request:', { message, context }); // DEBUG
    
    const result = await agent.processRequest(message, context || {});
    
    console.log('✅ Detected intent:', result.intent); // DEBUG
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

app.get('/api/prompts', (req, res) => {
  const prompts = agent.promptLibrary.listPrompts();
  res.json({
    count: prompts.length,
    prompts: prompts
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Prompt Engineer Agent',
    version: '1.0.0',
    description: 'AI agent that enhances prompts',
    features: [
      'Prompt Enhancement',
      'SQL Generation',
      'Code Review'
    ]
  });
});

// Get conversation history
app.get('/api/conversation/:id', (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = agent.conversationStore.getConversation(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({
      id: conversation.id,
      messageCount: conversation.messages.length,
      messages: conversation.messages,
      createdAt: conversation.createdAt,
      lastActivity: conversation.lastActivity
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation statistics
app.get('/api/stats', (req, res) => {
  const stats = agent.conversationStore.getStats();
  res.json(stats);
});

// Clear old conversations
app.post('/api/cleanup', (req, res) => {
  const maxAgeHours = req.body.maxAgeHours || 24;
  agent.conversationStore.cleanup(maxAgeHours);
  res.json({ success: true, message: 'Cleanup completed' });
});

// Analytics endpoints
app.get('/api/analytics', (req, res) => {
  res.json(agent.analytics.getMetrics());
});

app.get('/api/analytics/summary', (req, res) => {
  res.json(agent.analytics.getSummary());
});

app.get('/api/logs', (req, res) => {
  const lines = parseInt(req.query.lines) || 50;
  res.json(agent.logger.getRecentLogs(lines));
});

// Feedback endpoints
app.post('/api/feedback', (req, res) => {
  const { conversationId, rating, comment, promptId } = req.body;
  agent.feedbackCollector.collect({ conversationId, rating, comment, promptId });
  res.json({ success: true });
});

app.get('/api/feedback/analysis', (req, res) => {
  res.json(agent.feedbackCollector.analyze());
});

app.post('/api/templates', (req, res) => {
  try {
    const template = agent.templateBuilder.create(req.body);
    res.json({ success: true, template });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/templates', (req, res) => {
  res.json(agent.templateBuilder.list());
});

app.get('/api/templates/:id', (req, res) => {
  try {
    const template = agent.templateBuilder.get(req.params.id);
    res.json(template);
  } catch (error) {
    res.status(404).json({ error: 'Template not found' });
  }
});

// Improve code endpoint
app.post('/api/improve-code', async (req, res) => {
  try {
    const { code, language, instructions } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Auto-detect language if not provided
    let detectedLanguage = language || 'Auto-detect';
    
    if (detectedLanguage === 'Auto-detect') {
      detectedLanguage = agent.enhancer.detectLanguage(code);
      console.log(`🔍 Auto-detected language for improvement: ${detectedLanguage}`);
    }

    const userInstructions = instructions || 'Review this code';

    const improvePrompt = `You are an expert ${detectedLanguage} developer. The user requested: "${userInstructions}"

Here is the ${detectedLanguage} code that was reviewed:

\`\`\`${detectedLanguage.toLowerCase()}
${code}
\`\`\`

Based on the user's request and the review findings, provide an improved version of this code. 

Return ONLY a JSON object with this structure:
{
  "improved_code": "the complete improved ${detectedLanguage} code here",
  "changes_made": ["list of changes", "you made to", "improve the code based on the user's request"]
}

CRITICAL: Return ONLY the JSON object. Start with { and end with }. NO markdown, NO backticks, NO code blocks.
IMPORTANT: Keep the code in ${detectedLanguage}, do NOT convert it to another language.`;

    const response = await agent.enhancer.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: improvePrompt }]
    });

    let text = response.content[0].text;
    text = agent.enhancer.cleanJSON(text);
    
    const result = JSON.parse(text);

    res.json({
      success: true,
      improvedCode: result.improved_code,
      changes: result.changes_made,
      language: detectedLanguage
    });

  } catch (error) {
    console.error('Code improvement error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate improved code' 
    });
  }
});
// POST /api/optimize — SSE streaming optimization pipeline
app.post('/api/optimize', enhanceLimiter, async (req, res) => {
  const { prompt, intentHint, tipCount } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'prompt is required' });
  }
  if (prompt.trim().length > 10000) {
    return res.status(400).json({ error: 'prompt must be 10 000 characters or fewer' });
  }

  const stream = new StreamHandler(res);
  await optimizer.optimize(prompt.trim(), stream, {
    intentHint: intentHint || null,
    tipCount: Math.min(parseInt(tipCount) || 4, 8),
  });
});

// POST /api/tips — tips-only (non-streaming JSON)
app.post('/api/tips', apiLimiter, (req, res, next) => {
  try {
    const { prompt, intentHint, count } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const result = optimizer.getTipsOnly(prompt.trim(), {
      intentHint: intentHint || null,
      count: Math.min(parseInt(count) || 5, 10),
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.listen(port, () => {
  console.log('\n🚀 Prompt Engineer Agent API');
  console.log('================================');
  console.log(`📡 Server: http://localhost:${port}`);
  console.log(`🏥 Health: http://localhost:${port}/health`);
  console.log(`ℹ️  Info: http://localhost:${port}/api/info`);
  console.log('================================\n');
});

app.use(errorHandler);

export default app;