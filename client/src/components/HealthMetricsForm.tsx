import React, { useState } from 'react';
import { Plus, Scale, Heart, Thermometer, Moon, Footprints, Droplets, Dumbbell, Activity } from 'lucide-react';
import { healthAPI } from '../services/api';
import { MetricFormData } from '../types';

interface HealthMetricsFormProps {
  userId: string;
  onMetricAdded: () => void;
}

const METRIC_TYPES = [
  { value: 'weight', label: 'Weight', icon: Scale, unit: 'kg', placeholder: '70' },
  { value: 'height', label: 'Height', icon: Activity, unit: 'cm', placeholder: '175' },
  { value: 'blood_pressure', label: 'Blood Pressure', icon: Heart, unit: 'mmHg', placeholder: '120/80' },
  { value: 'heart_rate', label: 'Heart Rate', icon: Heart, unit: 'bpm', placeholder: '75' },
  { value: 'blood_sugar', label: 'Blood Sugar', icon: Droplets, unit: 'mg/dL', placeholder: '100' },
  { value: 'temperature', label: 'Temperature', icon: Thermometer, unit: '°C', placeholder: '36.5' },
  { value: 'sleep_hours', label: 'Sleep Hours', icon: Moon, unit: 'hours', placeholder: '8' },
  { value: 'steps', label: 'Steps', icon: Footprints, unit: 'steps', placeholder: '10000' },
  { value: 'water_intake', label: 'Water Intake', icon: Droplets, unit: 'L', placeholder: '2.5' },
  { value: 'exercise_minutes', label: 'Exercise', icon: Dumbbell, unit: 'minutes', placeholder: '30' },
];

const HealthMetricsForm: React.FC<HealthMetricsFormProps> = ({ userId, onMetricAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MetricFormData>({
    type: '',
    value: '',
    unit: '',
    notes: ''
  });

  const selectedMetric = METRIC_TYPES.find(m => m.value === formData.type);

  const handleTypeChange = (type: string) => {
    const metric = METRIC_TYPES.find(m => m.value === type);
    setFormData({
      type,
      value: '',
      unit: metric?.unit || '',
      notes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.value) return;

    setIsSubmitting(true);
    try {
      let processedValue: number | string = formData.value;
      
      // Process special cases
      if (formData.type === 'blood_pressure') {
        // Keep as string for blood pressure
        processedValue = formData.value;
      } else if (!isNaN(Number(formData.value))) {
        // Convert to number if possible
        processedValue = Number(formData.value);
      }

      const result = await healthAPI.addHealthMetric({
        type: formData.type as any,
        value: processedValue,
        unit: formData.unit,
        notes: formData.notes || undefined
      }, userId);

      console.log('Health metric added successfully:', result);

      // Reset form
      setFormData({
        type: '',
        value: '',
        unit: '',
        notes: ''
      });
      setIsOpen(false);
      
      console.log('Calling onMetricAdded callback');
      onMetricAdded();
    } catch (error) {
      console.error('Failed to add health metric:', error);
      alert('Failed to add health metric. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputType = (metricType: string) => {
    if (metricType === 'blood_pressure') return 'text';
    return 'number';
  };

  const getInputStep = (metricType: string) => {
    if (['weight', 'temperature', 'water_intake'].includes(metricType)) return '0.1';
    if (['sleep_hours'].includes(metricType)) return '0.5';
    return '1';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center space-x-2 w-full"
      >
        <Plus className="h-4 w-4" />
        <span>Add Health Metric</span>
      </button>
    );
  }

  return (
    <div className="health-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Add Health Metric</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Metric Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metric Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {METRIC_TYPES.map((metric) => {
              const IconComponent = metric.icon;
              return (
                <button
                  key={metric.value}
                  type="button"
                  onClick={() => handleTypeChange(metric.value)}
                  className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                    formData.type === metric.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4" />
                    <div>
                      <div className="font-medium text-sm">{metric.label}</div>
                      <div className="text-xs text-gray-500">{metric.unit}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Value Input */}
        {formData.type && (
          <div className="animate-slide-up">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedMetric?.label} Value
            </label>
            <div className="flex space-x-2">
              <input
                type={getInputType(formData.type)}
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder={selectedMetric?.placeholder}
                step={getInputStep(formData.type)}
                className="metric-input flex-1"
                required
              />
              <div className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-md text-gray-600">
                {formData.unit}
              </div>
            </div>
            {formData.type === 'blood_pressure' && (
              <p className="text-xs text-gray-500 mt-1">
                Format: systolic/diastolic (e.g., 120/80)
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        {formData.type && (
          <div className="animate-slide-up">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this measurement..."
              rows={2}
              className="metric-input resize-none"
            />
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            disabled={!formData.type || !formData.value || isSubmitting}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Metric'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthMetricsForm;