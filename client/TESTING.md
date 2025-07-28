# Testing Documentation

This document provides an overview of the testing strategy and test cases for the Health Chatbot application.

## Test Structure

The test suite is organized into the following categories:

### 1. Component Tests (`src/__tests__/`)
- **App.test.tsx**: Main application component tests
- **HealthMetricsForm.test.tsx**: Health metric form component tests
- **ChatBot.test.tsx**: Chat interface component tests
- **HealthDashboard.test.tsx**: Dashboard component tests

### 2. Service Tests (`src/__tests__/`)
- **api.test.ts**: API service function tests

### 3. Utility Tests (`src/__tests__/`)
- **utils.test.ts**: Helper function tests

## Test Categories

### Component Tests

#### App Component Tests
- **Initialization**: Tests app loading, navigation rendering, and server status
- **Navigation**: Tests routing between different pages
- **Health Data Management**: Tests data refresh when metrics are added
- **Error Handling**: Tests graceful handling of API errors

#### HealthMetricsForm Component Tests
- **Initial Render**: Tests form button and form opening
- **Form Interaction**: Tests metric type selection and auto-filling
- **Form Submission**: Tests successful submission and callback execution
- **Form Validation**: Tests required field validation
- **Loading States**: Tests loading indicators during submission
- **Error Handling**: Tests API error scenarios

#### ChatBot Component Tests
- **Initial Render**: Tests chat interface and history loading
- **Message Sending**: Tests message submission via button and Enter key
- **Message Display**: Tests user and bot message rendering
- **Loading States**: Tests loading indicators during message sending
- **Error Handling**: Tests API error scenarios
- **Input Validation**: Tests message validation and trimming

#### HealthDashboard Component Tests
- **Initial Render**: Tests dashboard loading and empty state
- **Insights Display**: Tests health insights and trends
- **Metric Selection**: Tests metric filtering and detailed views
- **Trend Analysis**: Tests trend calculations and display
- **Error Handling**: Tests API error scenarios
- **Data Visualization**: Tests chart rendering

### Service Tests

#### API Service Tests
- **Health API**: Tests health data CRUD operations
- **Chat API**: Tests message sending and history retrieval
- **Server Health**: Tests server connectivity
- **Error Handling**: Tests network and HTTP error scenarios
- **Request Configuration**: Tests API configuration

### Utility Tests

#### Helper Function Tests
- **formatMetricValue**: Tests value formatting
- **getMetricColor**: Tests color mapping
- **getMetricIcon**: Tests icon mapping
- **validateHealthData**: Tests data validation
- **calculateTrend**: Tests trend calculations

## Running Tests

### Development Mode
```bash
npm test
```
Runs tests in watch mode with interactive interface.

### Coverage Report
```bash
npm run test:coverage
```
Generates a coverage report showing test coverage percentages.

### CI Mode
```bash
npm run test:ci
```
Runs tests once with coverage and exits with appropriate code.

## Test Coverage Goals

The test suite aims for:
- **70% line coverage**
- **70% branch coverage**
- **70% function coverage**
- **70% statement coverage**

## Mocking Strategy

### API Mocks
- All API calls are mocked using Jest
- Mock responses simulate real server responses
- Error scenarios are tested with mock rejections

### Component Mocks
- Child components are mocked to isolate unit tests
- Mock components return simple divs with test IDs
- Props are passed through to test parent-child communication

### Browser API Mocks
- `IntersectionObserver` and `ResizeObserver` are mocked for chart components
- `window.matchMedia` is mocked for responsive design tests
- Console methods are filtered to reduce test noise

## Test Data

### Mock Health Data
```typescript
const mockHealthData = [
  {
    id: '1',
    type: 'weight',
    value: 70,
    unit: 'kg',
    timestamp: new Date(),
    notes: 'Morning weight'
  }
];
```

### Mock Chat Responses
```typescript
const mockResponse = {
  response: 'Hello! How can I help you today?',
  sessionId: 'test-session',
  conversation: [
    { type: 'user', message: 'Hello', timestamp: new Date() },
    { type: 'bot', message: 'Hello! How can I help you today?', timestamp: new Date() }
  ]
};
```

## Best Practices

### Test Organization
- Tests are grouped by functionality
- Each test has a clear, descriptive name
- Setup and teardown is handled in `beforeEach` and `afterEach`

### Assertions
- Use semantic assertions from `@testing-library/jest-dom`
- Test user behavior, not implementation details
- Focus on accessibility and user experience

### Async Testing
- Use `waitFor` for async operations
- Mock API calls with realistic delays
- Test loading states and error states

### User Interaction
- Use `@testing-library/user-event` for realistic user interactions
- Test keyboard navigation and accessibility
- Verify form submissions and callbacks

## Common Test Patterns

### Testing API Calls
```typescript
it('should call API with correct parameters', async () => {
  mockAPI.getHealthData.mockResolvedValue(mockData);
  
  render(<Component />);
  
  await waitFor(() => {
    expect(mockAPI.getHealthData).toHaveBeenCalledWith('test-user');
  });
});
```

### Testing User Interactions
```typescript
it('should handle user input', async () => {
  const user = userEvent.setup();
  
  render(<Component />);
  
  const input = screen.getByLabelText(/message/i);
  await user.type(input, 'Hello');
  
  expect(input).toHaveValue('Hello');
});
```

### Testing Error States
```typescript
it('should handle API errors', async () => {
  mockAPI.getHealthData.mockRejectedValue(new Error('API Error'));
  
  render(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Continuous Integration

Tests are configured to run in CI environments with:
- Coverage reporting
- Exit codes for pass/fail
- No interactive mode
- Parallel execution

## Debugging Tests

### Common Issues
1. **Async operations**: Use `waitFor` for async assertions
2. **Mock cleanup**: Clear mocks in `beforeEach`
3. **Component updates**: Use `act` for state updates
4. **Event handling**: Use `userEvent` for realistic interactions

### Debug Commands
```bash
# Run specific test file
npm test -- HealthMetricsForm.test.tsx

# Run tests with verbose output
npm test -- --verbose

# Run tests in debug mode
npm test -- --debug
```

## Future Improvements

1. **Integration Tests**: Add end-to-end tests with Cypress
2. **Performance Tests**: Add performance benchmarking
3. **Visual Regression Tests**: Add visual testing with Percy
4. **Accessibility Tests**: Add automated accessibility testing
5. **Mobile Testing**: Add mobile-specific test scenarios 