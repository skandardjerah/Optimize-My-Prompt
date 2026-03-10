export class PromptLibrary {
  constructor() {
    this.prompts = new Map();
  }

  registerPrompt(promptConfig) {
    if (!promptConfig.id) throw new Error('Prompt must have an id');
    if (!promptConfig.template) throw new Error('Prompt must have a template');
    this.prompts.set(promptConfig.id, promptConfig);
  }

  getPrompt(promptId) {
    const prompt = this.prompts.get(promptId);
    if (!prompt) throw new Error(`Prompt '${promptId}' not found`);
    return prompt;
  }

  renderTemplate(promptId, variables = {}) {
    const prompt = this.getPrompt(promptId);
    const finalVariables = { ...prompt.defaults, ...variables };
    this.validateInputs(prompt, finalVariables);
    
    let rendered = prompt.template;
    for (const [key, value] of Object.entries(finalVariables)) {
      const regex = new RegExp(`{{\.${key}}}`, 'g');
      rendered = rendered.replace(regex, value);
    }
    return rendered;
  }

  validateInputs(prompt, variables) {
    if (!prompt.validation) return;
    
    for (const [key, rules] of Object.entries(prompt.validation)) {
      const value = variables[key];
      
      if (rules.required && (value === undefined || value === null || value === '')) {
        throw new Error(`Missing required variable: ${key}`);
      }
      
      if (value !== undefined && rules.type) {
        const actualType = typeof value;
        if (actualType !== rules.type) {
          throw new Error(`Variable '${key}' must be of type ${rules.type}`);
        }
      }
      
      if (value !== undefined && rules.enum && !rules.enum.includes(value)) {
        throw new Error(`Invalid value for '${key}'. Must be one of: ${rules.enum.join(', ')}`);
      }
    }
  }

  listPrompts() {
    return Array.from(this.prompts.values()).map(p => ({
      id: p.id,
      category: p.category,
      version: p.version
    }));
  }
}