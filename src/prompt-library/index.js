import { PromptLibrary } from './PromptLibrary.js';
import { codeReviewPrompt } from './prompts/codeReview.js';
import { promptEnhancementPrompt } from './prompts/promptEnhancement.js';

export function createPromptLibrary() {
  const library = new PromptLibrary();

  library.registerPrompt(codeReviewPrompt);
  library.registerPrompt(promptEnhancementPrompt);

  return library;
}

export {
  PromptLibrary,
  codeReviewPrompt,
  promptEnhancementPrompt
};

export const defaultLibrary = createPromptLibrary();
