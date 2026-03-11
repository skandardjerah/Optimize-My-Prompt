/**
 * StreamHandler — Server-Sent Events manager.
 * Provides typed event senders for the /api/optimize SSE stream.
 *
 * Event types emitted:
 *   intent  — { intent, confidence, subtype }
 *   tip     — { id, category, text, applyTemplate }
 *   chunk   — { text }  (streaming LLM tokens)
 *   quality — { score, label, breakdown }
 *   done    — { totalMs }
 *   error   — { message }
 */
export class StreamHandler {
  /**
   * @param {import('express').Response} res  Express response object
   */
  constructor(res) {
    this.res = res;
    this.startMs = Date.now();
    this._open = false;
  }

  /** Set SSE headers and mark stream as open. */
  open() {
    if (this._open) return;
    this.res.setHeader('Content-Type', 'text/event-stream');
    this.res.setHeader('Cache-Control', 'no-cache');
    this.res.setHeader('Connection', 'keep-alive');
    this.res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering
    this.res.flushHeaders();
    this._open = true;
  }

  /** Send a typed SSE event. */
  send(type, data) {
    if (!this._open) return;
    const payload = JSON.stringify({ type, ...data });
    this.res.write(`data: ${payload}\n\n`);
  }

  /** Emit the classified intent. */
  sendIntent(intent, confidence, subtype) {
    this.send('intent', { intent, confidence, subtype });
  }

  /** Emit a single tip object. */
  sendTip(tip) {
    this.send('tip', {
      id: tip.id,
      category: tip.category,
      text: tip.text,
      applyTemplate: tip.applyTemplate,
    });
  }

  /** Emit a streaming LLM text chunk. */
  sendChunk(text) {
    this.send('chunk', { text });
  }

  /** Emit the quality score after LLM output is complete. */
  sendQuality(score, label, breakdown) {
    this.send('quality', { score, label, breakdown });
  }

  /** Close the stream with a done event. */
  done() {
    if (!this._open) return;
    this.send('done', { totalMs: Date.now() - this.startMs });
    this.res.end();
    this._open = false;
  }

  /** Emit an error event and close the stream. */
  error(message) {
    if (!this._open) {
      // Headers not sent yet — fall back to normal HTTP error
      try { this.res.status(500).json({ error: message }); } catch (_) {}
      return;
    }
    this.send('error', { message });
    this.res.end();
    this._open = false;
  }

  /** Whether the stream is still active. */
  get isOpen() { return this._open; }
}
