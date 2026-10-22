import api from './api';

const CHAT_STORAGE_KEY = 'okfit_chat_history';

function getStoredMessages() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: "Hello! I'm your OKfit AI Nutrition & Health Coach. How can I support your fitness goals today? Ask me about meals, calorie targets, macros, or healthy swaps!",
        createdAt: new Date().toISOString(),
      },
    ];
  } catch {
    return [];
  }
}

function saveStoredMessages(messages) {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
}

export const chatService = {
  async sendMessage(message) {
    try {
      const response = await api.post('/chat', { message });
      return response.data;
    } catch (err) {
      if (!err.response) {
        // Fallback intelligent nutritionist AI simulation
        const history = getStoredMessages();
        const userMsg = {
          id: 'msg_' + Date.now(),
          role: 'user',
          content: message,
          createdAt: new Date().toISOString(),
        };

        const lower = message.toLowerCase();
        let reply = "That's a great question! For optimal fitness and body composition, balance your protein intake (aim for 1.6 - 2.0g per kg of body weight) with complex carbohydrates and healthy unsaturated fats.";

        if (lower.includes('protein') || lower.includes('muscle')) {
          reply = "To support muscle protein synthesis, aim for 20-35g of high-quality protein per meal. Great sources include chicken breast, eggs, Greek yogurt, lentils, tofu, and whey protein.";
        } else if (lower.includes('lose') || lower.includes('cut') || lower.includes('fat')) {
          reply = "For sustainable fat loss, maintaining a modest caloric deficit of 300-500 kcal below your TDEE is ideal. Prioritize dietary fiber and lean protein to preserve satiety and lean muscle mass.";
        } else if (lower.includes('water') || lower.includes('hydrat')) {
          reply = "Staying well hydrated is essential for cellular metabolism and recovery! Aim for 2.5 to 3 liters of water per day, and more if you train intensely in warm weather.";
        } else if (lower.includes('carb') || lower.includes('rice') || lower.includes('bread')) {
          reply = "Carbohydrates are your brain and muscles' primary energy currency! Favor slow-digesting whole grains, sweet potatoes, oats, and fruit around your active training windows.";
        } else if (lower.includes('snack') || lower.includes('hungry')) {
          reply = "Smart snacks that keep your blood sugar steady include Greek yogurt with berries, a handful of raw almonds with an apple, or boiled eggs with a pinch of sea salt.";
        }

        const botMsg = {
          id: 'msg_bot_' + Date.now(),
          role: 'assistant',
          content: reply,
          createdAt: new Date().toISOString(),
        };

        const updated = [...history, userMsg, botMsg];
        saveStoredMessages(updated);

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              success: true,
              message: botMsg,
              history: updated,
            });
          }, 800);
        });
      }
      throw err;
    }
  },

  async getHistory() {
    try {
      const response = await api.get('/chat/history');
      return response.data;
    } catch (err) {
      if (!err.response) {
        return { success: true, messages: getStoredMessages() };
      }
      throw err;
    }
  },

  async clearChat() {
    try {
      const response = await api.delete('/chat/history');
      return response.data;
    } catch (err) {
      if (!err.response) {
        const welcome = [
          {
            id: 'msg_welcome_' + Date.now(),
            role: 'assistant',
            content: "Hello! I'm your OKfit AI Nutrition & Health Coach. How can I support your fitness goals today?",
            createdAt: new Date().toISOString(),
          },
        ];
        saveStoredMessages(welcome);
        return { success: true, messages: welcome };
      }
      throw err;
    }
  },
};

export default chatService;
