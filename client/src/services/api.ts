import axios from 'axios';
import { HealthMetric, ChatResponse, HealthInsights } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health data API
export const healthAPI = {
  // Get all health data for a user
  getHealthData: async (userId: string = 'default'): Promise<HealthMetric[]> => {
    const response = await api.get(`/health/data/${userId}`);
    return response.data;
  },

  // Add a new health metric
  addHealthMetric: async (metric: Omit<HealthMetric, 'id' | 'timestamp'>, userId: string = 'default') => {
    const response = await api.post('/health/data', {
      ...metric,
      userId,
    });
    return response.data;
  },

  // Get health insights
  getHealthInsights: async (userId: string = 'default'): Promise<HealthInsights> => {
    const response = await api.get(`/health/insights/${userId}`);
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  // Send a message to the chatbot
  sendMessage: async (
    message: string, 
    sessionId: string = 'default', 
    userId: string = 'default'
  ): Promise<ChatResponse> => {
    const response = await api.post('/chat', {
      message,
      sessionId,
      userId,
    });
    return response.data;
  },

  // Get conversation history
  getConversationHistory: async (sessionId: string = 'default') => {
    const response = await api.get(`/chat/history/${sessionId}`);
    return response.data;
  },
};

// Health check
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Server is not responding');
  }
};