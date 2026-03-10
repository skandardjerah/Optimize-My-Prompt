# Repository Guidelines

## Project Structure & Module Organization
Core code lives in `src/`:
- `src/agent/` orchestrates request handling and Claude integration.
- `src/classifiers/` handles intent and task detection.
- `src/prompt-library/` stores reusable prompt templates.
- `src/api/` contains the Express server and middleware (`src/api/middleware/rateLimiter.js`).
- `src/utils/` includes shared services (logging, analytics, cache, feedback, templates).

Frontend assets are in `public/` (`index.html`, images).  
Primary tests are in `tests/comprehensive-tests.js`; extra ad-hoc scripts are in `Tests_made/`.  
Runtime artifacts/logs are under `logs/`. Environment templates are in `.env.example`.

## Build, Test, and Development Commands
- `npm install`: install dependencies (Node.js 18+ recommended).
- `npm start`: run the production-style server (`src/api/server.js`).
- `npm run dev`: run locally with `nodemon` auto-reload.
- `npm test`: run the comprehensive integration suite.
- `node tests/comprehensive-tests.js`: run the same test suite directly.

Example local loop:
1. `npm run dev`
2. In another terminal: `npm test`

## Coding Style & Naming Conventions
- Language/runtime: modern JavaScript with ES modules (`import`/`export`).
- Indentation: 2 spaces; use semicolons and single quotes to match existing files.
- Naming: `PascalCase` for classes/files like `PromptEngineerAgent.js`, `camelCase` for variables/functions, descriptive endpoint names under `/api/*`.
- Keep API responses consistent and route external-model calls through agent/prompt-layer abstractions.
- Linting: ESLint is installed; run `npx eslint src tests` before opening a PR.

## Testing Guidelines
- Current tests are integration-oriented and target `http://localhost:3000`.
- Start the server before running `npm test`.
- Add new checks to `tests/comprehensive-tests.js` for new endpoints/behaviors.
- No enforced coverage threshold is configured; include meaningful happy-path and error-path assertions.

## Commit & Pull Request Guidelines
This workspace snapshot does not include `.git` history, so follow the existing contribution pattern in `README.md`:
- Write concise, imperative commit messages (example: `feat(api): add template validation`).
- Keep commits focused by concern (API, classifier, prompt template, UI).
- PRs should include: purpose, changed paths, test evidence (`npm test` output), and related issue links.
- Update `API.md` when endpoint contracts change; include UI screenshots for `public/` changes.

## Security & Configuration Tips
- Use `.env` for secrets (`ANTHROPIC_API_KEY`); never commit credentials.
- Validate inputs on new endpoints and keep rate limiting/security middleware enabled.
