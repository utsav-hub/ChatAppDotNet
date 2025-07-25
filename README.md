# Health Measures Chatbot 🏥

An AI-powered chatbot application for tracking and analyzing individual health measures. This full-stack application provides an intuitive interface for logging health metrics, chatting with an intelligent health assistant, and visualizing health trends with actionable insights.

## 🌟 Features

### 🤖 AI Health Assistant
- **Intelligent Chat Interface**: Natural language conversations about your health
- **Personalized Advice**: Get tailored recommendations based on your health data
- **Context-Aware Responses**: The bot understands your health history and provides relevant insights
- **Real-time Communication**: Instant responses with typing indicators and message history

### 📊 Health Metrics Tracking
- **Comprehensive Metrics**: Track 10+ health measures including:
  - Weight, Height, Blood Pressure, Heart Rate
  - Blood Sugar, Temperature, Sleep Hours
  - Daily Steps, Water Intake, Exercise Minutes
- **Easy Data Entry**: Intuitive forms with validation and helpful guidance
- **Flexible Input**: Support for various data types and formats

### 📈 Analytics & Insights
- **Interactive Dashboard**: Beautiful charts and visualizations
- **Trend Analysis**: Track changes over time with percentage calculations
- **Health Recommendations**: Personalized suggestions based on your data patterns
- **Progress Monitoring**: Visual feedback on your health journey

### 💎 Modern User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Clean Interface**: Modern UI with smooth animations and transitions
- **Real-time Updates**: Live data synchronization across all components
- **Offline Indicators**: Clear server status and connection monitoring

## 🛠️ Technology Stack

### Backend
- **Node.js & Express**: RESTful API server
- **In-Memory Storage**: Fast data access (easily extensible to databases)
- **Data Validation**: Joi schema validation for all inputs
- **Security**: Helmet, CORS, and input sanitization
- **Health Insights Engine**: Custom analytics for trend analysis

### Frontend
- **React 18 & TypeScript**: Type-safe, component-based architecture
- **Tailwind CSS**: Utility-first styling with custom design system
- **Recharts**: Interactive and responsive data visualizations
- **React Router**: Client-side routing for single-page application
- **Lucide Icons**: Modern, consistent iconography
- **Axios**: HTTP client with interceptors and error handling

### Development & Build
- **Concurrently**: Run server and client simultaneously
- **Hot Reload**: Instant development feedback
- **ESLint & TypeScript**: Code quality and type safety
- **Create React App**: Optimized build process

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd health-measures-chatbot
```

2. **Install dependencies for all components**
```bash
npm run install-all
```

3. **Start the development environment**
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend application on `http://localhost:3000`

The browser will automatically open to the application homepage.

### Production Deployment

1. **Build the frontend**
```bash
npm run build
```

2. **Start the production server**
```bash
npm start
```

## 📱 Usage Guide

### Getting Started
1. **Home Page**: Overview of your health data and quick access to all features
2. **Add Metrics**: Use the intuitive form to log health measurements
3. **Chat**: Interact with your AI health assistant for advice and insights
4. **Dashboard**: View comprehensive analytics and trend visualizations

### Adding Health Metrics
1. Click "Add Health Metric" button
2. Select the metric type (weight, blood pressure, etc.)
3. Enter the value with automatic unit detection
4. Add optional notes for context
5. Submit to save and update your health profile

### Chatting with Health Assistant
- **Ask Questions**: "What's my latest blood pressure?"
- **Get Summaries**: "Give me a health overview"
- **Seek Advice**: "How can I improve my heart health?"
- **Track Progress**: "Show me my weight trends"

### Understanding Dashboard
- **Summary Cards**: Quick overview of total records and metrics tracked
- **Trend Analysis**: Visual indicators showing increases, decreases, or stability
- **Interactive Charts**: Line charts for trends, bar charts for single data points
- **Recommendations**: AI-generated suggestions based on your data patterns

## 🔧 API Reference

### Health Data Endpoints
- `GET /api/health/data/:userId` - Retrieve user's health data
- `POST /api/health/data` - Add new health metric
- `GET /api/health/insights/:userId` - Get health analytics and insights

### Chat Endpoints
- `POST /api/chat` - Send message to health assistant
- `GET /api/chat/history/:sessionId` - Retrieve conversation history

### Health Check
- `GET /api/health` - Server status and health check

## 🎯 Key Features Explained

### Intelligent Health Assistant
The chatbot uses natural language processing to understand user queries and provides contextual responses based on:
- Current health data trends
- Historical patterns and changes
- General health advice and best practices
- Personalized recommendations

### Advanced Analytics
The dashboard provides:
- **Trend Calculation**: Percentage changes over time periods
- **Direction Indicators**: Visual cues for improvement or decline
- **Multi-metric Comparison**: Side-by-side analysis of different health measures
- **Predictive Insights**: Early warning suggestions based on data patterns

### Responsive Design System
- **Mobile-First**: Optimized for smaller screens with touch-friendly interfaces
- **Progressive Enhancement**: Enhanced features on larger displays
- **Consistent Theming**: Unified color scheme and spacing throughout
- **Accessibility**: Keyboard navigation and screen reader support

## 🔮 Future Enhancements

### Planned Features
- **User Authentication**: Multi-user support with secure login
- **Database Integration**: PostgreSQL or MongoDB for data persistence
- **Export Functionality**: PDF reports and CSV data exports
- **Notifications**: Reminders for metric logging and health checkups
- **Integration APIs**: Connect with fitness trackers and health devices
- **Advanced AI**: Machine learning models for predictive health insights

### Extensibility
The application is designed with modularity in mind:
- **Plugin Architecture**: Easy addition of new health metrics
- **API-First Design**: Simple integration with external services
- **Component Library**: Reusable UI components for rapid development
- **Configuration-Driven**: Easy customization of features and appearance

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section below
2. Open an issue on GitHub
3. Contact the development team

## 🔍 Troubleshooting

### Common Issues

**Server Connection Failed**
- Ensure Node.js is installed and running
- Check that port 5000 is not being used by another application
- Verify all dependencies are installed with `npm run install-all`

**Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm run install-all`
- Check TypeScript compilation: `cd client && npm run build`
- Verify all peer dependencies are satisfied

**Chat Not Working**
- Confirm the backend server is running
- Check browser console for API errors
- Verify CORS settings allow frontend domain

---

Built with ❤️ for better health tracking and management