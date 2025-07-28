import { HealthMetric } from '../types';

export const formatMetricValue = (value: any, unit: string): string => {
  if (value === undefined || value === null) {
    return `${value} ${unit}`;
  }
  return `${value} ${unit}`;
};

export const getMetricColor = (metricType: string): string => {
  const colorMap: { [key: string]: string } = {
    weight: 'text-blue-600',
    height: 'text-green-600',
    blood_pressure: 'text-purple-600',
    heart_rate: 'text-red-600',
    blood_sugar: 'text-green-600',
    temperature: 'text-orange-600',
    sleep_hours: 'text-indigo-600',
    steps: 'text-teal-600',
    water_intake: 'text-cyan-600',
    exercise_minutes: 'text-emerald-600',
  };
  
  return colorMap[metricType] || 'text-gray-600';
};

export const getMetricIcon = (metricType: string): string => {
  const iconMap: { [key: string]: string } = {
    weight: 'Scale',
    height: 'Ruler',
    blood_pressure: 'Activity',
    heart_rate: 'Heart',
    blood_sugar: 'Droplets',
    temperature: 'Thermometer',
    sleep_hours: 'Moon',
    steps: 'Footprints',
    water_intake: 'Droplets',
    exercise_minutes: 'Dumbbell',
  };
  
  return iconMap[metricType] || 'Activity';
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateHealthData = (data: Partial<HealthMetric>): ValidationResult => {
  const errors: string[] = [];

  // Check required fields
  if (!data.type) {
    errors.push('Type is required');
  }

  if (data.value === undefined || data.value === null || data.value === '') {
    errors.push('Value is required');
  }

  if (!data.unit) {
    errors.push('Unit is required');
  }

  // Validate metric type
  const validTypes = [
    'weight', 'height', 'blood_pressure', 'heart_rate', 'blood_sugar',
    'temperature', 'sleep_hours', 'steps', 'water_intake', 'exercise_minutes'
  ];

  if (data.type && !validTypes.includes(data.type)) {
    errors.push('Invalid metric type');
  }

  // Validate numeric values for numeric metrics
  const numericMetrics = ['weight', 'height', 'heart_rate', 'blood_sugar', 'temperature', 'sleep_hours', 'steps', 'water_intake', 'exercise_minutes'];
  
  if (data.type && numericMetrics.includes(data.type) && data.value !== undefined) {
    if (typeof data.value === 'string' && isNaN(Number(data.value))) {
      errors.push('Value must be a number for this metric type');
    }
  }

  // Validate blood pressure format
  if (data.type === 'blood_pressure' && typeof data.value === 'string') {
    const bpRegex = /^\d+\/\d+$/;
    if (!bpRegex.test(data.value)) {
      errors.push('Blood pressure must be in format "systolic/diastolic"');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const getMetricDisplayName = (metricType: string): string => {
  const displayNames: { [key: string]: string } = {
    weight: 'Weight',
    height: 'Height',
    blood_pressure: 'Blood Pressure',
    heart_rate: 'Heart Rate',
    blood_sugar: 'Blood Sugar',
    temperature: 'Temperature',
    sleep_hours: 'Sleep Hours',
    steps: 'Steps',
    water_intake: 'Water Intake',
    exercise_minutes: 'Exercise Minutes',
  };
  
  return displayNames[metricType] || metricType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const calculateTrend = (values: number[]): { direction: 'increase' | 'decrease' | 'stable'; change: number; percentChange: number } => {
  if (values.length < 2) {
    return { direction: 'stable', change: 0, percentChange: 0 };
  }

  const first = values[0];
  const last = values[values.length - 1];
  const change = last - first;
  const percentChange = first !== 0 ? (change / first) * 100 : 0;

  let direction: 'increase' | 'decrease' | 'stable' = 'stable';
  if (change > 0) direction = 'increase';
  else if (change < 0) direction = 'decrease';

  return {
    direction,
    change: Math.round(change * 100) / 100,
    percentChange: Math.round(percentChange * 100) / 100
  };
}; 