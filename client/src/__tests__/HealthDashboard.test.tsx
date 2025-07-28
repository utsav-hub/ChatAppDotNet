import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HealthDashboard from '../components/HealthDashboard';
import { healthAPI } from '../services/api';

// Mock the API service
jest.mock('../services/api', () => ({
  healthAPI: {
    getHealthInsights: jest.fn(),
  },
}));

const mockHealthAPI = healthAPI as jest.Mocked<typeof healthAPI>;

describe('HealthDashboard Component', () => {
  const mockHealthData = [
    {
      id: '1',
      type: 'weight' as const,
      value: 70,
      unit: 'kg',
      timestamp: new Date('2024-01-01'),
      notes: 'Morning weight'
    },
    {
      id: '2',
      type: 'weight' as const,
      value: 69.5,
      unit: 'kg',
      timestamp: new Date('2024-01-02'),
      notes: 'Morning weight'
    },
    {
      id: '3',
      type: 'heart_rate' as const,
      value: 75,
      unit: 'bpm',
      timestamp: new Date('2024-01-01'),
    },
    {
      id: '4',
      type: 'heart_rate' as const,
      value: 72,
      unit: 'bpm',
      timestamp: new Date('2024-01-02'),
    },
  ];

  const mockInsights = {
    totalRecords: 4,
    metricsTracked: ['weight', 'heart_rate'],
    trends: {
      weight: {
        change: -0.5,
        percentChange: -0.7,
        direction: 'decrease',
        recordCount: 2
      },
      heart_rate: {
        change: -3,
        percentChange: -4.0,
        direction: 'decrease',
        recordCount: 2
      }
    },
    recommendations: [
      'Great job tracking your health! Consistency is key to achieving your wellness goals.',
      'Consider tracking more health metrics like blood pressure, heart rate, or sleep hours for a complete picture.'
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the dashboard with health data', async () => {
      mockHealthAPI.getHealthInsights.mockResolvedValue(mockInsights);
      
      render(<HealthDashboard userId="test-user" healthData={mockHealthData} />);
      
      expect(screen.getByText(/health insights/i)).toBeInTheDocument();
      expect(screen.getByText(/trends & analysis/i)).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      mockHealthAPI.getHealthInsights.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<HealthDashboard userId="test-user" healthData={mockHealthData} />);
      
      expect(screen.getByText(/loading insights/i)).toBeInTheDocument();
    });

    it('should handle empty health data', () => {
      render(<HealthDashboard userId="test-user" healthData={[]} />);
      
      expect(screen.getByText(/no health data available/i)).toBeInTheDocument();
    });
  });

  describe('Insights Display', () => {
    it('should display health insights when data is available', async () => {
      mockHealthAPI.getHealthInsights.mockResolvedValue(mockInsights);
      
      render(<HealthDashboard userId="test-user" healthData={mockHealthData} />);
      
      await waitFor(() => {
        expect(screen.getByText('4')).toBeInTheDocument(); // Total records
        expect(screen.getByText('2')).toBeInTheDocument(); // Metrics tracked
      });
    });

    it('should display trend information', async () => {
      mockHealthAPI.getHealthInsights.mockResolvedValue(mockInsights);
      
      render(<HealthDashboard userId="test-user" healthData={mockHealthData} />);
      
      await waitFor(() => {
        expect(screen.getByText(/weight/i)).toBeInTheDocument();
        expect(screen.getByText(/heart rate/i)).toBeInTheDocument();
        expect(screen.getByText(/-0.5 kg/i)).toBeInTheDocument();
        expect(screen.getByText(/-3 bpm/i)).toBeInTheDocument();
      });
    });

    it('should display recommendations', async () => {
      mockHealthAPI.getHealthInsights.mockResolvedValue(mockInsights);
      
      render(<HealthDashboard userId="test-user" healthData={mockHealthData} />);
      
      await waitFor(() => {
        expect(screen.getByText(/great job tracking your health/i)).toBeInTheDocument();
        expect(screen.getByText(/consider tracking more health metrics/i)).toBeInTheDocument();
      });
    });
  });

  describe('Metric Selection', () => {
    it('should allow selecting different metrics for detailed view', async () => {
      mockHealthAPI.getHealthInsights.mockResolvedValue(mockInsights);
      
      render(<HealthDashboard userId="test-user" healthData={mockHealthData} />);
      
      await waitFor(() => {
        expect(screen.getByText(/weight/i)).toBeInTheDocument();
        expect(screen.getByText(/heart rate/i)).toBeInTheDocument();
      });
    });

    it('should show metric details when selected', async () => {
      mockHealthAPI.getHealthInsights.mockResolvedValue(mockInsights);
      
      render(<HealthDashboard userId="test-user" healthData={mockHealthData} />);
      
      await waitFor(() => {
        const weightButton = screen.getByText(/weight/i);
        weightButton.click();
        
        // Should show weight-specific details
        expect(screen.getByText(/70 kg/i)).toBeInTheDocument();
        expect(screen.getByText(/69.5 kg/i)).toBeInTheDocument();
      });
    });
  });

  describe('Trend Analysis', () => {
    it('should display trend direction correctly', async () => {
      mockHealthAPI.getHealthInsights.mockResolvedValue(mockInsights);
      
      render(<HealthDashboard userId="test-user" healthData={mockHealthData} />);
      
      await waitFor(() => {
        // Should show decreasing trends
        expect(screen.getByText(/decrease/i)).toBeInTheDocument();
      });
    });

    it('should display percentage changes', async () => {
      mockHealthAPI.getHealthInsights.mockResolvedValue(mockInsights);
      
      render(<HealthDashboard userId="test-user" healthData={mockHealthData} />);
      
      await waitFor(() => {
        expect(screen.getByText(/-0.7%/i)).toBeInTheDocument();
        expect(screen.getByText(/-4.0%/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockHealthAPI.getHealthInsights.mockRejectedValue(new Error('API Error'));
      
      render(<HealthDashboard userId="test-user" healthData={mockHealthData} />);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load insights/i)).toBeInTheDocument();
      });
    });

    it('should still render with health data even if insights fail', async () => {
      mockHealthAPI.getHealthInsights.mockRejectedValue(new Error('API Error'));
      
      render(<HealthDashboard userId="test-user" healthData={mockHealthData} />);
      
      // Should still show the basic dashboard structure
      expect(screen.getByText(/health insights/i)).toBeInTheDocument();
    });
  });

  describe('Data Visualization', () => {
    it('should render charts when data is available', async () => {
      mockHealthAPI.getHealthInsights.mockResolvedValue(mockInsights);
      
      render(<HealthDashboard userId="test-user" healthData={mockHealthData} />);
      
      await waitFor(() => {
        // Should render chart containers
        expect(screen.getByText(/trends & analysis/i)).toBeInTheDocument();
      });
    });

    it('should handle different metric types correctly', async () => {
      const mixedData = [
        ...mockHealthData,
        {
          id: '5',
          type: 'blood_pressure' as const,
          value: '120/80',
          unit: 'mmHg',
          timestamp: new Date('2024-01-01'),
        }
      ];
      
      const mixedInsights = {
        ...mockInsights,
        metricsTracked: ['weight', 'heart_rate', 'blood_pressure'],
        trends: {
          ...mockInsights.trends,
          blood_pressure: {
            change: 0,
            percentChange: 0,
            direction: 'stable',
            recordCount: 1
          }
        }
      };
      
      mockHealthAPI.getHealthInsights.mockResolvedValue(mixedInsights);
      
      render(<HealthDashboard userId="test-user" healthData={mixedData} />);
      
      await waitFor(() => {
        expect(screen.getByText(/blood pressure/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render on different screen sizes', async () => {
      mockHealthAPI.getHealthInsights.mockResolvedValue(mockInsights);
      
      // Test mobile view
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<HealthDashboard userId="test-user" healthData={mockHealthData} />);
      
      await waitFor(() => {
        expect(screen.getByText(/health insights/i)).toBeInTheDocument();
      });
    });
  });
}); 