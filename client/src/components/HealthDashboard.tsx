import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { healthAPI } from '../services/api';
import { HealthMetric, HealthInsights } from '../types';
import { format } from 'date-fns';

interface HealthDashboardProps {
  userId: string;
  healthData: HealthMetric[];
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({ userId, healthData }) => {
  const [insights, setInsights] = useState<HealthInsights | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        const data = await healthAPI.getHealthInsights(userId);
        setInsights(data);
        
        // Set first available metric as selected
        if (data.metricsTracked.length > 0 && !selectedMetric) {
          setSelectedMetric(data.metricsTracked[0]);
        }
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setLoading(false);
      }
    };

    if (healthData.length > 0) {
      loadInsights();
    } else {
      setLoading(false);
    }
  }, [userId, healthData, selectedMetric]);

  const getMetricData = (metricType: string) => {
    return healthData
      .filter(d => d.type === metricType)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(d => ({
        date: format(new Date(d.timestamp), 'MMM dd'),
        value: typeof d.value === 'number' ? d.value : parseFloat(d.value as string) || 0,
        timestamp: d.timestamp
      }));
  };

  const getMetricIcon = (direction: string) => {
    switch (direction) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMetricColor = (direction: string) => {
    switch (direction) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatMetricName = (metric: string) => {
    return metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="health-card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!healthData.length) {
    return (
      <div className="health-card text-center">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Health Data Yet</h3>
        <p className="text-gray-500">
          Start tracking your health metrics to see insights and trends here.
        </p>
      </div>
    );
  }

  const chartData = selectedMetric ? getMetricData(selectedMetric) : [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="health-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{insights?.totalRecords || 0}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="health-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Metrics Tracked</p>
              <p className="text-2xl font-bold text-gray-900">{insights?.metricsTracked.length || 0}</p>
            </div>
            <div className="bg-health-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-health-600" />
            </div>
          </div>
        </div>

        <div className="health-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Latest Entry</p>
              <p className="text-lg font-semibold text-gray-900">
                {healthData.length > 0 
                  ? format(new Date(healthData[healthData.length - 1].timestamp), 'MMM dd')
                  : 'None'
                }
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Trends Overview */}
      {insights && Object.keys(insights.trends).length > 0 && (
        <div className="health-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(insights.trends).map(([metric, trend]) => (
              <div key={metric} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">{formatMetricName(metric)}</h4>
                  {getMetricIcon(trend.direction)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${getMetricColor(trend.direction)}`}>
                    {trend.direction === 'increase' ? '+' : trend.direction === 'decrease' ? '' : ''}
                    {Math.abs(trend.change).toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({trend.percentChange}% over {trend.recordCount} records)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart Section */}
      {insights && insights.metricsTracked.length > 0 && (
        <div className="health-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Metric Trends</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="metric-input w-auto"
            >
              {insights.metricsTracked.map(metric => (
                <option key={metric} value={metric}>
                  {formatMetricName(metric)}
                </option>
              ))}
            </select>
          </div>

          {chartData.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chartData.length > 1 ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0ea5e9" 
                      strokeWidth={2}
                      dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 2 }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#0ea5e9"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {insights && insights.recommendations.length > 0 && (
        <div className="health-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>
          <div className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                  <Activity className="h-3 w-3 text-blue-600" />
                </div>
                <p className="text-sm text-blue-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthDashboard;