export const textToSqlPrompt = {
  id: "text_to_sql",
  category: "database",
  version: "2.0",
  description: "Converts natural language queries into SQL statements",
  input_variables: ["Query", "Schema", "Dialect"],
  output_format: "json",
  use_cases: ["data_analysis", "reporting", "database_queries"],
  quality_score: 0.85,
  
  defaults: {
    Dialect: "PostgreSQL"
  },
  
  validation: {
    Query: { required: true, type: "string", minLength: 3 },
    Schema: { required: true, type: "string", minLength: 5 },
    Dialect: { required: false, type: "string", enum: ["PostgreSQL", "MySQL", "SQL Server", "SQLite"] }
  },
  
  template: `You are an expert SQL database consultant specializing in {{.Dialect}}.

Your task is to convert natural language queries into SQL.

Output Format (Valid JSON):
{
  "suggested_queries": [{
    "sql": "SELECT ...",
    "explanation": "What this does",
    "execution_order": 1,
    "estimated_complexity": "low|medium|high"
  }],
  "explanation": "Overall analysis",
  "warnings": ["Any caveats"]
}

Rules:
1. Safety First: No DROP, TRUNCATE, or DELETE without WHERE clauses
2. Use proper SQL syntax for {{.Dialect}}
3. Optimize queries when possible
4. Include clear explanations

User Query: {{.Query}}
Database Schema: {{.Schema}}

CRITICAL: Return ONLY the JSON object. Start with { and end with }. NO markdown, NO backticks, NO code blocks.`
};