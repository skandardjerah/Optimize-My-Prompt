/**
 * Classifier accuracy test — Phase 1 gate.
 * Tests the Tier 2 IntentClassifier against 100 labeled prompts.
 * Requirement: >= 90% overall accuracy before proceeding to Phase 2.
 */
import { IntentClassifier } from '../src/server/services/IntentClassifier.js';

const classifier = new IntentClassifier();

const LABELED_PROMPTS = [
  // ── CODE (40) ──────────────────────────────────────────────────────────────
  { prompt: 'function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }', intent: 'CODE' },
  { prompt: 'const express = require("express"); const app = express(); app.listen(3000);', intent: 'CODE' },
  { prompt: 'Fix the bug in my JavaScript async/await code that is not handling errors correctly', intent: 'CODE' },
  { prompt: 'Review this Python function for SQL injection vulnerabilities: def run(q): db.execute(q)', intent: 'CODE' },
  { prompt: 'Implement a binary search algorithm in TypeScript that returns the index of the target', intent: 'CODE' },
  { prompt: 'Debug this React component that causes infinite re-renders when state updates', intent: 'CODE' },
  { prompt: 'Write a SQL query to join the users and orders tables filtering for active accounts', intent: 'CODE' },
  { prompt: 'Optimize this nested for loop O(n^3) algorithm to reduce time complexity', intent: 'CODE' },
  { prompt: 'Explain how the JavaScript event loop and call stack work with async operations', intent: 'CODE' },
  { prompt: 'Create a REST API endpoint in Express.js that handles JWT authentication middleware', intent: 'CODE' },
  { prompt: 'SELECT u.id, u.email, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id', intent: 'CODE' },
  { prompt: 'Refactor this Java class to use the dependency injection pattern with constructor injection', intent: 'CODE' },
  { prompt: 'How do I implement WebSocket connections in Node.js for a real-time chat application?', intent: 'CODE' },
  { prompt: 'Write a Python decorator that measures and logs function execution time', intent: 'CODE' },
  { prompt: 'My React useState hook is not triggering a re-render, what is wrong with this code?', intent: 'CODE' },
  { prompt: 'Implement a Redis cache layer for my Express API to reduce PostgreSQL database queries', intent: 'CODE' },
  { prompt: 'Convert this callback-based Node.js function to use async/await syntax', intent: 'CODE' },
  { prompt: 'Write unit tests for this authentication service using Jest and mock the database', intent: 'CODE' },
  { prompt: 'for (let i = 0; i < arr.length; i++) { if (arr[i] === target) return i; } return -1;', intent: 'CODE' },
  { prompt: 'How do I configure Docker containers for a Node.js app with a PostgreSQL database?', intent: 'CODE' },
  { prompt: 'Analyze this mergesort implementation for time complexity and space complexity', intent: 'CODE' },
  { prompt: 'Write a regex pattern to validate email addresses and phone numbers in JavaScript', intent: 'CODE' },
  { prompt: 'My Express API endpoint returns 500 when the database connection fails, how to fix?', intent: 'CODE' },
  { prompt: 'Implement cursor-based pagination for a REST API returning large MongoDB datasets', intent: 'CODE' },
  { prompt: 'class UserService { constructor(private db: Database) {} async findById(id: string): Promise<User> {} }', intent: 'CODE' },
  { prompt: 'Write a bash script that backs up a PostgreSQL database nightly using pg_dump', intent: 'CODE' },
  { prompt: 'Explain the difference between Promise.all and Promise.allSettled with JavaScript examples', intent: 'CODE' },
  { prompt: 'Debug why my CSS flexbox layout breaks on mobile viewports below 768px', intent: 'CODE' },
  { prompt: 'Write a GraphQL resolver for fetching user profiles with nested relationships', intent: 'CODE' },
  { prompt: 'How do I implement express-rate-limit middleware with Redis store for distributed APIs?', intent: 'CODE' },
  { prompt: 'import { useState, useEffect } from "react"; export default function Counter() { const [count, setCount] = useState(0); }', intent: 'CODE' },
  { prompt: 'Optimize slow SQL queries by adding composite indexes to the users and orders tables', intent: 'CODE' },
  { prompt: 'Write a Python script to parse a JSON file and insert each record into SQLite database', intent: 'CODE' },
  { prompt: 'Explain how garbage collection works in the JavaScript V8 engine heap management', intent: 'CODE' },
  { prompt: 'Review my REST API design for compliance with RESTful principles and suggest improvements', intent: 'CODE' },
  { prompt: 'Implement a custom React hook for handling form validation with real-time error messages', intent: 'CODE' },
  { prompt: 'Fix the memory leak in this Node.js server that crashes after processing many requests', intent: 'CODE' },
  { prompt: 'Write a TypeScript interface for a User object with optional profile and address fields', intent: 'CODE' },
  { prompt: 'Configure Webpack code splitting to lazy-load routes in a React single-page application', intent: 'CODE' },
  { prompt: 'Implement an LRU cache class using a doubly linked list and a hash map in JavaScript', intent: 'CODE' },

  // ── NATURAL_LANGUAGE (40) ──────────────────────────────────────────────────
  { prompt: 'Write a compelling blog post about the future of artificial intelligence in healthcare', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Help me craft a professional email to my manager requesting a salary increase', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Explain the causes and consequences of World War I to a high school student', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Create a marketing strategy for launching a new fitness app targeting millennials', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Write a short story about a robot that slowly learns to feel human emotions', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'What are the main differences between capitalism and socialism in economic theory?', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Help me write a cover letter for a senior product manager role at a fintech startup', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Create a 30-day meal plan for someone following a whole-food plant-based diet', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Explain quantum computing in simple terms that a non-technical business executive can understand', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Write compelling product descriptions for an e-commerce store selling handmade jewelry', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'What is the best approach for managing a remote team distributed across different time zones?', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Help me write a wedding speech for my best friend that is both funny and heartfelt', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Create a social media content calendar for a small bakery business for the next month', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Analyze the themes and symbolism in George Orwell\'s novel 1984', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Write a persuasive essay arguing for stricter environmental regulations on corporations', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Summarize the key findings from recent peer-reviewed research on climate change impacts', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Help me brainstorm creative names for my new sustainable clothing brand targeting Gen Z', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'What are effective strategies for improving employee engagement and reducing staff turnover?', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Write a poem about the changing seasons in the style of Robert Frost', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Explain the psychological principles behind effective negotiation tactics in business deals', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Create a business plan outline for a food delivery startup targeting college students', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'How should I professionally respond to a negative review on my restaurant\'s Google profile?', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Write a children\'s story about a brave little turtle who overcomes fear and learns to swim', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'What are the key differences between inductive and deductive reasoning in philosophy?', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Help me write a LinkedIn post announcing my promotion to Director of Engineering', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Create a list of interview questions for hiring a senior product manager at a SaaS company', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Explain the philosophy of stoicism and how its principles apply to modern daily life', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Write a press release announcing the launch of a new AI-powered customer service tool', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'What are the most effective study techniques backed by cognitive science and neuroscience research?', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Help me draft a project proposal for implementing a new customer feedback management system', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Write a motivational speech for a sales team at their annual kickoff meeting', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Explain the economic theory of supply and demand using real-world everyday examples', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Create a comprehensive beginner\'s guide to mindfulness meditation and stress reduction', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'What are the pros and cons of working from home versus returning to the office full-time?', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Help me write a thoughtful thank you note to send after a job interview at a tech company', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Describe the cultural and artistic significance of the Italian Renaissance period in history', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Write a detailed two-week travel itinerary for a first-time visitor to Japan', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'How can I improve my public speaking skills and overcome stage fright before presentations?', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Create a beginner-friendly weekly workout plan for building muscle mass at the gym', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Explain the core principles of good UX design to a non-designer business stakeholder', intent: 'NATURAL_LANGUAGE' },

  // ── HYBRID (20) ────────────────────────────────────────────────────────────
  { prompt: 'Write a technical blog post explaining how binary search works with JavaScript code examples', intent: 'HYBRID' },
  { prompt: 'Create a beginner tutorial for React hooks with clear explanations and code snippets', intent: 'HYBRID' },
  { prompt: 'Explain how machine learning gradient descent works and show a Python implementation', intent: 'HYBRID' },
  { prompt: 'Write API documentation for our authentication endpoint explaining usage and curl examples', intent: 'HYBRID' },
  { prompt: 'Create a beginner\'s guide to SQL covering concepts and example queries with explanations', intent: 'HYBRID' },
  { prompt: 'Explain microservices architecture concepts to junior developers with a Node.js example', intent: 'HYBRID' },
  { prompt: 'Write a case study about improving web application performance using Redis caching strategies', intent: 'HYBRID' },
  { prompt: 'Compare sorting algorithms explaining their trade-offs with code examples in Python', intent: 'HYBRID' },
  { prompt: 'Write a step-by-step tutorial on setting up a CI/CD pipeline with GitHub Actions', intent: 'HYBRID' },
  { prompt: 'Explain asynchronous programming concepts to a junior developer with practical JavaScript examples', intent: 'HYBRID' },
  { prompt: 'Create a README for my open source Node.js library explaining architecture and contributing guidelines', intent: 'HYBRID' },
  { prompt: 'Write a technical specification document for building a real-time notification system using WebSockets', intent: 'HYBRID' },
  { prompt: 'Explain design patterns like Singleton and Observer to junior developers with TypeScript examples', intent: 'HYBRID' },
  { prompt: 'Create a database optimization guide covering both conceptual explanation and SQL query examples', intent: 'HYBRID' },
  { prompt: 'Write a postmortem report for a recent production outage including root cause analysis and code fix', intent: 'HYBRID' },
  { prompt: 'Explain Docker containerization to a backend team that has never used it before with examples', intent: 'HYBRID' },
  { prompt: 'Create user-facing documentation for our REST API that includes code samples in JavaScript and Python', intent: 'HYBRID' },
  { prompt: 'Write a technical interview preparation guide covering both system design concepts and coding challenges', intent: 'HYBRID' },
  { prompt: 'Explain the CAP theorem with practical examples and how it affects distributed database design choices', intent: 'HYBRID' },
  { prompt: 'Create a guide to authentication best practices covering both security concepts and implementation code', intent: 'HYBRID' },

  // ── EDGE CASES (20) ────────────────────────────────────────────────────────

  // Short / terse CODE prompts
  { prompt: 'Fix the null pointer exception in my Java code', intent: 'CODE' },
  { prompt: 'Why does my React component re-render infinitely?', intent: 'CODE' },
  { prompt: 'How do I center a div in CSS?', intent: 'CODE' },
  { prompt: 'What is the time complexity of binary search?', intent: 'CODE' },
  { prompt: 'Refactor this callback hell into async/await in Node.js', intent: 'CODE' },

  // NL prompts that contain technical-looking words
  { prompt: 'Create a 7-day meal plan for someone following a vegan diet', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Write a guide for new parents on building healthy sleep routines for infants', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Explain the process of photosynthesis to a middle school student', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Create a monthly budget plan for a family of four earning 80 000 a year', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Describe the psychological effects of social media on teenagers', intent: 'NATURAL_LANGUAGE' },

  // Prompts with misleading SQL-like words in NL context
  { prompt: 'Order the key events of World War II chronologically and explain their significance', intent: 'NATURAL_LANGUAGE' },
  { prompt: 'Select the most persuasive arguments for universal basic income and explain each', intent: 'NATURAL_LANGUAGE' },

  // CODE prompts with NL action words
  { prompt: 'Show me how to implement OAuth2 authentication in Express.js', intent: 'CODE' },
  { prompt: 'Help me understand how JavaScript closures work with a practical example', intent: 'HYBRID' },
  { prompt: 'Describe the difference between TCP and UDP protocols for a backend developer', intent: 'HYBRID' },

  // ML / AI technical prompts
  { prompt: 'Implement a gradient descent optimizer from scratch in Python using NumPy', intent: 'CODE' },
  { prompt: 'Explain neural network backpropagation with a simple Python example', intent: 'HYBRID' },

  // Prompts mixing business and tech
  { prompt: 'Write a technical roadmap document for migrating our monolith to microservices', intent: 'HYBRID' },
  { prompt: 'Analyze our PostgreSQL query performance and suggest index optimizations', intent: 'CODE' },
  { prompt: 'Create a product requirements document for a REST API developer portal', intent: 'HYBRID' },
];

// ── Run tests ──────────────────────────────────────────────────────────────

let correct = 0;
let incorrect = 0;
const failures = [];

for (const { prompt, intent: expected } of LABELED_PROMPTS) {
  const result = classifier.classify(prompt);
  const got = result.intent;

  if (got === expected) {
    correct++;
  } else {
    incorrect++;
    failures.push({ expected, got, confidence: result.confidence, prompt: prompt.slice(0, 70) });
  }
}

const total = LABELED_PROMPTS.length;
const accuracy = correct / total;
const TARGET = 0.90;

console.log('\n🧪 CLASSIFIER ACCURACY TEST\n');
console.log('================================');
console.log(`Total prompts  : ${total}`);
console.log(`Correct        : ${correct}`);
console.log(`Incorrect      : ${incorrect}`);
console.log(`Accuracy       : ${(accuracy * 100).toFixed(1)}%`);
console.log(`Target         : ${(TARGET * 100).toFixed(0)}%`);
console.log('================================\n');

if (failures.length > 0) {
  console.log('❌ Misclassified:');
  for (const f of failures) {
    console.log(`  Expected ${f.expected.padEnd(18)} Got ${f.got.padEnd(18)} (conf ${f.confidence.toFixed(2)}) "${f.prompt}..."`);
  }
  console.log();
}

if (accuracy >= TARGET) {
  console.log(`✅ PASSED — accuracy ${(accuracy * 100).toFixed(1)}% meets the ${TARGET * 100}% threshold. Phase 2 is unblocked.\n`);
  process.exit(0);
} else {
  console.log(`❌ FAILED — accuracy ${(accuracy * 100).toFixed(1)}% is below the ${TARGET * 100}% threshold. Tune the classifier before Phase 2.\n`);
  process.exit(1);
}
