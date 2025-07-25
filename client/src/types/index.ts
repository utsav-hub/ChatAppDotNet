export interface HealthMetric {
  id: string;
  type: 'weight' | 'height' | 'blood_pressure' | 'heart_rate' | 'blood_sugar' | 
        'temperature' | 'sleep_hours' | 'steps' | 'water_intake' | 'exercise_minutes';
  value: number | string | object;
  unit: string;
  timestamp: Date;
  notes?: string;
}

export interface ChatMessage {
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  conversation: ChatMessage[];
}

export interface HealthInsights {
  totalRecords: number;
  metricsTracked: string[];
  trends: {
    [key: string]: {
      change: number;
      percentChange: string;
      direction: 'increase' | 'decrease' | 'stable';
      recordCount: number;
    };
  };
  recommendations: string[];
}

export interface MetricFormData {
  type: string;
  value: string;
  unit: string;
  notes: string;
}