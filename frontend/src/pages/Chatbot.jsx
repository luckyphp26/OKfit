import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const { addToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchChat() {
      try {
        const res = await chatService.getHistory();
        if (isMounted && res?.messages) {
          setMessages(res.messages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchChat();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const cleanText = inputValue.trim();
    if (!cleanText || isTyping) return;

    // Optimistically add user message
    const tempUserMsg = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: cleanText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(cleanText);
      if (response?.message) {
        setMessages((prev) => [...prev, response.message]);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to receive response from AI Coach', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    try {
      const res = await chatService.clearChat();
      if (res?.messages) {
        setMessages(res.messages);
      } else {
        setMessages([]);
      }
      addToast('Chat conversation cleared', 'info');
    } catch (err) {
      console.error(err);
      addToast('Could not clear chat history', 'error');
    }
  };

  const quickPrompts = [
    'How much protein should I eat to build muscle?',
    'What are good low-calorie snack swaps?',
    'How do I calculate a healthy calorie deficit?',
    'Best pre-workout meals for high energy?',
  ];

  return (
    <div className="chat-page">
      {/* Top Disclaimer Banner */}
      <div className="chat-disclaimer-banner">
        <span>⚠️</span>
        <span>
          <strong>Health Advisory:</strong> This AI assistant provides educational fitness and
          nutrition information only, not professional medical advice.
        </span>
      </div>

      <div className="chat-container glass-card">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-coach-profile">
            <div className="coach-avatar">🤖</div>
            <div className="coach-info">
              <h2 className="coach-name">OKfit AI Coach</h2>
              <span className="coach-status">
                <span className="status-indicator-dot" /> Online • Nutrition & Macros Specialist
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleClear}
            title="Clear Chat History"
          >
            🗑️ Clear Chat
          </button>
        </div>

        {/* Message Stream */}
        <div className="chat-messages-stream">
          {isLoading ? (
            <div className="chat-loading-overlay">
              <LoadingSpinner size="medium" />
              <span>Connecting to Coach...</span>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const timeStr = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={msg.id}
                    className={`message-bubble-wrapper ${isUser ? 'user-wrapper' : 'assistant-wrapper'}`}
                  >
                    {!isUser && <div className="msg-avatar">🤖</div>}

                    <div className={`message-bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}`}>
                      <div className="bubble-text">{msg.content}</div>
                      <span className="bubble-timestamp">{timeStr}</span>
                    </div>

                    {isUser && <div className="msg-avatar user-msg-avatar">👤</div>}
                  </div>
                );
              })}

              {isTyping && (
                <div className="message-bubble-wrapper assistant-wrapper">
                  <div className="msg-avatar">🤖</div>
                  <div className="message-bubble bubble-assistant typing-bubble">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="quick-prompts-bar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="prompt-chip"
                onClick={() => {
                  setInputValue(prompt);
                  textareaRef.current?.focus();
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Dock */}
        <form className="chat-input-dock" onSubmit={handleSend}>
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask your coach anything about food, calories, or recipes (Press Enter to send)..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isTyping}
          />

          <button
            type="submit"
            className="btn btn-primary chat-send-btn"
            disabled={!inputValue.trim() || isTyping}
            aria-label="Send Message"
          >
            <span>Send</span>
            <span>➤</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
