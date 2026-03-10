# OptimizeMyPrompt Project Guidelines

**OptimizeMyPrompt** is a production-ready Node.js/Express application that enhances prompts, reviews code, and generates SQL queries using the Anthropic Claude API with intelligent intent classification and routing.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm start` | Run production server (port 3000) |
| `npm run dev` | Run with nodemon for development |
| `npm test` | Run comprehensive test suite |
| `npm install` | Install dependencies (Node.js 18+) |

## Project Architecture

### Component Organization
The project follows **vertical feature slicing** with clear separation of concerns:

- **`src/agent/`** - Core orchestration
  - `PromptEngineerAgent.js` - Main request router (coordinates all components)
  - `PromptEnhancer.js` - Claude API integration  
  - `ConversationStore.js` - In-memory conversation management

- **`src/classifiers/`** - Intent detection
  - `IntentClassifier.js` - Classifies requests as `prompt_enhancement`, `code_review`, or `sql_generation`
  - `TaskDetector.js` - Identifies subtask types (e.g., brainstorming, analysis)

- **`src/prompt-library/`** - Template management
  - `PromptLibrary.js` - Loads and manages templates
  - `prompts/` - Feature-specific (promptEnhancement.js, codeReview.js, textToSql.js)

- **`src/api/`** - Express server & routing
  - `server.js` - 15+ REST endpoints, error handling, CORS
  - `middleware/rateLimiter.js` - 100 requests per 15 min per IP

- **`src/utils/`** - Shared utilities
  - `Analytics.js` - Request tracking and metrics
  - `Logger.js` - Console/file logging
  - `Cache.js` - Response caching (if used as fallback)
  - `FeedbackCollector.js` - User feedback aggregation
  - `TemplateBuilder.js` - Dynamic template generation

### Request Flow
1. User sends request to `/api/process`
2. `PromptEngineerAgent` classifies intent (IntentClassifier)
3. Routes to handler: prompt enhancement | code review | SQL generation
4. `PromptEnhancer` calls Claude API with context-appropriate prompts
5. Returns structured response with analysis/explanations

## Code Style & Conventions

### JavaScript Standards
- **Module System**: ES modules (`import`/`export`, not CommonJS)
- **Format**: ESLint-compliant (see `eslint` in package.json)
- **Async Patterns**: `async`/`await` preferred over `.then()` chains
- **Classes**: Use `export class ClassName { }` for main exports (not arrow functions)
- **Constructor Injection**: Pass dependencies via constructor (e.g., `config.apiKey`)

### Documentation
- **JSDoc comments** required for public methods:
  ```javascript
  /**
   * Process a user request
   * @param {string} userMessage - The user's message
   * @param {Object} context - Additional context (schema, code, etc.)
   * @returns {Object} - Result with type and data
   */
  async processRequest(userMessage, context = {}) { }
  ```
- **Console logging**: Use provided `Logger` utility, not `console.log` (except debug)

### API Response Format
All endpoints return consistent structure:
```javascript
{
  "type": "prompt_enhancement|code_review|sql_generation",
  "intent": "classified_intent",
  "result": { /* detailed response data */ },
  "conversationId": "conv_abc123",
  "messageCount": 2
}
```
Errors return 4xx/5xx with `{ error: "message" }`.

## Configuration

**Environment Variables** (`.env`):
```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
NODE_ENV=development|production
```

**Key Dependencies**:
- `@anthropic-ai/sdk` ^0.75.0 - Claude API client
- `express` ^5.2.1 - Web framework
- `cors` - Cross-origin resource sharing
- `express-rate-limit` - Rate limiting middleware
- `helmet` - Security headers
- `nodemon` - Dev reloading (devDependency)
- `eslint` - Linting (devDependency)

## Testing & Quality

- **Test File**: `tests/comprehensive-tests.js` - Main test suite
- **Ad-hoc Tests**: `Tests_made/` folder contains feature-specific test files
- **Conventions**: Test files export test functions, use console for output  
- **Running Tests**: `npm test` or `node tests/comprehensive-tests.js`

## Common Tasks

### Adding a New Feature Handler
1. Create prompt templates in `src/prompt-library/prompts/newFeature.js`
2. Export template from `src/prompt-library/index.js`
3. Add classifier logic to `src/classifiers/IntentClassifier.js`
4. Create handler in agent or add to existing
5. Add API endpoint to `src/api/server.js`
6. Add test cases to `tests/comprehensive-tests.js`

### Modifying Agent Logic
- Edit `src/agent/PromptEngineerAgent.js` for orchestration changes
- Edit `src/agent/PromptEnhancer.js` for Claude API interaction
- Use `ConversationStore` for multi-turn context

### Debugging
- Check logs in `logs/` folder (if enabled in Logger)
- Use `npm run dev` for nodemon auto-reload on file changes
- Add console.log with 🎯, ⚠️, ❌ prefixes for visibility

## Known Patterns

1. **Conversation Context**: Stored in memory; use `conversationStore.getContext()` for multi-turn
2. **Analytics Tracking**: Automatically recorded for all requests via `analytics.trackRequest()`
3. **Rate Limiting**: Transparent at middleware level; clients get `X-RateLimit-*` headers
4. **Error Handling**: Wrapped in try/catch; errors logged and returned with status code
5. **Template System**: Uses `TemplateBuilder` to inject dynamic values at runtime

## Pitfalls to Avoid

- ❌ Don't modify `ConversationStore` to use databases (currently in-memory by design)
- ❌ Don't use CommonJS `require()` — project is ES modules only
- ❌ Don't call Claude API directly; always go through `PromptEnhancer`
- ❌ Don't add new endpoints without rate limiting middleware
- ❌ Don't forget to update API.md when adding/changing endpoints

## References

- **API Documentation**: [API.md](../API.md)
- **Executive Summary**: [EXECUTIVE_SUMMARY.md](../EXECUTIVE_SUMMARY.md)
- **Anthropic API**: https://docs.anthropic.com/
