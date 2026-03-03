# OptimizeMyPrompt

An intelligent AI-powered web application that enhances prompts, performs code reviews, and generates SQL queries using the Anthropic Claude API.

![Status](https://img.shields.io/badge/status-production--ready-green)
![Node](https://img.shields.io/badge/node-v18%2B-blue)

---

## Overview

**OptimizeMyPrompt** helps users get better results from AI models by:
- **Enhancing Prompts** - Transforms basic prompts into well-structured, context-rich requests
- **Reviewing Code** - Analyzes code for security, performance, and best practices
- **Generating SQL** - Converts natural language to optimized SQL queries

The application features intelligent intent classification that automatically detects what you're trying to accomplish and routes your request to the appropriate AI-powered handler.

---

## Features

### 🎯 Intelligent Intent Detection
- Automatically classifies requests as prompt enhancement, code review, or SQL generation
- 90%+ classification accuracy using context analysis and pattern matching
- Sub-50ms classification time

### ✨ Prompt Enhancement
- Analyzes and improves user prompts for better AI responses
- Identifies task type (brainstorming, analysis, creative writing, etc.)
- Adds context, structure, constraints, and examples
- Maintains conversation history for multi-turn interactions

### 👨‍💻 Code Review
- Comprehensive code analysis for multiple programming languages
- Identifies: security vulnerabilities, performance issues, code clarity problems
- Provides actionable suggestions with severity ratings
- Includes automated code enhancement feature with change tracking

### 🗄️ SQL Query Generation
- Converts natural language descriptions to SQL queries
- Schema-aware generation for accurate results
- Supports PostgreSQL, MySQL, and SQLite dialects
- Includes query explanations and optimization tips

### 💾 Persistent History
- Client-side history using LocalStorage
- Per-feature state isolation
- One-click recall of previous sessions
- Full context restoration (including enhanced code and selections)

---

## Quick Start

### Prerequisites
- Node.js v18 or higher
- npm (comes with Node.js)
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/skandardjeraijrah/Optimize-My-Prompt.git
cd Optimize-My-Prompt
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
```

4. **Start the server**
```bash
npm start
```

5. **Open the application**

Navigate to `http://localhost:3000` in your web browser.

---

## Usage

### Prompt Enhancement
1. Select "Prompt Enhancement" from the sidebar
2. Enter your prompt in the text area
3. Press Enter or click the send button
4. Review the enhanced prompt and explanation

### Code Review
1. Select "Code Review" from the sidebar
2. Paste your code in the text area
3. (Optional) Select review focus areas using checkboxes
4. Press the send button
5. Review the analysis and click "Enhance Code" for improvements

### SQL Generation
1. Select "SQL" from the sidebar
2. Enter your database schema (e.g., `users(id, name, email, created_at)`)
3. Describe the query you need in plain English
4. Press Enter or click the send button
5. Copy the generated SQL query

---

## Technologies Used

### Backend
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** (v5.x) - Web framework
- **Anthropic Claude API** - AI language model
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting

### Frontend
- **Vanilla JavaScript** - No frameworks, pure DOM manipulation
- **HTML5 & CSS3** - Modern web standards
- **LocalStorage API** - Client-side persistence
- **Fetch API** - Asynchronous HTTP requests

### Security & Performance
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration
- **Rate Limiting** - 100 requests per 15 minutes
- **Request Caching** - Performance optimization

---

## API Documentation

The application provides a REST API with 15+ endpoints. See [API.md](./API.md) for complete documentation.

**Main Endpoint:**
```bash
POST /api/process
```

Auto-routes requests based on detected intent (prompt enhancement, code review, or SQL generation).

**Example:**
```bash
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{"message": "Write a blog post about AI"}'
```

---

## Project Structure
```
Optimize-My-Prompt/
├── src/
│   ├── agent/                 # Core orchestration
│   │   ├── PromptEngineerAgent.js
│   │   ├── PromptEnhancer.js
│   │   └── ConversationStore.js
│   ├── classifiers/           # Intent detection
│   │   ├── IntentClassifier.js
│   │   └── TaskDetector.js
│   ├── prompt-library/        # Templates
│   │   ├── PromptLibrary.js
│   │   └── prompts/
│   ├── api/                   # Express server
│   │   ├── server.js
│   │   └── middleware/
│   └── utils/                 # Utilities
│       ├── Analytics.js
│       ├── Logger.js
│       ├── Cache.js
│       └── FeedbackCollector.js
├── public/
│   └── index.html             # Web interface
├── tests/                     # Test suite
├── .env.example               # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## Development

### Running in Development Mode
```bash
npm run dev
```
Uses Nodemon for automatic server restart on file changes.

### Running Tests
```bash
npm test
```

---

## Deployment

### Environment Variables
```bash
ANTHROPIC_API_KEY=sk-ant-...    # Required
PORT=3000                        # Optional (default: 3000)
NODE_ENV=production              # Required for production
```

### Supported Platforms
- **Railway** - Recommended ([deployment guide](./DEPLOYMENT.md))
- **Heroku**
- **Vercel**
- **DigitalOcean App Platform**

---

## Security

- **Rate Limiting:** 100 requests per 15 minutes per IP
- **Security Headers:** XSS protection, CSP, HSTS via Helmet
- **Input Validation:** Schema and code validation before processing
- **API Key Security:** Environment-based configuration, no hardcoded credentials

---

## Performance

- **Intent Classification:** <50ms average
- **API Response Time:** <2 seconds (dependent on Claude API)
- **Classification Accuracy:** 90%+ on test cases
- **Client-side History:** Instant access via LocalStorage

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- **Anthropic** for the Claude API
- **Express.js** community for excellent documentation
- **Node.js** ecosystem for robust tools

---

## Contact

**GitHub:** [https://github.com/skandardjerah/Optimize-My-Prompt](https://github.com/skandardjerah/Optimize-My-Prompt)

**Author:** Skandar Djerah

---

**Built with Node.js and Anthropic Claude API**
