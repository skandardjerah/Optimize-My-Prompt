import { Router } from 'express';
import { IntentClassifier } from '../services/IntentClassifier.js';
import { validateClassifyRequest } from '../middleware/requestValidator.js';

const router = Router();
const classifier = new IntentClassifier();

/**
 * POST /api/classify
 * Tier 2 server-side classification using the 32-dim feature vector.
 *
 * Body: { prompt: string, intentHint?: 'CODE'|'NL'|'NATURAL_LANGUAGE'|'HYBRID' }
 * Response: { intent, confidence, tier, subtype, features, processingMs }
 */
router.post('/', validateClassifyRequest, (req, res, next) => {
  try {
    const { prompt, intentHint } = req.body;
    const result = classifier.classify(prompt, intentHint || null);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
