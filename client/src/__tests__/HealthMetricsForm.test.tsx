import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HealthMetricsForm from '../components/HealthMetricsForm';
import { healthAPI } from '../services/api';

// Mock the API service
jest.mock('../services/api', () => ({
  healthAPI: {
    addHealthMetric: jest.fn(),
  },
}));

const mockHealthAPI = healthAPI as jest.Mocked<typeof healthAPI>;

describe('HealthMetricsForm Component', () => {
  const mockOnMetricAdded = jest.fn();
  const defaultProps = {
    userId: 'test-user',
    onMetricAdded: mockOnMetricAdded,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the add metric button when closed', () => {
      render(<HealthMetricsForm {...defaultProps} />);
      
      expect(screen.getByText('Add Health Metric')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add health metric/i })).toBeInTheDocument();
    });

    it('should open the form when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<HealthMetricsForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add health metric/i });
      await user.click(addButton);
      
      expect(screen.getByText('Add Health Metric')).toBeInTheDocument();
      expect(screen.getByLabelText(/metric type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/value/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/unit/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should display all metric types as options', async () => {
      const user = userEvent.setup();
      render(<HealthMetricsForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add health metric/i });
      await user.click(addButton);
      
      // Check for metric type options
      expect(screen.getByText('Weight')).toBeInTheDocument();
      expect(screen.getByText('Height')).toBeInTheDocument();
      expect(screen.getByText('Blood Pressure')).toBeInTheDocument();
      expect(screen.getByText('Heart Rate')).toBeInTheDocument();
      expect(screen.getByText('Blood Sugar')).toBeInTheDocument();
      expect(screen.getByText('Temperature')).toBeInTheDocument();
      expect(screen.getByText('Sleep Hours')).toBeInTheDocument();
      expect(screen.getByText('Steps')).toBeInTheDocument();
      expect(screen.getByText('Water Intake')).toBeInTheDocument();
      expect(screen.getByText('Exercise Minutes')).toBeInTheDocument();
    });

    it('should auto-fill unit when metric type is selected', async () => {
      const user = userEvent.setup();
      render(<HealthMetricsForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add health metric/i });
      await user.click(addButton);
      
      // Click on Weight metric type
      const weightButton = screen.getByText('Weight');
      await user.click(weightButton);
      
      // Check if unit is auto-filled
      const unitInput = screen.getByDisplayValue('kg');
      expect(unitInput).toBeInTheDocument();
    });

    it('should handle blood pressure as text input', async () => {
      const user = userEvent.setup();
      render(<HealthMetricsForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add health metric/i });
      await user.click(addButton);
      
      // Click on Blood Pressure metric type
      const bpButton = screen.getByText('Blood Pressure');
      await user.click(bpButton);
      
      // Check if unit is auto-filled for blood pressure
      const unitInput = screen.getByDisplayValue('mmHg');
      expect(unitInput).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with correct data', async () => {
      const user = userEvent.setup();
      mockHealthAPI.addHealthMetric.mockResolvedValue({
        message: 'Health metric recorded successfully',
        data: {
          id: 'test-id',
          type: 'weight',
          value: 70,
          unit: 'kg',
          timestamp: new Date(),
        }
      });

      render(<HealthMetricsForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add health metric/i });
      await user.click(addButton);
      
      // Select weight metric
      const weightButton = screen.getByText('Weight');
      await user.click(weightButton);
      
      // Fill in value
      const valueInput = screen.getByLabelText(/value/i);
      await user.type(valueInput, '70');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /save metric/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockHealthAPI.addHealthMetric).toHaveBeenCalledWith(
          {
            type: 'weight',
            value: 70,
            unit: 'kg',
            notes: undefined,
          },
          'test-user'
        );
      });
    });

    it('should call onMetricAdded callback after successful submission', async () => {
      const user = userEvent.setup();
      mockHealthAPI.addHealthMetric.mockResolvedValue({
        message: 'Health metric recorded successfully',
        data: {
          id: 'test-id',
          type: 'weight',
          value: 70,
          unit: 'kg',
          timestamp: new Date(),
        }
      });

      render(<HealthMetricsForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add health metric/i });
      await user.click(addButton);
      
      // Select weight metric
      const weightButton = screen.getByText('Weight');
      await user.click(weightButton);
      
      // Fill in value
      const valueInput = screen.getByLabelText(/value/i);
      await user.type(valueInput, '70');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /save metric/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnMetricAdded).toHaveBeenCalled();
      });
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      mockHealthAPI.addHealthMetric.mockResolvedValue({
        message: 'Health metric recorded successfully',
        data: {
          id: 'test-id',
          type: 'weight',
          value: 70,
          unit: 'kg',
          timestamp: new Date(),
        }
      });

      render(<HealthMetricsForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add health metric/i });
      await user.click(addButton);
      
      // Select weight metric
      const weightButton = screen.getByText('Weight');
      await user.click(weightButton);
      
      // Fill in value
      const valueInput = screen.getByLabelText(/value/i);
      await user.type(valueInput, '70');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /save metric/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        // Form should be closed after successful submission
        expect(screen.queryByLabelText(/value/i)).not.toBeInTheDocument();
      });
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      mockHealthAPI.addHealthMetric.mockRejectedValue(new Error('API Error'));

      render(<HealthMetricsForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add health metric/i });
      await user.click(addButton);
      
      // Select weight metric
      const weightButton = screen.getByText('Weight');
      await user.click(weightButton);
      
      // Fill in value
      const valueInput = screen.getByLabelText(/value/i);
      await user.type(valueInput, '70');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /save metric/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to add health metric/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should not submit form without required fields', async () => {
      const user = userEvent.setup();
      render(<HealthMetricsForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add health metric/i });
      await user.click(addButton);
      
      // Try to submit without selecting metric type
      const submitButton = screen.getByRole('button', { name: /save metric/i });
      await user.click(submitButton);
      
      expect(mockHealthAPI.addHealthMetric).not.toHaveBeenCalled();
    });

    it('should not submit form without value', async () => {
      const user = userEvent.setup();
      render(<HealthMetricsForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add health metric/i });
      await user.click(addButton);
      
      // Select weight metric but don't fill value
      const weightButton = screen.getByText('Weight');
      await user.click(weightButton);
      
      // Try to submit
      const submitButton = screen.getByRole('button', { name: /save metric/i });
      await user.click(submitButton);
      
      expect(mockHealthAPI.addHealthMetric).not.toHaveBeenCalled();
    });
  });

  describe('Form Close', () => {
    it('should close form when X button is clicked', async () => {
      const user = userEvent.setup();
      render(<HealthMetricsForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add health metric/i });
      await user.click(addButton);
      
      // Form should be open
      expect(screen.getByLabelText(/metric type/i)).toBeInTheDocument();
      
      // Click close button
      const closeButton = screen.getByRole('button', { name: /×/i });
      await user.click(closeButton);
      
      // Form should be closed
      expect(screen.queryByLabelText(/metric type/i)).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      mockHealthAPI.addHealthMetric.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<HealthMetricsForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add health metric/i });
      await user.click(addButton);
      
      // Select weight metric
      const weightButton = screen.getByText('Weight');
      await user.click(weightButton);
      
      // Fill in value
      const valueInput = screen.getByLabelText(/value/i);
      await user.type(valueInput, '70');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /save metric/i });
      await user.click(submitButton);
      
      // Should show loading state
      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });
  });
}); 