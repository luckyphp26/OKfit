const ChatMessage = require('../models/ChatMessage');
const openaiService = require('../services/openaiService');

/**
 * @desc    Send a message to the AI nutrition assistant and receive response
 * @route   POST /api/chat
 * @access  Private
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a non-empty message'
      });
    }

    const trimmedMessage = message.trim();

    // Find or create conversation document for user
    let chatSession = await ChatMessage.findOne({ userId: req.user.id });

    if (!chatSession) {
      chatSession = new ChatMessage({
        userId: req.user.id,
        messages: []
      });
    }

    // Append user message
    const userMsgObj = {
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date()
    };
    chatSession.messages.push(userMsgObj);

    // Provide context: take last 10 messages for conversation continuity
    const recentContext = chatSession.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content
    }));

    // Call OpenAI service
    const assistantReply = await openaiService.chat(recentContext);

    // Append assistant response
    const assistantMsgObj = {
      role: 'assistant',
      content: assistantReply,
      timestamp: new Date()
    };
    chatSession.messages.push(assistantMsgObj);

    await chatSession.save();

    res.status(200).json({
      success: true,
      data: assistantMsgObj
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get complete chat history for current user
 * @route   GET /api/chat/history
 * @access  Private
 */
const getHistory = async (req, res, next) => {
  try {
    const chatSession = await ChatMessage.findOne({ userId: req.user.id });

    res.status(200).json({
      success: true,
      data: chatSession ? chatSession.messages : []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear all chat messages for current user
 * @route   DELETE /api/chat
 * @access  Private
 */
const clearChat = async (req, res, next) => {
  try {
    await ChatMessage.findOneAndDelete({ userId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getHistory,
  clearChat
};
