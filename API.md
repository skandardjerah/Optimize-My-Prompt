# API Documentation - OptimizeMyPrompt

## Base URL
```
http://localhost:3000
```

When deployed, replace with your production URL.

---

## Rate Limiting

All `/api/*` endpoints are rate-limited to prevent abuse.

**Limits:**
- **100 requests per 15 minutes** per IP address
- Rate limit resets automatically after 15 minutes

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1709388000
```

**429 Response (Rate Limit Exceeded):**
```json
{
  "error": "Too many requests, please try again later."
}
```

---

## Core Endpoints

### 1. Process Request (Auto-Routing)

Automatically detects user intent and routes to the appropriate handler.

**Endpoint:** `POST /api/process`

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "string (required)",
  "context": {
    "schema": "string (optional, required for SQL)",
    "code": "string (optional, required for code review)",
    "conversationId": "string (optional)"
  }
}
```

**Response - Prompt Enhancement:**
```json
{
  "type": "prompt_enhancement",
  "intent": "prompt_enhancement",
  "taskType": "brainstorming",
  "result": {
    "enhanced": "Enhanced prompt text...",
    "analysis": {
      "original_clarity": "Medium",
      "enhanced_clarity": "High",
      "improvements": ["Added context", "Structured output"]
    }
  },
  "conversationId": "conv_abc123",
  "messageCount": 2
}
```

**Response - Code Review:**
```json
{
  "type": "code_review",
  "intent": "code_review",
  "result": {
    "summary": "Code quality assessment...",
    "issues": [
      {
        "severity": "high",
        "description": "Missing input validation",
        "suggestion": "Add parameter type checking"
      }
    ]
  },
  "conversationId": "conv_abc123"
}
```

**Response - SQL Generation:**
```json
{
  "type": "sql_query",
  "intent": "sql_query",
  "result": {
    "queries": [
      {
        "sql": "SELECT * FROM users WHERE is_active = true;",
        "explanation": "Retrieves all active users"
      }
    ]
  },
  "conversationId": "conv_abc123"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "Message is required"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{"message": "Write a blog post about AI"}'
```

**Example Request (JavaScript):**
```javascript
const response = await fetch('http://localhost:3000/api/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Review this code for security',
    context: {
      code: 'function login(user, pass) { return user + pass; }'
    }
  })
});
const data = await response.json();
```

---

### 2. Improve Code

Enhances code based on review findings.

**Endpoint:** `POST /api/improve-code`

**Request Body:**
```json
{
  "code": "string (required)",
  "language": "string (optional, default: 'Auto-detect')",
  "instructions": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "improvedCode": "/**\n * Enhanced code here\n */\nfunction add(a, b) {\n  return a + b;\n}",
  "changes": [
    "Added JSDoc documentation",
    "Improved formatting",
    "Added input validation"
  ]
}
```

---

## Conversation Management

### 3. Get Conversation

**Endpoint:** `GET /api/conversation/:id`

**Response:**
```json
{
  "id": "conv_abc123",
  "messageCount": 4,
  "messages": [
    {
      "role": "user",
      "content": "Enhance this prompt",
      "timestamp": "2026-03-02T10:30:00Z"
    }
  ],
  "createdAt": "2026-03-02T10:30:00Z",
  "lastActivity": "2026-03-02T10:30:02Z"
}
```

### 4. Get Statistics

**Endpoint:** `GET /api/stats`

**Response:**
```json
{
  "totalConversations": 145,
  "activeConversations": 23,
  "totalMessages": 534,
  "averageMessagesPerConversation": 3.7
}
```

---

## Analytics

### 5. Get Analytics

**Endpoint:** `GET /api/analytics`

**Response:**
```json
{
  "totalRequests": 1247,
  "requestsByIntent": {
    "prompt_enhancement": 623,
    "code_review": 412,
    "sql_query": 212
  },
  "averageResponseTime": 1847,
  "successRate": 0.973
}
```

---

## System Endpoints

### 6. Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-02T10:30:00Z",
  "service": "Prompt Engineer Agent"
}
```

### 7. Application Info

**Endpoint:** `GET /api/info`

**Response:**
```json
{
  "name": "Prompt Engineer Agent",
  "version": "1.0.0",
  "features": [
    "Prompt Enhancement",
    "SQL Generation",
    "Code Review"
  ]
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Best Practices

### Error Handling
Always wrap API calls in try-catch:
```javascript
try {
  const response = await fetch('/api/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Your prompt' })
  });
  const data = await response.json();
} catch (error) {
  console.error('API Error:', error);
}
```

### Rate Limiting
Monitor rate limit headers:
```javascript
const remaining = response.headers.get('X-RateLimit-Remaining');
if (remaining < 10) {
  console.warn('Approaching rate limit');
}
```

---

**API Version:** 1.0.0  
**Last Updated:** March 2026