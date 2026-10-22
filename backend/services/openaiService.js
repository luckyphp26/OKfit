const OpenAI = require('openai');

const SYSTEM_PROMPT =
  "You are OKFit's nutrition assistant. You help users with questions about food, nutrition, calories, healthy eating, meal planning, and ingredients. Provide accurate, helpful information. If asked about medical conditions or specific health advice, remind users to consult a healthcare professional. Keep responses concise and friendly.";

/**
 * Sends messages to OpenAI Chat Completion API
 * @param {Array} messages - Array of { role: 'user'|'assistant'|'system', content: string }
 * @returns {Promise<string>} Assistant's text response
 */
const chat = async (messages) => {
  const apiKey = process.env.OPENAI_API_KEY;

  // Handle missing or placeholder API key gracefully
  if (
    !apiKey ||
    apiKey === 'your-openai-api-key-here' ||
    apiKey.trim() === ''
  ) {
    return (
      "I am OKFit's nutrition assistant. To chat with me live, please set a valid " +
      "OPENAI_API_KEY in the backend .env configuration. In the meantime, you can track " +
      "your daily calories, log meals, and calculate your personalized macros on the dashboard!"
    );
  }

  try {
    const openai = new OpenAI({ apiKey });

    // Format conversation history, ensuring system prompt is placed first
    const formattedMessages = [];

    const hasSystem = messages.some((m) => m.role === 'system');
    if (!hasSystem) {
      formattedMessages.push({
        role: 'system',
        content: SYSTEM_PROMPT
      });
    }

    messages.forEach((msg) => {
      formattedMessages.push({
        role: msg.role || 'user',
        content: String(msg.content || '')
      });
    });

    const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: formattedMessages,
      max_tokens: 600,
      temperature: 0.7
    });

    const responseContent =
      completion.choices &&
      completion.choices[0] &&
      completion.choices[0].message
        ? completion.choices[0].message.content
        : "I'm sorry, I couldn't generate a response at this time.";

    return responseContent.trim();
  } catch (error) {
    console.error('OpenAI Service Error:', error.message);

    // Provide friendly error message based on common API errors
    if (error.status === 401 || (error.message && error.message.includes('401'))) {
      return 'The OpenAI API key provided is invalid. Please verify your OPENAI_API_KEY in the backend configuration.';
    }

    if (error.status === 429 || (error.message && error.message.includes('quota'))) {
      return 'The AI assistant has reached its rate or quota limit for now. Please check your OpenAI account billing or try again in a few moments.';
    }

    return (
      'Sorry, I encountered an issue processing your nutrition request. ' +
      'Please try again in a moment.'
    );
  }
};

module.exports = {
  SYSTEM_PROMPT,
  chat
};
