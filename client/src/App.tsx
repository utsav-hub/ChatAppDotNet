import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, BarChart3, Plus, Menu, X } from 'lucide-react';
import ChatBot from './components/ChatBot';
import HealthMetricsForm from './components/HealthMetricsForm';
import HealthDashboard from './components/HealthDashboard';
import { healthAPI, checkServerHealth } from './services/api';
import { HealthMetric } from './types';

function App() {
  const [healthData, setHealthData] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userId = 'default'; // In a real app, this would come from authentication
  const sessionId = 'main-session';

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check server health
        await checkServerHealth();
        setServerStatus('online');
        
        // Load health data
        const data = await healthAPI.getHealthData(userId);
        setHealthData(data.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setServerStatus('offline');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [userId]);

  const handleMetricAdded = async () => {
    console.log('handleMetricAdded called - refreshing health data');
    try {
      const data = await healthAPI.getHealthData(userId);
      console.log('New health data received:', data);
      setHealthData(data.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })));
    } catch (error) {
      console.error('Failed to refresh health data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary-500 animate-pulse mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">Loading Health Assistant...</h2>
        </div>
      </div>
    );
  }

  if (serverStatus === 'offline') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Server Offline</h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the health chatbot server. Please ensure the server is running on port 5000.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation 
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          serverStatus={serverStatus}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <HomePage 
                userId={userId}
                sessionId={sessionId}
                healthData={healthData}
                onMetricAdded={handleMetricAdded}
              />
            } />
            <Route path="/chat" element={
              <ChatPage userId={userId} sessionId={sessionId} />
            } />
            <Route path="/dashboard" element={
              <DashboardPage userId={userId} healthData={healthData} />
            } />
            <Route path="/add-metric" element={
              <AddMetricPage userId={userId} onMetricAdded={handleMetricAdded} />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

interface NavigationProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  serverStatus: string;
}

const Navigation: React.FC<NavigationProps> = ({ mobileMenuOpen, setMobileMenuOpen, serverStatus }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Heart },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/add-metric', label: 'Add Metric', icon: Plus },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">HealthBot</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Server Status & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-600 hidden sm:inline">
                {serverStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Page Components
interface HomePageProps {
  userId: string;
  sessionId: string;
  healthData: HealthMetric[];
  onMetricAdded: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ userId, sessionId, healthData, onMetricAdded }) => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your Health Assistant
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Track your health metrics, chat with your AI assistant, and get personalized insights 
          to help you achieve your wellness goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="health-card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{healthData.length}</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="text-center p-4 bg-health-50 rounded-lg">
                <div className="text-2xl font-bold text-health-600">
                  {new Set(healthData.map(d => d.type)).size}
                </div>
                <div className="text-sm text-gray-600">Metrics Tracked</div>
              </div>
            </div>
          </div>

          <HealthMetricsForm userId={userId} onMetricAdded={onMetricAdded} />
        </div>

        {/* Chat Interface */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat with Your Health Assistant</h2>
          <ChatBot userId={userId} sessionId={sessionId} />
        </div>
      </div>

      {/* Recent Metrics */}
      {healthData.length > 0 && (
        <div className="health-card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Health Records</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Metric</th>
                  <th className="text-left p-2">Value</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {healthData
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 5)
                  .map((metric) => (
                    <tr key={metric.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium capitalize">
                        {metric.type.replace('_', ' ')}
                      </td>
                      {/* <td className="p-2">
                        ({String(metric.value)}) ({String(metric.unit)})
                      </td> */}
                      <td className="p-2 text-gray-600">
                        {new Date(metric.timestamp).toLocaleDateString()}
                      </td>
                      <td className="p-2 text-gray-600">
                        {metric.notes || '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ChatPage: React.FC<{ userId: string; sessionId: string }> = ({ userId, sessionId }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Assistant Chat</h1>
        <p className="text-gray-600">
          Ask questions about your health metrics, get advice, and receive personalized recommendations.
        </p>
      </div>
      <ChatBot userId={userId} sessionId={sessionId} />
    </div>
  );
};

const DashboardPage: React.FC<{ userId: string; healthData: HealthMetric[] }> = ({ userId, healthData }) => {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Dashboard</h1>
        <p className="text-gray-600">
          View your health trends, insights, and progress over time.
        </p>
      </div>
      <HealthDashboard userId={userId} healthData={healthData} />
    </div>
  );
};

const AddMetricPage: React.FC<{ userId: string; onMetricAdded: () => void }> = ({ userId, onMetricAdded }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Health Metric</h1>
        <p className="text-gray-600">
          Track your health by adding new measurements and observations.
        </p>
      </div>
      <HealthMetricsForm userId={userId} onMetricAdded={onMetricAdded} />
    </div>
  );
};

export default App;