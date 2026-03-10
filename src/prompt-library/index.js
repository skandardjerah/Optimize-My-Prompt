import { PromptLibrary } from './PromptLibrary.js';
import { textToSqlPrompt } from './prompts/textToSql.js';
import { codeReviewPrompt } from './prompts/codeReview.js';
import { promptEnhancementPrompt } from './prompts/promptEnhancement.js';

export function createPromptLibrary() {
  const library = new PromptLibrary();
  
  library.registerPrompt(textToSqlPrompt);
  library.registerPrompt(codeReviewPrompt);
  library.registerPrompt(promptEnhancementPrompt);
  
  return library;
}

export {
  PromptLibrary,
  textToSqlPrompt,
  codeReviewPrompt,
  promptEnhancementPrompt
};

export const defaultLibrary = createPromptLibrary();