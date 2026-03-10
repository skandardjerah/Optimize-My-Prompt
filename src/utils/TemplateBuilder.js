export class TemplateBuilder {
  constructor(promptLibrary) {
    this.promptLibrary = promptLibrary;
  }

  create(config) {
    if (!config.id || !config.template) {
      throw new Error('Template must have id and template');
    }

    const template = {
      id: config.id,
      category: config.category || 'custom',
      version: config.version || '1.0',
      description: config.description || 'Custom template',
      input_variables: config.input_variables || [],
      output_format: config.output_format || 'text',
      use_cases: config.use_cases || [],
      quality_score: config.quality_score || 0.5,
      defaults: config.defaults || {},
      validation: config.validation || {},
      template: config.template
    };

    this.promptLibrary.registerPrompt(template);
    return template;
  }

  list() {
    return this.promptLibrary.listPrompts();
  }

  get(id) {
    return this.promptLibrary.getPrompt(id);
  }
}