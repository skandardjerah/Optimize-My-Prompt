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

  async reviewCode(code, language = 'JavaScript', focus = 'all') {
    try {
      const reviewPrompt = this.promptLibrary.renderTemplate('code_review', {
        Code: code,
        Language: language,
        ReviewFocus: focus
      });

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
        language: language,
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