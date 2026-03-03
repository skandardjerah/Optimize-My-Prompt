export class FeedbackCollector {
  constructor() {
    this.feedback = [];
  }

  collect(data) {
    this.feedback.push({
      ...data,
      timestamp: new Date()
    });
  }

  analyze() {
    const total = this.feedback.length;
    const positive = this.feedback.filter(f => f.rating >= 4).length;
    
    return {
      totalFeedback: total,
      positiveRate: total > 0 ? ((positive / total) * 100).toFixed(1) + '%' : '0%',
      avgRating: total > 0 ? (this.feedback.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1) : 0,
      recent: this.feedback.slice(-10)
    };
  }

  getByPrompt(promptId) {
    const items = this.feedback.filter(f => f.promptId === promptId);
    if (items.length === 0) return null;
    
    const avg = items.reduce((sum, f) => sum + f.rating, 0) / items.length;
    return {
      promptId,
      count: items.length,
      avgRating: avg.toFixed(1)
    };
  }
}