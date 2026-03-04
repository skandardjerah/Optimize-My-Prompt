import Anthropic from '@anthropic-ai/sdk';
import { Cache } from '../utils/Cache.js';

export class PromptEnhancer {
  constructor(apiKey, promptLibrary) {
    this.anthropic = new Anthropic({ apiKey });
    this.promptLibrary = promptLibrary;
    this.cache = new Cache(3600000);
  }

  cleanJSON(text) {
    // Split on backticks and take the middle part
    if (text.includes('```')) {
      const parts = text.split('```');
      // Usually: ['', 'json\n{...}', '']
      for (let part of parts) {
        if (part.includes('{') && part.includes('}')) {
          text = part.replace('json', '').trim();
          break;
        }
      }
    }
    
    // Extract JSON between first { and last }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      text = text.substring(start, end + 1);
    }
    
    return text.trim();
  }

  // UPDATED: Language detection function with 17+ languages
  detectLanguage(code) {
    const trimmed = code.trim();
    const firstLine = trimmed.split('\n')[0].toLowerCase();
    
    // Python
    if (/^(import |from |def |class |@|print\(|if __name__|async def|lambda |elif )/.test(trimmed) || 
        /:\s*$/m.test(trimmed.split('\n')[0]) ||
        /__init__|self\./.test(trimmed)) {
      return 'Python';
    }
    
    // JavaScript/TypeScript
    if (/^(const |let |var |function |class |import |export |=>|\/\/|async |await |require\()/.test(trimmed) ||
        /\{\s*$|;\s*$/.test(trimmed.split('\n')[0]) ||
        /console\.log|module\.exports/.test(trimmed)) {
      return 'JavaScript';
    }
    
    // TypeScript (more specific)
    if (/^(interface |type |enum |namespace |declare )/.test(trimmed) ||
        /: (string|number|boolean|any|void)/.test(trimmed)) {
      return 'TypeScript';
    }
    
    // Java
    if (/^(public |private |protected |package |import java|@Override|System\.|class .* extends|class .* implements)/.test(trimmed)) {
      return 'Java';
    }
    
    // C/C++
    if (/^(#include|using namespace|int main|void |struct |typedef |#define )/.test(trimmed)) {
      return 'C++';
    }
    
    // C#
    if (/^(using System|namespace |public class |private class |get; set;)/.test(trimmed)) {
      return 'C#';
    }
    
    // Go
    if (/^(package |func |import \"|type |var |:= |fmt\.)/.test(trimmed)) {
      return 'Go';
    }
    
    // Rust
    if (/^(fn |use |mod |pub |let mut|impl |trait |struct |enum |cargo)/.test(trimmed)) {
      return 'Rust';
    }
    
    // PHP
    if (/^(<\?php|namespace |use |class |function |\$|echo |require|include)/.test(trimmed)) {
      return 'PHP';
    }
    
    // Ruby
    if (/^(require |class |def |module |attr_|puts )/.test(trimmed) || /\bend\b/.test(trimmed)) {
      return 'Ruby';
    }
    
    // Swift
    if (/^(import Foundation|import UIKit|func |class |struct |var |let |@)/.test(trimmed)) {
      return 'Swift';
    }
    
    // Kotlin
    if (/^(fun |class |val |var |package |import kotlin|data class)/.test(trimmed)) {
      return 'Kotlin';
    }
    
    // SQL
    if (/^(SELECT |INSERT |UPDATE |DELETE |CREATE |ALTER |DROP |FROM |WHERE |JOIN |TABLE)/i.test(trimmed) ||
        /^(select |insert |update |delete |create |alter |drop |from |where |join |table)/.test(trimmed)) {
      return 'SQL';
    }
    
    // R
    if (/^(library\(|require\(|<- |function\(|data\.frame|ggplot|dplyr)/.test(trimmed) ||
        firstLine.includes('library(') ||
        firstLine.includes('require(')) {
      return 'R';
    }
    
    // Scala
    if (/^(object |class |trait |def |val |var |import scala|case class)/.test(trimmed)) {
      return 'Scala';
    }
    
    // Perl
    if (/^(use strict|use warnings|my \$|sub |package )/.test(trimmed) || 
        /^#!\/usr\/bin\/perl/.test(trimmed)) {
      return 'Perl';
    }
    
    // Shell/Bash
    if (/^#!\/bin\/(bash|sh)/.test(trimmed) ||
        /^(export |source |if \[ |function )/.test(trimmed)) {
      return 'Shell';
    }
    
    // Default to Python if can't detect
    return 'Python';
  }

  async enhance(userPrompt, taskType = 'general_query', outputFormat = 'natural') {
    try {
      const cacheKey = `${userPrompt}_${taskType}_${outputFormat}`;
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;

      const enhancementPrompt = this.promptLibrary.renderTemplate('prompt_enhancement', {
        UserPrompt: userPrompt,
        IntendedTask: taskType,
        DesiredOutputFormat: outputFormat
      });

      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: enhancementPrompt }]
      });

      const text = this.cleanJSON(response.content[0].text);
      const result = JSON.parse(text);

      const finalResult = {
        success: true,
        original: userPrompt,
        enhanced: result.enhanced_prompt,
        analysis: result.analysis,
        techniques: result.enhancement_techniques_used,
        rationale: result.rationale,
        tips: result.additional_tips || [],
        taskType: taskType,
        outputFormat: outputFormat
      };

      this.cache.set(cacheKey, finalResult);
      return finalResult;

    } catch (error) {
      console.error('PromptEnhancer Error:', error.message);
      return {
        success: false,
        error: error.message,
        original: userPrompt,
        enhanced: null
      };
    }
  }

  async generateSQL(query, schema, dialect = 'PostgreSQL') {
    try {
      const sqlPrompt = this.promptLibrary.renderTemplate('text_to_sql', {
        Query: query,
        Schema: schema,
        Dialect: dialect
      });

      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: sqlPrompt }]
      });

      const text = this.cleanJSON(response.content[0].text);
      const result = JSON.parse(text);

      return {
        success: true,
        queries: result.suggested_queries,
        explanation: result.explanation,
        warnings: result.warnings || [],
        schema: schema,
        dialect: dialect
      };

    } catch (error) {
      console.error('SQL Generation Error:', error.message);
      return {
        success: false,
        error: error.message,
        queries: null
      };
    }
  }

  async reviewCode(code, language = 'Auto-detect', focus = 'all') {
    try {
      // Auto-detect language if not specified
      let detectedLanguage = language;
      
      if (language === 'Auto-detect' || !language) {
        detectedLanguage = this.detectLanguage(code);
        console.log(`🔍 Detected language: ${detectedLanguage}`);
      }

      // Build custom review prompt with natural language mention
      const reviewPrompt = `You are an expert ${detectedLanguage} developer conducting a thorough code review.

Review this ${detectedLanguage} code for:
${focus === 'all' ? 
  '- Security vulnerabilities\n- Performance issues\n- Code clarity and maintainability\n- Best practices adherence\n- Edge cases and error handling' : 
  `- ${focus}`}

Code to review:
\`\`\`${detectedLanguage.toLowerCase()}
${code}
\`\`\`

Provide a comprehensive review in this JSON format:
{
  "overall_score": "score from 1-10",
  "summary": "Start with: 'This is [language] code...' then provide your overall assessment in a natural, conversational tone",
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "description": "Clear description of the issue",
      "suggestion": "Specific, actionable fix"
    }
  ],
  "strengths": ["positive aspects of the code"]
}

CRITICAL INSTRUCTIONS:
1. Begin the summary with "This ${detectedLanguage} code..." to naturally mention the language
2. Review this as ${detectedLanguage} code, not any other language
3. All suggestions must be ${detectedLanguage}-specific
4. Return ONLY the JSON object with no markdown formatting or code blocks`;

      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{ role: 'user', content: reviewPrompt }]
      });

      const text = this.cleanJSON(response.content[0].text);
      const result = JSON.parse(text);

      return {
        success: true,
        overallScore: result.overall_score,
        summary: result.summary,
        issues: result.issues,
        strengths: result.strengths,
        language: detectedLanguage,
        focus: focus
      };

    } catch (error) {
      console.error('Code Review Error:', error.message);
      return {
        success: false,
        error: error.message,
        issues: null
      };
    }
  }
}
