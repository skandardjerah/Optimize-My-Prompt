# OptimizeMyPrompt

A production-ready Node.js web app that uses the Anthropic Claude API to help users write better prompts, review code, and get more out of their AI tools.

![Status](https://img.shields.io/badge/status-production--ready-green)
![Node](https://img.shields.io/badge/node-v18%2B-blue)

---

## What It Does

**OptimizeMyPrompt** is built for two audiences:

- **End users** — paste a prompt or code snippet and get an optimized version in seconds
- **Developers** — a clean, deployable reference implementation of a streaming Claude API pipeline with intent classification, JWT auth, and rate limiting

---

## Core Features

### Prompt Optimization
Real-time streaming pipeline powered by Claude. Paste any prompt and get:
- An optimized rewrite with a live side-by-side diff
- A quality score (0–100) across length, specificity, structure, and clarity
- Contextual tips based on the detected intent of your prompt

### Code Review & Improvement
Paste any code snippet. The app identifies the language, runs a structured review, and offers a one-click rewrite incorporating the findings.

### Intent Classification
Requests are automatically classified (prompt enhancement vs. code review) before being routed — no dropdowns, no manual selection. The classifier runs in under 50ms.

---

## Secondary Features

- **Chat history** — sidebar with full conversation history and per-chat deletion
- **JWT authentication** — register/sign in with email + password; all Claude endpoints are protected
- **Per-user rate limiting** — 5 free optimizations per day per account
- **9-language UI** — interface translates on the fly (EN, FR, ES, IT, PT, DE, AR, ZH, JA)
- **Service Worker** — works offline; static assets are cached
- **Dark / Light theme**

---

## Tech Stack

- **Backend:** Node.js v18+, Express v5, bcryptjs, jsonwebtoken, Helmet, express-rate-limit, Zod
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Frontend:** Vanilla JavaScript, SSE streaming client, flag-icons CDN

---

## Quick Start

```bash
git clone https://github.com/skandardjerah/Optimize-My-Prompt.git
cd Optimize-My-Prompt
npm install
cp .env.example .env   # fill in ANTHROPIC_API_KEY and JWT_SECRET
npm start
```

Open `http://localhost:3000`.

```bash
npm run dev    # nodemon auto-reload
npm test       # integration tests (requires server on :3000)
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Your Anthropic API key |
| `JWT_SECRET` | ✅ | Long random string for signing JWTs |
| `ALLOWED_ORIGIN` | ✅ prod | Allowed CORS origin(s), comma-separated |
| `ADMIN_SECRET` | ✅ prod | Protects `/api/logs`, `/api/stats`, `/api/analytics` |
| `PORT` | — | Default: `3000` |
| `NODE_ENV` | — | `development` or `production` |

---

## API Overview

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/optimize` | JWT | SSE streaming optimization |
| `POST` | `/api/process` | JWT | Full agent pipeline |
| `POST` | `/api/improve-code` | JWT | Code rewrite |
| `POST` | `/api/classify` | — | Intent classification |
| `POST` | `/api/auth/register` | — | Create account |
| `POST` | `/api/auth/login` | — | Sign in, returns JWT |
| `GET` | `/api/logs` `/api/stats` | Admin | Internal monitoring |

---

## Project Structure

```
prompt-engineer-agent/
├── src/
│   ├── agent/                    # PromptEngineerAgent, PromptEnhancer, ConversationStore
│   ├── api/
│   │   ├── server.js             # Express server & all route definitions
│   │   └── middleware/
│   │       ├── auth.js           # requireAuth JWT middleware
│   │       └── rateLimiter.js    # apiLimiter, enhanceLimiter, dailyOptimizeLimit
│   ├── server/
│   │   ├── services/
│   │   │   ├── IntentClassifier.js   # Weighted scoring classifier
│   │   │   ├── PromptOptimizer.js    # Streaming optimization pipeline
│   │   │   ├── StreamHandler.js      # SSE event emitter
│   │   │   ├── TipEngine.js          # Contextual tip generation
│   │   │   ├── FeedbackAnalyzer.js   # Feedback collection
│   │   │   ├── FeatureExtractor.js   # 32-dimensional feature extraction
│   │   │   └── UserStore.js          # In-memory user store (bcrypt)
│   │   └── middleware/
│   │       ├── requestValidator.js   # Zod schema validation
│   │       └── errorHandler.js
│   ├── i18n/
│   │   └── languages.js          # Language configs & system prompt prefixes
│   └── utils/                    # Analytics, Logger, Cache, FeedbackCollector
├── public/
│   ├── index.html                # Full SPA — UI, i18n, streaming client
│   ├── sw.js                     # Service Worker
│   └── UK_US_flag.JPG
├── tests/
│   ├── comprehensive-tests.js    # Integration test suite
│   └── load/                     # k6 load tests
├── .env.example
├── ecosystem.config.cjs          # PM2 cluster config
└── package.json
```

---

## Known Limitations

- User accounts are **in-memory** — lost on server restart (no persistent DB yet)
- No email verification or password reset flow

---

## Author

**Skandar Djerah**
[github.com/skandardjerah/Optimize-My-Prompt](https://github.com/skandardjerah/Optimize-My-Prompt)

---

*Built with Node.js and the Anthropic Claude API.*
