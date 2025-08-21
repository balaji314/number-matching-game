// Configuration for different environments
const config = {
  // Development server URL - points to backend running locally
  development: {
    serverUrl: process.env.REACT_APP_SERVER_URL || 'http://localhost:3001'
  },
  // Production server URL - will be set via environment variable
  production: {
    serverUrl: process.env.REACT_APP_SERVER_URL || 'https://your-backend-domain.com'
  }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Export the appropriate configuration
export const serverUrl = config[environment as keyof typeof config].serverUrl;

// API endpoints
export const API_ENDPOINTS = {
  SOCKET_CONNECTION: serverUrl,
  // You can add more API endpoints here as needed
  HEALTH_CHECK: `${serverUrl}/health`,
  GAME_STATUS: `${serverUrl}/api/game-status`
};