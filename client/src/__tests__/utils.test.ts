import { formatMetricValue, getMetricColor, getMetricIcon, validateHealthData } from '../utils/helpers';

describe('Utility Functions', () => {
  describe('formatMetricValue', () => {
    it('should format numeric values correctly', () => {
      expect(formatMetricValue(70, 'kg')).toBe('70 kg');
      expect(formatMetricValue(120.5, 'lbs')).toBe('120.5 lbs');
      expect(formatMetricValue(75, 'bpm')).toBe('75 bpm');
    });

    it('should handle string values', () => {
      expect(formatMetricValue('120/80', 'mmHg')).toBe('120/80 mmHg');
      expect(formatMetricValue('Normal', 'status')).toBe('Normal status');
    });

    it('should handle object values', () => {
      const bloodPressure = { systolic: 120, diastolic: 80 };
      expect(formatMetricValue(bloodPressure, 'mmHg')).toBe('[object Object] mmHg');
    });

    it('should handle undefined and null values', () => {
      expect(formatMetricValue(undefined, 'kg')).toBe('undefined kg');
      expect(formatMetricValue(null, 'kg')).toBe('null kg');
    });
  });

  describe('getMetricColor', () => {
    it('should return correct colors for different metric types', () => {
      expect(getMetricColor('weight')).toBe('text-blue-600');
      expect(getMetricColor('heart_rate')).toBe('text-red-600');
      expect(getMetricColor('blood_pressure')).toBe('text-purple-600');
      expect(getMetricColor('blood_sugar')).toBe('text-green-600');
      expect(getMetricColor('temperature')).toBe('text-orange-600');
      expect(getMetricColor('sleep_hours')).toBe('text-indigo-600');
      expect(getMetricColor('steps')).toBe('text-teal-600');
      expect(getMetricColor('water_intake')).toBe('text-cyan-600');
      expect(getMetricColor('exercise_minutes')).toBe('text-emerald-600');
    });

    it('should return default color for unknown metric types', () => {
      expect(getMetricColor('unknown_metric')).toBe('text-gray-600');
    });
  });

  describe('getMetricIcon', () => {
    it('should return correct icon names for different metric types', () => {
      expect(getMetricIcon('weight')).toBe('Scale');
      expect(getMetricIcon('heart_rate')).toBe('Heart');
      expect(getMetricIcon('blood_pressure')).toBe('Activity');
      expect(getMetricIcon('blood_sugar')).toBe('Droplets');
      expect(getMetricIcon('temperature')).toBe('Thermometer');
      expect(getMetricIcon('sleep_hours')).toBe('Moon');
      expect(getMetricIcon('steps')).toBe('Footprints');
      expect(getMetricIcon('water_intake')).toBe('Droplets');
      expect(getMetricIcon('exercise_minutes')).toBe('Dumbbell');
    });

    it('should return default icon for unknown metric types', () => {
      expect(getMetricIcon('unknown_metric')).toBe('Activity');
    });
  });

  describe('validateHealthData', () => {
    it('should validate correct health data', () => {
      const validData = {
        type: 'weight',
        value: 70,
        unit: 'kg',
        notes: 'Morning weight'
      };

      const result = validateHealthData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate required fields', () => {
      const invalidData = {
        value: 70,
        unit: 'kg'
        // Missing type
      };

      const result = validateHealthData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Type is required');
    });

    it('should validate metric type values', () => {
      const invalidData = {
        type: 'invalid_type',
        value: 70,
        unit: 'kg'
      };

      const result = validateHealthData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid metric type');
    });

    it('should validate value field', () => {
      const invalidData = {
        type: 'weight',
        unit: 'kg'
        // Missing value
      };

      const result = validateHealthData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value is required');
    });

    it('should validate unit field', () => {
      const invalidData = {
        type: 'weight',
        value: 70
        // Missing unit
      };

      const result = validateHealthData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unit is required');
    });

    it('should handle multiple validation errors', () => {
      const invalidData = {
        type: 'invalid_type',
        value: 'not_a_number'
        // Missing unit
      };

      const result = validateHealthData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid metric type');
      expect(result.errors).toContain('Unit is required');
    });

    it('should validate numeric values for numeric metrics', () => {
      const invalidData = {
        type: 'weight',
        value: 'not_a_number',
        unit: 'kg'
      };

      const result = validateHealthData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value must be a number for this metric type');
    });

    it('should allow string values for blood pressure', () => {
      const validData = {
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg'
      };

      const result = validateHealthData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate blood pressure format', () => {
      const invalidData = {
        type: 'blood_pressure',
        value: 'invalid_format',
        unit: 'mmHg'
      };

      const result = validateHealthData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Blood pressure must be in format "systolic/diastolic"');
    });
  });
}); 