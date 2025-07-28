import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatBot from '../components/ChatBot';
import { chatAPI } from '../services/api';

// Mock the API service
jest.mock('../services/api', () => ({
  chatAPI: {
    sendMessage: jest.fn(),
    getConversationHistory: jest.fn(),
  },
}));

const mockChatAPI = chatAPI as jest.Mocked<typeof chatAPI>;

describe('ChatBot Component', () => {
  const defaultProps = {
    userId: 'test-user',
    sessionId: 'test-session',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the chat interface', () => {
      render(<ChatBot {...defaultProps} />);
      
      expect(screen.getByText(/chat with your health assistant/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('should load conversation history on mount', async () => {
      const mockHistory = [
        { type: 'user', message: 'Hello', timestamp: new Date() },
        { type: 'bot', message: 'Hi there! How can I help you?', timestamp: new Date() },
      ];
      
      mockChatAPI.getConversationHistory.mockResolvedValue(mockHistory);
      
      render(<ChatBot {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockChatAPI.getConversationHistory).toHaveBeenCalledWith('test-session');
      });
    });
  });

  describe('Message Sending', () => {
    it('should send message when form is submitted', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        response: 'Hello! How can I help you today?',
        sessionId: 'test-session',
        conversation: [
          { type: 'user', message: 'Hello', timestamp: new Date() },
          { type: 'bot', message: 'Hello! How can I help you today?', timestamp: new Date() },
        ],
      };
      
      mockChatAPI.sendMessage.mockResolvedValue(mockResponse);
      
      render(<ChatBot {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(input, 'Hello');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(mockChatAPI.sendMessage).toHaveBeenCalledWith(
          'Hello',
          'test-session',
          'test-user'
        );
      });
    });

    it('should send message when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        response: 'Hello! How can I help you today?',
        sessionId: 'test-session',
        conversation: [
          { type: 'user', message: 'Hello', timestamp: new Date() },
          { type: 'bot', message: 'Hello! How can I help you today?', timestamp: new Date() },
        ],
      };
      
      mockChatAPI.sendMessage.mockResolvedValue(mockResponse);
      
      render(<ChatBot {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      
      await user.type(input, 'Hello{enter}');
      
      await waitFor(() => {
        expect(mockChatAPI.sendMessage).toHaveBeenCalledWith(
          'Hello',
          'test-session',
          'test-user'
        );
      });
    });

    it('should not send empty messages', async () => {
      const user = userEvent.setup();
      
      render(<ChatBot {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.click(sendButton);
      
      expect(mockChatAPI.sendMessage).not.toHaveBeenCalled();
    });

    it('should clear input after sending message', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        response: 'Hello! How can I help you today?',
        sessionId: 'test-session',
        conversation: [],
      };
      
      mockChatAPI.sendMessage.mockResolvedValue(mockResponse);
      
      render(<ChatBot {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(input, 'Hello');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });
  });

  describe('Message Display', () => {
    it('should display user and bot messages', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        response: 'Hello! How can I help you today?',
        sessionId: 'test-session',
        conversation: [
          { type: 'user', message: 'Hello', timestamp: new Date() },
          { type: 'bot', message: 'Hello! How can I help you today?', timestamp: new Date() },
        ],
      };
      
      mockChatAPI.sendMessage.mockResolvedValue(mockResponse);
      
      render(<ChatBot {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(input, 'Hello');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
      });
    });

    it('should display conversation history', async () => {
      const mockHistory = [
        { type: 'user', message: 'Previous message', timestamp: new Date() },
        { type: 'bot', message: 'Previous response', timestamp: new Date() },
      ];
      
      mockChatAPI.getConversationHistory.mockResolvedValue(mockHistory);
      
      render(<ChatBot {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Previous message')).toBeInTheDocument();
        expect(screen.getByText('Previous response')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state while sending message', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      mockChatAPI.sendMessage.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<ChatBot {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(input, 'Hello');
      await user.click(sendButton);
      
      // Should show loading state
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
    });

    it('should disable send button while loading', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      mockChatAPI.sendMessage.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<ChatBot {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(input, 'Hello');
      await user.click(sendButton);
      
      // Button should be disabled
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();
      mockChatAPI.sendMessage.mockRejectedValue(new Error('API Error'));
      
      render(<ChatBot {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(input, 'Hello');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
      });
    });

    it('should handle conversation history loading errors', async () => {
      mockChatAPI.getConversationHistory.mockRejectedValue(new Error('History Error'));
      
      render(<ChatBot {...defaultProps} />);
      
      // Component should still render even if history fails to load
      expect(screen.getByText(/chat with your health assistant/i)).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    it('should not send messages with only whitespace', async () => {
      const user = userEvent.setup();
      
      render(<ChatBot {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(input, '   ');
      await user.click(sendButton);
      
      expect(mockChatAPI.sendMessage).not.toHaveBeenCalled();
    });

    it('should trim whitespace from messages', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        response: 'Hello! How can I help you today?',
        sessionId: 'test-session',
        conversation: [],
      };
      
      mockChatAPI.sendMessage.mockResolvedValue(mockResponse);
      
      render(<ChatBot {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(input, '  Hello  ');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(mockChatAPI.sendMessage).toHaveBeenCalledWith(
          'Hello',
          'test-session',
          'test-user'
        );
      });
    });
  });
}); 