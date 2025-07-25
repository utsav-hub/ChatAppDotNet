import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { chatAPI } from '../services/api';
import { ChatMessage } from '../types';

interface ChatBotProps {
  sessionId: string;
  userId: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ sessionId, userId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversation history
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const history = await chatAPI.getConversationHistory(sessionId);
        setMessages(history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();

    // Send initial greeting if no history
    const sendInitialGreeting = async () => {
      if (messages.length === 0) {
        try {
          await chatAPI.sendMessage('Hello', sessionId, userId);
          const history = await chatAPI.getConversationHistory(sessionId);
          setMessages(history.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        } catch (error) {
          console.error('Failed to send initial greeting:', error);
        }
      }
    };

    if (messages.length === 0) {
      sendInitialGreeting();
    }
  }, [sessionId, userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    // Add user message immediately
    const tempUserMessage: ChatMessage = {
      type: 'user',
      message: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await chatAPI.sendMessage(userMessage, sessionId, userId);
      
      // Add bot response
      const botMessage: ChatMessage = {
        type: 'bot',
        message: response.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev.slice(0, -1), tempUserMessage, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        type: 'bot',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatMessage = (message: string) => {
    // Simple markdown-like formatting
    return message
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <span className="ml-2 text-gray-600">Loading chat...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow-lg border">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="bg-primary-500 p-2 rounded-full">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Health Assistant</h3>
            <p className="text-sm text-gray-600">Ask me about your health metrics</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-health-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Online</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div className="flex items-start space-x-2 max-w-[80%]">
              {message.type === 'bot' && (
                <div className="bg-primary-100 p-1.5 rounded-full mt-1">
                  <Bot className="h-4 w-4 text-primary-600" />
                </div>
              )}
              
              <div
                className={`chat-message ${
                  message.type === 'user' ? 'user-message' : 'bot-message'
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(message.message)
                  }}
                />
                <div className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="bg-primary-500 p-1.5 rounded-full mt-1">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-100 p-1.5 rounded-full">
                <Bot className="h-4 w-4 text-primary-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about your health metrics..."
            className="flex-1 metric-input"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-12 h-10"
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBot;