/**
 * ConversationStore - Manages conversation history and context
 */
export class ConversationStore {
  constructor() {
    this.conversations = new Map();
  }

  /**
   * Create a new conversation
   * @param {string} userId - User identifier (can be IP, session ID, etc.)
   * @returns {string} - Conversation ID
   */
  createConversation(userId = 'anonymous') {
    const conversationId = this.generateId();
    this.conversations.set(conversationId, {
      id: conversationId,
      userId: userId,
      messages: [],
      context: {},
      createdAt: new Date(),
      lastActivity: new Date()
    });
    return conversationId;
  }

  /**
   * Add a message to conversation history
   * @param {string} conversationId - Conversation ID
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Message content
   */
  addMessage(conversationId, role, content) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.messages.push({
      role: role,
      content: content,
      timestamp: new Date()
    });

    conversation.lastActivity = new Date();
  }

  /**
   * Get conversation by ID
   * @param {string} conversationId
   * @returns {Object} - Conversation object
   */
  getConversation(conversationId) {
    return this.conversations.get(conversationId);
  }

  /**
   * Get conversation messages
   * @param {string} conversationId
   * @returns {Array} - Array of messages
   */
  getMessages(conversationId) {
    const conversation = this.conversations.get(conversationId);
    return conversation ? conversation.messages : [];
  }

  /**
   * Update conversation context
   * @param {string} conversationId
   * @param {Object} context - Context data to merge
   */
  updateContext(conversationId, context) {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.context = { ...conversation.context, ...context };
    }
  }

  /**
   * Get conversation context
   * @param {string} conversationId
   * @returns {Object} - Context data
   */
  getContext(conversationId) {
    const conversation = this.conversations.get(conversationId);
    return conversation ? conversation.context : {};
  }

  /**
   * Delete old conversations (cleanup)
   * @param {number} maxAgeHours - Delete conversations older than this
   */
  cleanup(maxAgeHours = 24) {
    const now = new Date();
    const cutoff = new Date(now.getTime() - (maxAgeHours * 60 * 60 * 1000));

    for (const [id, conversation] of this.conversations.entries()) {
      if (conversation.lastActivity < cutoff) {
        this.conversations.delete(id);
      }
    }
  }

  /**
   * Get all conversations for a user
   * @param {string} userId
   * @returns {Array} - Array of conversations
   */
  getUserConversations(userId) {
    const userConvos = [];
    for (const conversation of this.conversations.values()) {
      if (conversation.userId === userId) {
        userConvos.push(conversation);
      }
    }
    return userConvos;
  }

  /**
   * Get conversation statistics
   * @returns {Object} - Stats about conversations
   */
  getStats() {
    let totalMessages = 0;
    for (const conversation of this.conversations.values()) {
      totalMessages += conversation.messages.length;
    }

    return {
      totalConversations: this.conversations.size,
      totalMessages: totalMessages,
      avgMessagesPerConversation: this.conversations.size > 0 
        ? (totalMessages / this.conversations.size).toFixed(2)
        : 0
    };
  }

  /**
   * Generate unique conversation ID
   * @returns {string}
   */
  generateId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}