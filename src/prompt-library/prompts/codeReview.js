export const codeReviewPrompt = {
  id: "code_review",
  category: "development",
  version: "1.0",
  description: "Provides detailed code review feedback",
  input_variables: ["Code", "Language", "ReviewFocus", "LanguageInstruction"],
  output_format: "json",
  use_cases: ["code_quality", "security_audit", "best_practices"],
  quality_score: 0.90,
  
  defaults: {
    Language: "JavaScript",
    ReviewFocus: "all",
    LanguageInstruction: ""
  },
  
  validation: {
    Code: { required: true, type: "string", minLength: 10 },
    Language: { required: false, type: "string" },
    ReviewFocus: { required: false, type: "string", enum: ["all", "security", "performance", "readability"] }
  },
  
  template: `{{.LanguageInstruction}}You are an expert {{.Language}} developer conducting a code review.

Review Focus: {{.ReviewFocus}}

Output Format (Valid JSON):
{
  "overall_score": 8.5,
  "summary": "Brief overview",
  "issues": [{
    "severity": "critical|high|medium|low",
    "category": "security|performance|bugs|style",
    "line": 42,
    "description": "What's wrong",
    "suggestion": "How to fix"
  }],
  "strengths": ["Good practices found"]
}

Code to Review:
\`\`\`{{.Language}}
{{.Code}}
\`\`\`

CRITICAL: Return ONLY the JSON object. Start with { and end with }. NO markdown, NO backticks, NO code blocks.`
};