const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
origin: 'http://localhost:3000', // Your React app URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // if you send cookies or auth headers
}));
app.use(express.json());
app.use(morgan('combined'));

// In-memory storage for demo (in production, use a database)
let healthData = new Map();
let conversations = new Map();

// Health data validation schema
const healthMetricSchema = Joi.object({
  type: Joi.string().valid(
    'weight', 'height', 'blood_pressure', 'heart_rate', 'blood_sugar',
    'temperature', 'sleep_hours', 'steps', 'water_intake', 'exercise_minutes'
  ).required(),
  value: Joi.alternatives().try(
    Joi.number(),
    Joi.string(),
    Joi.object()
  ).required(),
  unit: Joi.string().required(),
  timestamp: Joi.date().default(Date.now),
  notes: Joi.string().optional(),
  userId: Joi.string().optional()
});

const chatMessageSchema = Joi.object({
  message: Joi.string().required(),
  sessionId: Joi.string().optional(),
  userId: Joi.string().optional()
});

// Health chatbot logic
class HealthChatbot {
  constructor() {
    this.responses = {
      greeting: [
        "Hello! I'm your health assistant. How can I help you track your health today?",
        "Hi there! I'm here to help you monitor your health metrics. What would you like to know?",
        "Welcome! I can help you track weight, blood pressure, heart rate, and more. How can I assist you?"
      ],
      weight: {
        record: "Great! I've recorded your weight. Remember, healthy weight management is about consistency and gradual changes.",
        advice: "For healthy weight management: eat balanced meals, stay hydrated, exercise regularly, and get adequate sleep."
      },
      blood_pressure: {
        record: "Blood pressure recorded. Regular monitoring helps track cardiovascular health.",
        advice: "To maintain healthy blood pressure: reduce sodium intake, exercise regularly, manage stress, and limit alcohol."
      },
      heart_rate: {
        record: "Heart rate logged successfully. Your heart rate can tell us a lot about your fitness level.",
        advice: "To improve heart health: do cardio exercises, manage stress, get quality sleep, and maintain a healthy diet."
      },
      blood_sugar: {
        record: "Blood sugar level recorded. Consistent monitoring helps manage diabetes and overall health.",
        advice: "To maintain healthy blood sugar: eat balanced meals, exercise regularly, monitor portions, and take medications as prescribed."
      },
      general_health: [
        "Remember: small consistent changes lead to big health improvements!",
        "Your health journey is unique. Focus on progress, not perfection.",
        "Regular monitoring helps you understand your body better and make informed decisions."
      ]
    };
  }

  generateResponse(message, healthData = []) {
    const msg = message.toLowerCase();
    
    // Greeting detection
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return this.getRandomResponse(this.responses.greeting);
    }

    // Health metric queries
    if (msg.includes('weight')) {
      const weightData = healthData.filter(d => d.type === 'weight');
      if (weightData.length > 0) {
        const latest = weightData[weightData.length - 1];
        return `Your latest weight is ${latest.value} ${latest.unit}. ${this.responses.weight.advice}`;
      }
      return "I don't have any weight data recorded yet. Would you like to log your weight?";
    }

    if (msg.includes('blood pressure')) {
      const bpData = healthData.filter(d => d.type === 'blood_pressure');
      if (bpData.length > 0) {
        const latest = bpData[bpData.length - 1];
        return `Your latest blood pressure is ${latest.value}. ${this.responses.blood_pressure.advice}`;
      }
      return "No blood pressure data found. Would you like to record your blood pressure?";
    }

    if (msg.includes('heart rate')) {
      const hrData = healthData.filter(d => d.type === 'heart_rate');
      if (hrData.length > 0) {
        const latest = hrData[hrData.length - 1];
        return `Your latest heart rate is ${latest.value} ${latest.unit}. ${this.responses.heart_rate.advice}`;
      }
      return "No heart rate data recorded. Would you like to log your heart rate?";
    }

    if (msg.includes('summary') || msg.includes('overview')) {
      if (healthData.length === 0) {
        return "You haven't recorded any health data yet. Start by logging some metrics like weight, blood pressure, or heart rate!";
      }
      
      const summary = this.generateHealthSummary(healthData);
      return summary;
    }

    // Help and instructions
    if (msg.includes('help') || msg.includes('what can you do')) {
      return `I can help you:
• Track health metrics (weight, blood pressure, heart rate, blood sugar, etc.)
• Provide health tips and advice
• Give you summaries of your health data
• Answer questions about your health trends

Try saying things like "log my weight" or "show my blood pressure" or "give me a health summary"`;
    }

    // Default response
    return `I understand you're asking about "${message}". I can help you track health metrics, provide health advice, and analyze your data. Try asking me to "log weight", "show blood pressure", or "give health summary". What specific health information would you like to discuss?`;
  }

  generateHealthSummary(healthData) {
    const typeGroups = {};
    healthData.forEach(data => {
      if (!typeGroups[data.type]) {
        typeGroups[data.type] = [];
      }
      typeGroups[data.type].push(data);
    });

    let summary = "📊 **Health Summary:**\n\n";
    
    Object.keys(typeGroups).forEach(type => {
      const data = typeGroups[type];
      const latest = data[data.length - 1];
      const count = data.length;
      
      summary += `• **${type.replace('_', ' ').toUpperCase()}**: ${latest.value} ${latest.unit} (${count} recordings)\n`;
    });

    summary += `\n💡 Keep up the great work tracking your health! Regular monitoring helps you stay on top of your wellness goals.`;
    
    return summary;
  }

  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

const chatbot = new HealthChatbot();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Health Measures Chatbot API is running!' });
});

// Get all health data for a user
app.get('/api/health/data/:userId?', (req, res) => {
  const userId = req.params.userId || 'default';
  const userData = healthData.get(userId) || [];
  res.json(userData);
});

// Add health metric
app.post('/api/health/data', (req, res) => {
  try {
    console.log('Received health metric request:', req.body);
    const { error, value } = healthMetricSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userId = 'default' } = value;
    console.log('Processing for userId:', userId);
    
    const healthMetric = {
      id: uuidv4(),
      ...value,
      timestamp: new Date()
    };

    if (!healthData.has(userId)) {
      healthData.set(userId, []);
    }
    
    healthData.get(userId).push(healthMetric);
    console.log('Health metric added successfully:', healthMetric);
    
    res.status(201).json({
      message: 'Health metric recorded successfully',
      data: healthMetric
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat endpoint

app.post('/api/chat', (req, res) => {
  try {
    
    const { error, value } = chatMessageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { message, sessionId = 'default', userId = 'default' } = value;
    
    // Get user's health data for context
    const userData = healthData.get(userId) || [];
    
    // Generate response
    const response = chatbot.generateResponse(message, userData);
    
    // Store conversation
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, []);
    }
    
    const conversation = conversations.get(sessionId);
    conversation.push(
      { type: 'user', message, timestamp: new Date() },
      { type: 'bot', message: response, timestamp: new Date() }
    );

    res.json({
      response,
      sessionId,
      conversation: conversation.slice(-10) // Return last 10 messages
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation history
app.get('/api/chat/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const conversation = conversations.get(sessionId) || [];
  res.json(conversation);
});

// Health insights endpoint
app.get('/api/health/insights/:userId?', (req, res) => {
  const userId = req.params.userId || 'default';
  const userData = healthData.get(userId) || [];
  
  if (userData.length === 0) {
    return res.json({
      message: "No health data available for insights. Start tracking your health metrics!"
    });
  }

  const insights = generateHealthInsights(userData);
  res.json(insights);
});

function generateHealthInsights(data) {
  const insights = {
    totalRecords: data.length,
    metricsTracked: [...new Set(data.map(d => d.type))],
    trends: {},
    recommendations: []
  };

  // Analyze trends for each metric type
  const typeGroups = {};
  data.forEach(record => {
    if (!typeGroups[record.type]) {
      typeGroups[record.type] = [];
    }
    typeGroups[record.type].push(record);
  });

  Object.keys(typeGroups).forEach(type => {
    const records = typeGroups[type].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    if (records.length >= 2) {
      const first = parseFloat(records[0].value);
      const last = parseFloat(records[records.length - 1].value);
      
      if (!isNaN(first) && !isNaN(last)) {
        const change = last - first;
        const percentChange = ((change / first) * 100).toFixed(1);
        
        insights.trends[type] = {
          change,
          percentChange,
          direction: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable',
          recordCount: records.length
        };
      }
    }
  });

  // Generate recommendations
  if (insights.metricsTracked.length < 3) {
    insights.recommendations.push("Consider tracking more health metrics like blood pressure, heart rate, or sleep hours for a complete picture.");
  }
  
  if (data.length < 7) {
    insights.recommendations.push("Try to log health data more frequently for better trend analysis.");
  }

  insights.recommendations.push("Great job tracking your health! Consistency is key to achieving your wellness goals.");

  return insights;
}

app.listen(PORT, () => {
  console.log(`🏥 Health Measures Chatbot Server running on port ${PORT}`);
  console.log(`🚀 API available at http://localhost:${PORT}/api`);
});