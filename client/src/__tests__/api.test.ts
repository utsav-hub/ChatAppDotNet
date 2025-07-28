import axios from 'axios';
import { healthAPI, chatAPI, checkServerHealth } from '../services/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('healthAPI', () => {
    describe('getHealthData', () => {
      it('should fetch health data successfully', async () => {
        const mockData = [
          {
            id: '1',
            type: 'weight',
            value: 70,
            unit: 'kg',
            timestamp: new Date(),
            notes: 'Morning weight'
          }
        ];

        mockedAxios.get.mockResolvedValue({ data: mockData });

        const result = await healthAPI.getHealthData('test-user');

        expect(mockedAxios.get).toHaveBeenCalledWith('/health/data/test-user');
        expect(result).toEqual(mockData);
      });

      it('should use default userId when not provided', async () => {
        const mockData = [];
        mockedAxios.get.mockResolvedValue({ data: mockData });

        await healthAPI.getHealthData();

        expect(mockedAxios.get).toHaveBeenCalledWith('/health/data/default');
      });

      it('should handle API errors', async () => {
        const error = new Error('Network error');
        mockedAxios.get.mockRejectedValue(error);

        await expect(healthAPI.getHealthData('test-user')).rejects.toThrow('Network error');
      });
    });

    describe('addHealthMetric', () => {
      it('should add health metric successfully', async () => {
        const metric = {
          type: 'weight' as const,
          value: 70,
          unit: 'kg',
          notes: 'Morning weight'
        };

        const mockResponse = {
          message: 'Health metric recorded successfully',
          data: {
            id: '1',
            ...metric,
            timestamp: new Date()
          }
        };

        mockedAxios.post.mockResolvedValue({ data: mockResponse });

        const result = await healthAPI.addHealthMetric(metric, 'test-user');

        expect(mockedAxios.post).toHaveBeenCalledWith('/health/data', {
          ...metric,
          userId: 'test-user'
        });
        expect(result).toEqual(mockResponse);
      });

      it('should use default userId when not provided', async () => {
        const metric = {
          type: 'weight' as const,
          value: 70,
          unit: 'kg'
        };

        mockedAxios.post.mockResolvedValue({ data: { message: 'Success' } });

        await healthAPI.addHealthMetric(metric);

        expect(mockedAxios.post).toHaveBeenCalledWith('/health/data', {
          ...metric,
          userId: 'default'
        });
      });

      it('should handle API errors', async () => {
        const metric = {
          type: 'weight' as const,
          value: 70,
          unit: 'kg'
        };

        const error = new Error('Validation error');
        mockedAxios.post.mockRejectedValue(error);

        await expect(healthAPI.addHealthMetric(metric, 'test-user')).rejects.toThrow('Validation error');
      });
    });

    describe('getHealthInsights', () => {
      it('should fetch health insights successfully', async () => {
        const mockInsights = {
          totalRecords: 5,
          metricsTracked: ['weight', 'heart_rate'],
          trends: {
            weight: {
              change: -1.5,
              percentChange: -2.1,
              direction: 'decrease',
              recordCount: 3
            }
          },
          recommendations: ['Great job tracking your health!']
        };

        mockedAxios.get.mockResolvedValue({ data: mockInsights });

        const result = await healthAPI.getHealthInsights('test-user');

        expect(mockedAxios.get).toHaveBeenCalledWith('/health/insights/test-user');
        expect(result).toEqual(mockInsights);
      });

      it('should use default userId when not provided', async () => {
        mockedAxios.get.mockResolvedValue({ data: {} });

        await healthAPI.getHealthInsights();

        expect(mockedAxios.get).toHaveBeenCalledWith('/health/insights/default');
      });

      it('should handle API errors', async () => {
        const error = new Error('Server error');
        mockedAxios.get.mockRejectedValue(error);

        await expect(healthAPI.getHealthInsights('test-user')).rejects.toThrow('Server error');
      });
    });
  });

  describe('chatAPI', () => {
    describe('sendMessage', () => {
      it('should send message successfully', async () => {
        const mockResponse = {
          response: 'Hello! How can I help you today?',
          sessionId: 'test-session',
          conversation: [
            { type: 'user', message: 'Hello', timestamp: new Date() },
            { type: 'bot', message: 'Hello! How can I help you today?', timestamp: new Date() }
          ]
        };

        mockedAxios.post.mockResolvedValue({ data: mockResponse });

        const result = await chatAPI.sendMessage('Hello', 'test-session', 'test-user');

        expect(mockedAxios.post).toHaveBeenCalledWith('/chat', {
          message: 'Hello',
          sessionId: 'test-session',
          userId: 'test-user'
        });
        expect(result).toEqual(mockResponse);
      });

      it('should use default parameters when not provided', async () => {
        const mockResponse = {
          response: 'Hello!',
          sessionId: 'default',
          conversation: []
        };

        mockedAxios.post.mockResolvedValue({ data: mockResponse });

        await chatAPI.sendMessage('Hello');

        expect(mockedAxios.post).toHaveBeenCalledWith('/chat', {
          message: 'Hello',
          sessionId: 'default',
          userId: 'default'
        });
      });

      it('should handle API errors', async () => {
        const error = new Error('Chat service error');
        mockedAxios.post.mockRejectedValue(error);

        await expect(chatAPI.sendMessage('Hello')).rejects.toThrow('Chat service error');
      });
    });

    describe('getConversationHistory', () => {
      it('should fetch conversation history successfully', async () => {
        const mockHistory = [
          { type: 'user', message: 'Hello', timestamp: new Date() },
          { type: 'bot', message: 'Hi there!', timestamp: new Date() }
        ];

        mockedAxios.get.mockResolvedValue({ data: mockHistory });

        const result = await chatAPI.getConversationHistory('test-session');

        expect(mockedAxios.get).toHaveBeenCalledWith('/chat/history/test-session');
        expect(result).toEqual(mockHistory);
      });

      it('should use default sessionId when not provided', async () => {
        mockedAxios.get.mockResolvedValue({ data: [] });

        await chatAPI.getConversationHistory();

        expect(mockedAxios.get).toHaveBeenCalledWith('/chat/history/default');
      });

      it('should handle API errors', async () => {
        const error = new Error('History error');
        mockedAxios.get.mockRejectedValue(error);

        await expect(chatAPI.getConversationHistory('test-session')).rejects.toThrow('History error');
      });
    });
  });

  describe('checkServerHealth', () => {
    it('should check server health successfully', async () => {
      const mockResponse = { message: 'Health Measures Chatbot API is running!' };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await checkServerHealth();

      expect(mockedAxios.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when server is not responding', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(checkServerHealth()).rejects.toThrow('Server is not responding');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(networkError);

      await expect(healthAPI.getHealthData('test-user')).rejects.toThrow('Network Error');
    });

    it('should handle HTTP error responses', async () => {
      const httpError = {
        response: {
          status: 400,
          data: { error: 'Bad Request' }
        }
      };
      mockedAxios.post.mockRejectedValue(httpError);

      await expect(healthAPI.addHealthMetric({
        type: 'weight',
        value: 70,
        unit: 'kg'
      })).rejects.toEqual(httpError);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 5000ms exceeded');
      mockedAxios.get.mockRejectedValue(timeoutError);

      await expect(healthAPI.getHealthData('test-user')).rejects.toThrow('timeout of 5000ms exceeded');
    });
  });

  describe('Request Configuration', () => {
    it('should use correct base URL', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:5000/api',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should send requests with correct headers', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      await healthAPI.getHealthData('test-user');

      expect(mockedAxios.get).toHaveBeenCalledWith('/health/data/test-user');
    });
  });
}); 