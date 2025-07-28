import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { healthAPI } from '../services/api';

// Mock the API services
jest.mock('../services/api', () => ({
  healthAPI: {
    getHealthData: jest.fn(),
    addHealthMetric: jest.fn(),
    getHealthInsights: jest.fn(),
  },
  chatAPI: {
    sendMessage: jest.fn(),
    getConversationHistory: jest.fn(),
  },
  checkServerHealth: jest.fn(),
}));

// Mock the components to isolate App testing
jest.mock('../components/ChatBot', () => {
  return function MockChatBot() {
    return <div data-testid="chatbot">ChatBot Component</div>;
  };
});

jest.mock('../components/HealthMetricsForm', () => {
  return function MockHealthMetricsForm({ onMetricAdded }: { onMetricAdded: () => void }) {
    return (
      <div data-testid="health-metrics-form">
        <button onClick={onMetricAdded}>Add Metric</button>
      </div>
    );
  };
});

jest.mock('../components/HealthDashboard', () => {
  return function MockHealthDashboard() {
    return <div data-testid="health-dashboard">HealthDashboard Component</div>;
  };
});

const mockHealthAPI = healthAPI as jest.Mocked<typeof healthAPI>;

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderApp = () => {
    return render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  };

  describe('Initialization', () => {
    it('should render the app with navigation', async () => {
      mockHealthAPI.getHealthData.mockResolvedValue([]);
      
      renderApp();
      
      // Check for main navigation elements
      expect(screen.getByText('HealthBot')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Add Metric')).toBeInTheDocument();
    });

    it('should load health data on initialization', async () => {
      const mockHealthData = [
        {
          id: '1',
          type: 'weight' as const,
          value: 70,
          unit: 'kg',
          timestamp: new Date(),
          notes: 'Morning weight'
        }
      ];
      
      mockHealthAPI.getHealthData.mockResolvedValue(mockHealthData);
      
      renderApp();
      
      await waitFor(() => {
        expect(mockHealthAPI.getHealthData).toHaveBeenCalledWith('default');
      });
    });

    it('should handle server offline status', async () => {
      mockHealthAPI.getHealthData.mockRejectedValue(new Error('Server error'));
      
      renderApp();
      
      await waitFor(() => {
        expect(screen.getByText(/offline/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to different pages', async () => {
      mockHealthAPI.getHealthData.mockResolvedValue([]);
      
      renderApp();
      
      // Click on Chat link
      const chatLink = screen.getByText('Chat');
      chatLink.click();
      
      await waitFor(() => {
        expect(screen.getByTestId('chatbot')).toBeInTheDocument();
      });
      
      // Click on Dashboard link
      const dashboardLink = screen.getByText('Dashboard');
      dashboardLink.click();
      
      await waitFor(() => {
        expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();
      });
      
      // Click on Add Metric link
      const addMetricLink = screen.getByText('Add Metric');
      addMetricLink.click();
      
      await waitFor(() => {
        expect(screen.getByTestId('health-metrics-form')).toBeInTheDocument();
      });
    });
  });

  describe('Health Data Management', () => {
    it('should refresh health data when metric is added', async () => {
      const initialData = [
        {
          id: '1',
          type: 'weight' as const,
          value: 70,
          unit: 'kg',
          timestamp: new Date(),
        }
      ];
      
      const updatedData = [
        ...initialData,
        {
          id: '2',
          type: 'heart_rate' as const,
          value: 75,
          unit: 'bpm',
          timestamp: new Date(),
        }
      ];
      
      mockHealthAPI.getHealthData
        .mockResolvedValueOnce(initialData)
        .mockResolvedValueOnce(updatedData);
      
      renderApp();
      
      await waitFor(() => {
        expect(mockHealthAPI.getHealthData).toHaveBeenCalledWith('default');
      });
      
      // Simulate adding a metric
      const addMetricButton = screen.getByText('Add Metric');
      addMetricButton.click();
      
      await waitFor(() => {
        expect(mockHealthAPI.getHealthData).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockHealthAPI.getHealthData.mockRejectedValue(new Error('Network error'));
      
      renderApp();
      
      await waitFor(() => {
        expect(screen.getByText(/offline/i)).toBeInTheDocument();
      });
    });
  });
}); 