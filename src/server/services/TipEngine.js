/**
 * TipEngine — Intelligent suggestion system.
 * 120+ tip templates organized by intent and subtype.
 * LRU cache (500 entries, 5-min TTL) keyed by intent+subtype.
 */

// ── LRU Cache ─────────────────────────────────────────────────────────────
class LRUCache {
  constructor(maxSize = 500, ttlMs = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttlMs;
    this.cache = new Map();
  }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.cache.delete(key); return null; }
    this.cache.delete(key);
    this.cache.set(key, entry);
    entry.hits = (entry.hits || 0) + 1;
    return entry.value;
  }
  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.maxSize) this.cache.delete(this.cache.keys().next().value);
    this.cache.set(key, { value, expiresAt: Date.now() + this.ttl, hits: 0 });
  }
  stats() { return { size: this.cache.size, maxSize: this.maxSize }; }
}

// ── Tip Library (120+ templates) ──────────────────────────────────────────
const TIPS = [
  // ── CODE / generate ───────────────────────────────────────────────────
  { id: 'c_gen_1',  intent: 'CODE', subtype: 'generate', category: 'clarity',     priority: 1, text: 'Specify the programming language and version (e.g., "in TypeScript 5.x" or "Python 3.11+").',                       applyTemplate: 'Add "in [language] [version]" to your prompt.' },
  { id: 'c_gen_2',  intent: 'CODE', subtype: 'generate', category: 'specificity', priority: 1, text: 'Define the expected input and output types with concrete examples.',                                                  applyTemplate: 'Add "Input: [example] → Output: [example]" to your prompt.' },
  { id: 'c_gen_3',  intent: 'CODE', subtype: 'generate', category: 'context',     priority: 2, text: 'Mention the framework or library context (e.g., Express 5, React 18, Django 4).',                                   applyTemplate: 'Add "using [framework] [version]" to your prompt.' },
  { id: 'c_gen_4',  intent: 'CODE', subtype: 'generate', category: 'specificity', priority: 2, text: 'Specify performance or complexity constraints if relevant (e.g., "O(n log n) or better").',                          applyTemplate: 'Add "with time complexity [target]" to your prompt.' },
  { id: 'c_gen_5',  intent: 'CODE', subtype: 'generate', category: 'clarity',     priority: 2, text: 'State whether you need the full implementation or just the core logic/skeleton.',                                    applyTemplate: 'Add "full implementation" or "skeleton with comments" to your prompt.' },
  { id: 'c_gen_6',  intent: 'CODE', subtype: 'generate', category: 'format',      priority: 3, text: 'Request inline comments or docstrings if needed for documentation.',                                                  applyTemplate: 'Add "with JSDoc comments" or "with docstrings" to your prompt.' },
  { id: 'c_gen_7',  intent: 'CODE', subtype: 'generate', category: 'specificity', priority: 3, text: 'Specify edge cases to handle (e.g., empty input, null values, large datasets).',                                     applyTemplate: 'Add "handle edge cases: [list]" to your prompt.' },
  { id: 'c_gen_8',  intent: 'CODE', subtype: 'generate', category: 'context',     priority: 3, text: 'Describe the surrounding architecture: is this a standalone function, class method, or API handler?',               applyTemplate: 'Add "as a [standalone function|class method|API handler]" to your prompt.' },
  { id: 'c_gen_9',  intent: 'CODE', subtype: 'generate', category: 'format',      priority: 4, text: 'Specify whether you need error handling and what style (try/catch, Result type, etc.).',                            applyTemplate: 'Add "with error handling using [try/catch|Result type|callbacks]".' },
  { id: 'c_gen_10', intent: 'CODE', subtype: 'generate', category: 'specificity', priority: 4, text: 'Mention any external APIs or data sources the code needs to interact with.',                                          applyTemplate: 'Add "integrating with [API/service]" to your prompt.' },
  { id: 'c_gen_11', intent: 'CODE', subtype: 'generate', category: 'context',     priority: 4, text: 'State if the code needs to be async/concurrent or synchronous.',                                                     applyTemplate: 'Add "async" or "synchronous" to clarify execution model.' },
  { id: 'c_gen_12', intent: 'CODE', subtype: 'generate', category: 'format',      priority: 5, text: 'Request test cases or a usage example alongside the implementation.',                                                applyTemplate: 'Add "include a usage example" or "include unit tests" to your prompt.' },

  // ── CODE / debug ──────────────────────────────────────────────────────
  { id: 'c_dbg_1',  intent: 'CODE', subtype: 'debug', category: 'clarity',     priority: 1, text: 'Include the exact error message or stack trace you are seeing.',                                                       applyTemplate: 'Add "Error: [exact error message]" to your prompt.' },
  { id: 'c_dbg_2',  intent: 'CODE', subtype: 'debug', category: 'context',     priority: 1, text: 'Describe what you expected to happen vs. what actually happened.',                                                     applyTemplate: 'Add "Expected: [X] but got: [Y]" to your prompt.' },
  { id: 'c_dbg_3',  intent: 'CODE', subtype: 'debug', category: 'specificity', priority: 2, text: 'Provide a minimal reproducible example (MRE) that isolates the bug.',                                                 applyTemplate: 'Reduce your code to the smallest version that still shows the bug.' },
  { id: 'c_dbg_4',  intent: 'CODE', subtype: 'debug', category: 'context',     priority: 2, text: 'Mention the runtime environment, OS, and dependency versions where the bug occurs.',                                   applyTemplate: 'Add "Runtime: Node 20 / Python 3.11, OS: [OS]" to your prompt.' },
  { id: 'c_dbg_5',  intent: 'CODE', subtype: 'debug', category: 'specificity', priority: 2, text: 'State what debugging steps you have already tried to narrow down the cause.',                                          applyTemplate: 'Add "Already tried: [steps]" to avoid repeated suggestions.' },
  { id: 'c_dbg_6',  intent: 'CODE', subtype: 'debug', category: 'clarity',     priority: 3, text: 'Indicate whether the bug is intermittent or consistently reproducible.',                                               applyTemplate: 'Add "Occurs: always / intermittently ([frequency])" to your prompt.' },
  { id: 'c_dbg_7',  intent: 'CODE', subtype: 'debug', category: 'context',     priority: 3, text: 'Describe when the bug was introduced (after a recent change, always present, etc.).',                                 applyTemplate: 'Add "Regression: appeared after [change/update]" if applicable.' },
  { id: 'c_dbg_8',  intent: 'CODE', subtype: 'debug', category: 'format',      priority: 4, text: 'Ask for the fix and an explanation of the root cause so you understand it.',                                           applyTemplate: 'Add "Provide the fix AND explain the root cause" to your prompt.' },
  { id: 'c_dbg_9',  intent: 'CODE', subtype: 'debug', category: 'specificity', priority: 4, text: 'Specify the input values that trigger the bug if it is input-dependent.',                                             applyTemplate: 'Add "Bug triggers with input: [value]" to your prompt.' },
  { id: 'c_dbg_10', intent: 'CODE', subtype: 'debug', category: 'context',     priority: 5, text: 'Share relevant logs or monitoring data that correlate with the failure.',                                              applyTemplate: 'Add "Logs show: [relevant log lines]" to your prompt.' },

  // ── CODE / review ─────────────────────────────────────────────────────
  { id: 'c_rev_1',  intent: 'CODE', subtype: 'review', category: 'specificity', priority: 1, text: 'Specify the review focus: security, performance, readability, or all three.',                                        applyTemplate: 'Add "Focus on: [security|performance|readability|all]" to your prompt.' },
  { id: 'c_rev_2',  intent: 'CODE', subtype: 'review', category: 'context',     priority: 1, text: 'Describe the production context: traffic levels, data sensitivity, and team experience.',                            applyTemplate: 'Add "Context: [high traffic|sensitive data|junior team]" to your prompt.' },
  { id: 'c_rev_3',  intent: 'CODE', subtype: 'review', category: 'clarity',     priority: 2, text: 'State the coding standards or style guide the code should conform to.',                                              applyTemplate: 'Add "Standards: [Airbnb ESLint|PEP 8|Google Java Style]" to your prompt.' },
  { id: 'c_rev_4',  intent: 'CODE', subtype: 'review', category: 'specificity', priority: 2, text: 'Ask for actionable suggestions ranked by severity (critical > high > medium > low).',                               applyTemplate: 'Add "Rank issues by severity and provide specific fixes" to your prompt.' },
  { id: 'c_rev_5',  intent: 'CODE', subtype: 'review', category: 'format',      priority: 3, text: 'Request a code snippet for each suggested improvement, not just a description.',                                     applyTemplate: 'Add "Show a corrected code snippet for each issue" to your prompt.' },
  { id: 'c_rev_6',  intent: 'CODE', subtype: 'review', category: 'context',     priority: 3, text: 'Indicate if this is a PR review (diff) or a full file review.',                                                    applyTemplate: 'Add "Reviewing: PR diff / full file / module" to your prompt.' },
  { id: 'c_rev_7',  intent: 'CODE', subtype: 'review', category: 'specificity', priority: 4, text: 'Ask for an overall quality score and summary before the detailed issues list.',                                      applyTemplate: 'Add "Start with a 1-10 score and overall summary" to your prompt.' },
  { id: 'c_rev_8',  intent: 'CODE', subtype: 'review', category: 'clarity',     priority: 4, text: 'Specify whether you want the reviewer to also highlight strengths, not just issues.',                               applyTemplate: 'Add "Also highlight what the code does well" to your prompt.' },

  // ── CODE / explain ────────────────────────────────────────────────────
  { id: 'c_exp_1',  intent: 'CODE', subtype: 'explain', category: 'context',     priority: 1, text: 'State your experience level so the explanation is pitched correctly (beginner/intermediate/expert).',              applyTemplate: 'Add "Explain for a [beginner|intermediate|expert] developer" to your prompt.' },
  { id: 'c_exp_2',  intent: 'CODE', subtype: 'explain', category: 'specificity', priority: 1, text: 'Ask for a step-by-step walkthrough of the code\'s execution flow.',                                                applyTemplate: 'Add "Walk through the execution step by step" to your prompt.' },
  { id: 'c_exp_3',  intent: 'CODE', subtype: 'explain', category: 'clarity',     priority: 2, text: 'Request analogies or real-world comparisons to clarify abstract concepts.',                                        applyTemplate: 'Add "Use an analogy or real-world example to illustrate" to your prompt.' },
  { id: 'c_exp_4',  intent: 'CODE', subtype: 'explain', category: 'format',      priority: 2, text: 'Ask for the "why" behind design decisions, not just the "what".',                                                  applyTemplate: 'Add "Explain the design rationale, not just what it does" to your prompt.' },
  { id: 'c_exp_5',  intent: 'CODE', subtype: 'explain', category: 'specificity', priority: 3, text: 'Specify which part of the code you find most confusing to focus the explanation.',                                 applyTemplate: 'Add "Focus on explaining [specific part/line range]" to your prompt.' },
  { id: 'c_exp_6',  intent: 'CODE', subtype: 'explain', category: 'context',     priority: 3, text: 'Ask for common pitfalls or gotchas related to the concept being explained.',                                       applyTemplate: 'Add "Include common mistakes or pitfalls to avoid" to your prompt.' },
  { id: 'c_exp_7',  intent: 'CODE', subtype: 'explain', category: 'format',      priority: 4, text: 'Request a short summary at the end that you can use as a reference note.',                                         applyTemplate: 'Add "End with a 2-3 sentence TL;DR summary" to your prompt.' },

  // ── CODE / general (any subtype) ──────────────────────────────────────
  { id: 'c_all_1',  intent: 'CODE', subtype: null, category: 'clarity',     priority: 1, text: 'Specify the exact language and runtime version to avoid ambiguous suggestions.',                                         applyTemplate: 'Add "[language] [version]" at the start of your prompt.' },
  { id: 'c_all_2',  intent: 'CODE', subtype: null, category: 'context',     priority: 2, text: 'Add a role context: "You are a senior [language] engineer" for more authoritative responses.',                          applyTemplate: 'Prepend "You are a senior [language] engineer." to your prompt.' },
  { id: 'c_all_3',  intent: 'CODE', subtype: null, category: 'format',      priority: 2, text: 'Specify the output format: raw code, code + explanation, or just the explanation.',                                     applyTemplate: 'Add "Return: code only / code + explanation / explanation only".' },
  { id: 'c_all_4',  intent: 'CODE', subtype: null, category: 'specificity', priority: 3, text: 'Provide relevant context about the existing codebase, such as the project structure or patterns used.',                 applyTemplate: 'Add "Project context: [framework, patterns, architecture]" to your prompt.' },
  { id: 'c_all_5',  intent: 'CODE', subtype: null, category: 'clarity',     priority: 3, text: 'Break a complex request into numbered steps so each requirement is addressed separately.',                              applyTemplate: 'Rewrite your prompt as a numbered list of specific requirements.' },
  { id: 'c_all_6',  intent: 'CODE', subtype: null, category: 'context',     priority: 4, text: 'Mention any constraints like "must not use external libraries" or "needs to run in a browser".',                        applyTemplate: 'Add "Constraints: [library restrictions, environment]" to your prompt.' },
  { id: 'c_all_7',  intent: 'CODE', subtype: null, category: 'specificity', priority: 4, text: 'State any existing code conventions the output must follow (camelCase, snake_case, etc.).',                            applyTemplate: 'Add "Follow conventions: [naming, formatting standards]" to your prompt.' },
  { id: 'c_all_8',  intent: 'CODE', subtype: null, category: 'format',      priority: 5, text: 'Ask for the response structured as: solution → explanation → alternatives.',                                            applyTemplate: 'Add "Structure: solution first, then explanation, then alternatives" to your prompt.' },

  // ── NATURAL_LANGUAGE / creative ───────────────────────────────────────
  { id: 'n_cre_1',  intent: 'NATURAL_LANGUAGE', subtype: 'creative', category: 'context',     priority: 1, text: 'Define the target audience: age group, background knowledge, and reading level.',                  applyTemplate: 'Add "Audience: [age/background/level]" to your prompt.' },
  { id: 'n_cre_2',  intent: 'NATURAL_LANGUAGE', subtype: 'creative', category: 'clarity',     priority: 1, text: 'Specify the tone: professional, conversational, humorous, inspirational, or academic.',            applyTemplate: 'Add "Tone: [professional|conversational|humorous|inspirational]" to your prompt.' },
  { id: 'n_cre_3',  intent: 'NATURAL_LANGUAGE', subtype: 'creative', category: 'specificity', priority: 2, text: 'State the desired length or word count to calibrate the depth of the response.',                   applyTemplate: 'Add "Length: [~500 words|3 paragraphs|under 200 words]" to your prompt.' },
  { id: 'n_cre_4',  intent: 'NATURAL_LANGUAGE', subtype: 'creative', category: 'format',      priority: 2, text: 'Define the structure: should it have headers, bullet points, or flowing prose?',                   applyTemplate: 'Add "Format: [headers|bullet points|prose|numbered list]" to your prompt.' },
  { id: 'n_cre_5',  intent: 'NATURAL_LANGUAGE', subtype: 'creative', category: 'context',     priority: 2, text: 'Provide a style reference (e.g., "in the style of Malcolm Gladwell" or "like The Economist").',   applyTemplate: 'Add "Style: [author/publication]" to your prompt.' },
  { id: 'n_cre_6',  intent: 'NATURAL_LANGUAGE', subtype: 'creative', category: 'specificity', priority: 3, text: 'List specific points, themes, or facts you want covered in the response.',                         applyTemplate: 'Add "Must cover: [point 1, point 2, point 3]" to your prompt.' },
  { id: 'n_cre_7',  intent: 'NATURAL_LANGUAGE', subtype: 'creative', category: 'clarity',     priority: 3, text: 'State the call-to-action or desired reader reaction (e.g., "leave reader feeling inspired").',    applyTemplate: 'Add "Goal: reader should feel/do [X] after reading" to your prompt.' },
  { id: 'n_cre_8',  intent: 'NATURAL_LANGUAGE', subtype: 'creative', category: 'context',     priority: 3, text: 'Describe the platform or medium: blog post, LinkedIn article, email newsletter, speech.',          applyTemplate: 'Add "Platform: [blog|LinkedIn|email|speech]" to your prompt.' },
  { id: 'n_cre_9',  intent: 'NATURAL_LANGUAGE', subtype: 'creative', category: 'format',      priority: 4, text: 'Specify the opening hook style: question, statistic, anecdote, or bold statement.',               applyTemplate: 'Add "Open with: [a question|a statistic|an anecdote|a bold claim]".' },
  { id: 'n_cre_10', intent: 'NATURAL_LANGUAGE', subtype: 'creative', category: 'specificity', priority: 4, text: 'Mention what NOT to include to avoid unwanted content (e.g., jargon, clichés, disclaimers).',     applyTemplate: 'Add "Avoid: [jargon|clichés|excessive qualifiers]" to your prompt.' },
  { id: 'n_cre_11', intent: 'NATURAL_LANGUAGE', subtype: 'creative', category: 'clarity',     priority: 5, text: 'Ask for a headline and a 2-sentence summary alongside the main content.',                         applyTemplate: 'Add "Also provide: a headline and 2-sentence summary" to your prompt.' },

  // ── NATURAL_LANGUAGE / analytical ────────────────────────────────────
  { id: 'n_ana_1',  intent: 'NATURAL_LANGUAGE', subtype: 'analytical', category: 'specificity', priority: 1, text: 'Define the scope of the analysis: time period, geographic region, or population.',              applyTemplate: 'Add "Scope: [time period|region|population]" to your prompt.' },
  { id: 'n_ana_2',  intent: 'NATURAL_LANGUAGE', subtype: 'analytical', category: 'clarity',     priority: 1, text: 'State the key question you want the analysis to answer.',                                        applyTemplate: 'Add "Central question: [specific question]" to your prompt.' },
  { id: 'n_ana_3',  intent: 'NATURAL_LANGUAGE', subtype: 'analytical', category: 'format',      priority: 2, text: 'Request the analysis structured as: findings → evidence → implications.',                       applyTemplate: 'Add "Structure: findings, supporting evidence, then implications" to your prompt.' },
  { id: 'n_ana_4',  intent: 'NATURAL_LANGUAGE', subtype: 'analytical', category: 'context',     priority: 2, text: 'Specify your background so the depth of explanation is calibrated correctly.',                   applyTemplate: 'Add "My background: [expert in field|general reader|student]" to your prompt.' },
  { id: 'n_ana_5',  intent: 'NATURAL_LANGUAGE', subtype: 'analytical', category: 'specificity', priority: 2, text: 'Ask for pros and cons or a balanced perspective if objectivity is important.',                   applyTemplate: 'Add "Present balanced perspectives: pros and cons / multiple viewpoints".' },
  { id: 'n_ana_6',  intent: 'NATURAL_LANGUAGE', subtype: 'analytical', category: 'format',      priority: 3, text: 'Request citations or references to sources if credibility is required.',                         applyTemplate: 'Add "Cite sources or note where to find supporting evidence".' },
  { id: 'n_ana_7',  intent: 'NATURAL_LANGUAGE', subtype: 'analytical', category: 'clarity',     priority: 3, text: 'Ask for the most important insight highlighted upfront (executive summary style).',              applyTemplate: 'Add "Lead with the single most important takeaway" to your prompt.' },
  { id: 'n_ana_8',  intent: 'NATURAL_LANGUAGE', subtype: 'analytical', category: 'specificity', priority: 3, text: 'Specify the desired level of technical detail: high-level overview vs. deep-dive.',              applyTemplate: 'Add "Detail level: [high-level overview|detailed analysis|deep-dive]".' },
  { id: 'n_ana_9',  intent: 'NATURAL_LANGUAGE', subtype: 'analytical', category: 'context',     priority: 4, text: 'Define what a successful answer looks like (what would make you confident in the analysis?).',  applyTemplate: 'Add "Success criteria: [what makes this analysis useful]" to your prompt.' },
  { id: 'n_ana_10', intent: 'NATURAL_LANGUAGE', subtype: 'analytical', category: 'format',      priority: 4, text: 'Request concrete, actionable recommendations at the end of the analysis.',                       applyTemplate: 'Add "End with 3 concrete, actionable recommendations" to your prompt.' },
  { id: 'n_ana_11', intent: 'NATURAL_LANGUAGE', subtype: 'analytical', category: 'specificity', priority: 5, text: 'List the specific metrics, data points, or criteria you want evaluated.',                        applyTemplate: 'Add "Evaluate specifically: [metric 1, metric 2, metric 3]".' },

  // ── NATURAL_LANGUAGE / general ────────────────────────────────────────
  { id: 'n_all_1',  intent: 'NATURAL_LANGUAGE', subtype: null, category: 'context',     priority: 1, text: 'Add role context ("You are an expert in [field]") to get more authoritative responses.',                applyTemplate: 'Prepend "You are an expert [role] with [X] years of experience." to your prompt.' },
  { id: 'n_all_2',  intent: 'NATURAL_LANGUAGE', subtype: null, category: 'clarity',     priority: 1, text: 'State the purpose of the output: who will read it and what decision it will inform.',                  applyTemplate: 'Add "Purpose: [decision/action this will support]" to your prompt.' },
  { id: 'n_all_3',  intent: 'NATURAL_LANGUAGE', subtype: null, category: 'specificity', priority: 2, text: 'Replace vague words like "good", "detailed", "comprehensive" with specific measurable criteria.',       applyTemplate: 'Replace vague adjectives with specific requirements.' },
  { id: 'n_all_4',  intent: 'NATURAL_LANGUAGE', subtype: null, category: 'format',      priority: 2, text: 'Specify the exact output format you need: markdown, plain text, bullet list, or numbered steps.',       applyTemplate: 'Add "Output format: [markdown|plain text|bullet list|numbered steps]".' },
  { id: 'n_all_5',  intent: 'NATURAL_LANGUAGE', subtype: null, category: 'context',     priority: 3, text: 'Provide background context so assumptions are minimised (what you already know).',                      applyTemplate: 'Add "Context I already have: [relevant background]" to your prompt.' },
  { id: 'n_all_6',  intent: 'NATURAL_LANGUAGE', subtype: null, category: 'specificity', priority: 3, text: 'Ask for examples, analogies, or case studies to make abstract points concrete.',                        applyTemplate: 'Add "Include examples or analogies to illustrate key points".' },
  { id: 'n_all_7',  intent: 'NATURAL_LANGUAGE', subtype: null, category: 'clarity',     priority: 4, text: 'State any constraints on the response: no jargon, no longer than X words, avoid topic Y.',             applyTemplate: 'Add "Constraints: [word limit|no jargon|avoid topic]" to your prompt.' },
  { id: 'n_all_8',  intent: 'NATURAL_LANGUAGE', subtype: null, category: 'format',      priority: 4, text: 'Request a confidence indicator or caveat section if the topic involves uncertainty.',                   applyTemplate: 'Add "Note areas of uncertainty or where expert advice is needed".' },
  { id: 'n_all_9',  intent: 'NATURAL_LANGUAGE', subtype: null, category: 'specificity', priority: 5, text: 'Break a complex task into sub-tasks so each is addressed systematically.',                              applyTemplate: 'Split your prompt into: Task 1, Task 2, Task 3.' },

  // ── HYBRID ────────────────────────────────────────────────────────────
  { id: 'h_1',  intent: 'HYBRID', subtype: null, category: 'clarity',     priority: 1, text: 'Separate technical requirements from narrative/explanation requirements into distinct sections.',               applyTemplate: 'Split into "Technical requirements:" and "Explanation requirements:".' },
  { id: 'h_2',  intent: 'HYBRID', subtype: null, category: 'context',     priority: 1, text: 'Add role context: "You are a senior [role] writing for [audience]" to balance technical and accessible content.', applyTemplate: 'Prepend "You are a [role] explaining [topic] to [audience]."' },
  { id: 'h_3',  intent: 'HYBRID', subtype: null, category: 'specificity', priority: 2, text: 'Specify how much code vs. explanation you want: e.g., 30% code snippets, 70% explanation.',                      applyTemplate: 'Add "Balance: [X]% code examples, [Y]% explanation" to your prompt.' },
  { id: 'h_4',  intent: 'HYBRID', subtype: null, category: 'format',      priority: 2, text: 'Define the code snippet style: minimal illustrative examples vs. production-ready complete solutions.',           applyTemplate: 'Add "Code style: [illustrative snippets|production-ready full code]".' },
  { id: 'h_5',  intent: 'HYBRID', subtype: null, category: 'clarity',     priority: 2, text: 'State the audience\'s technical level so code complexity and explanation depth are matched.',                    applyTemplate: 'Add "Audience technical level: [beginner|intermediate|advanced]".' },
  { id: 'h_6',  intent: 'HYBRID', subtype: null, category: 'context',     priority: 3, text: 'Specify the language/framework for all code examples to ensure consistency throughout.',                          applyTemplate: 'Add "All code examples in [language/framework]" to your prompt.' },
  { id: 'h_7',  intent: 'HYBRID', subtype: null, category: 'specificity', priority: 3, text: 'List the key concepts that must be explained vs. those that can be assumed as background knowledge.',            applyTemplate: 'Add "Explain: [concepts] | Assume knowledge of: [prerequisites]".' },
  { id: 'h_8',  intent: 'HYBRID', subtype: null, category: 'format',      priority: 3, text: 'Ask for a "Try it yourself" section or exercise at the end to reinforce learning.',                               applyTemplate: 'Add "End with a practical exercise for the reader" to your prompt.' },
  { id: 'h_9',  intent: 'HYBRID', subtype: null, category: 'clarity',     priority: 4, text: 'Request a glossary of technical terms used, especially if the audience is non-technical.',                       applyTemplate: 'Add "Include a glossary of key technical terms" to your prompt.' },
  { id: 'h_10', intent: 'HYBRID', subtype: null, category: 'specificity', priority: 4, text: 'Define the success criteria: what should the reader be able to do after reading?',                               applyTemplate: 'Add "After reading, the reader should be able to: [list skills]".' },
  { id: 'h_11', intent: 'HYBRID', subtype: null, category: 'context',     priority: 4, text: 'Mention real-world use cases or scenarios where the concept is applied.',                                         applyTemplate: 'Add "Include a real-world use case: [scenario]" to your prompt.' },
  { id: 'h_12', intent: 'HYBRID', subtype: null, category: 'format',      priority: 5, text: 'Request a table of contents or section outline before the full content.',                                         applyTemplate: 'Add "Start with a brief outline/table of contents" to your prompt.' },
  { id: 'h_13', intent: 'HYBRID', subtype: null, category: 'specificity', priority: 5, text: 'Ask for common mistakes or anti-patterns alongside the recommended approach.',                                    applyTemplate: 'Add "Include common mistakes to avoid" to your prompt.' },
  { id: 'h_14', intent: 'HYBRID', subtype: null, category: 'clarity',     priority: 5, text: 'Specify the output length: quick reference card, introductory article, or comprehensive guide.',                 applyTemplate: 'Add "Length: [cheat sheet|intro article|comprehensive guide]".' },
  { id: 'h_15', intent: 'HYBRID', subtype: null, category: 'context',     priority: 5, text: 'State the platform where this will be published (Dev.to, internal wiki, README) to calibrate formatting.',       applyTemplate: 'Add "Published on: [platform]" to calibrate formatting and length.' },
];

export class TipEngine {
  constructor() {
    this.tips = TIPS;
    this.cache = new LRUCache(500, 5 * 60 * 1000);
  }

  /**
   * Get 3–5 ranked tips for a given intent and subtype.
   * Results are cached by intent+subtype key.
   * @param {string} intent  'CODE'|'NATURAL_LANGUAGE'|'HYBRID'
   * @param {{ code: string|null, nl: string|null }} subtype
   * @param {number} count  Number of tips to return (default 4)
   * @returns {{ tips: object[], fromCache: boolean, generatedMs: number }}
   */
  getTips(intent, subtype = { code: null, nl: null }, count = 4) {
    const startMs = Date.now();
    const cacheKey = `${intent}_${subtype?.code || 'null'}_${subtype?.nl || 'null'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return { tips: cached, fromCache: true, generatedMs: Date.now() - startMs };

    const codeSubtype = subtype?.code || null;
    const nlSubtype = subtype?.nl || null;

    // Filter: match intent, then match specific subtype OR general (null subtype)
    const relevant = this.tips.filter(t => {
      if (t.intent !== intent) return false;
      if (t.subtype === null) return true; // general tip for this intent
      if (t.subtype === codeSubtype || t.subtype === nlSubtype) return true;
      return false;
    });

    // Sort by priority ascending (1 = highest), then diversify by category
    relevant.sort((a, b) => a.priority - b.priority);
    const selected = this._diversify(relevant, count);

    this.cache.set(cacheKey, selected);
    return { tips: selected, fromCache: false, generatedMs: Date.now() - startMs };
  }

  /**
   * Select tips ensuring category diversity.
   */
  _diversify(sorted, count) {
    const result = [];
    const usedCategories = new Set();
    // First pass: pick highest-priority tip from each unique category
    for (const tip of sorted) {
      if (result.length >= count) break;
      if (!usedCategories.has(tip.category)) {
        result.push(tip);
        usedCategories.add(tip.category);
      }
    }
    // Second pass: fill remaining slots with next best tips
    for (const tip of sorted) {
      if (result.length >= count) break;
      if (!result.includes(tip)) result.push(tip);
    }
    return result.slice(0, count);
  }

  cacheStats() { return this.cache.stats(); }
}
