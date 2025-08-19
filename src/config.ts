// Configuration for different environments
const config = {
  // Development server URL
  development: {
    serverUrl: 'http://localhost:3001'
  },
  // Production server URL (you'll need to deploy your server separately)
  production: {
    serverUrl: process.env.REACT_APP_SERVER_URL || 'https://your-server-domain.com'
  }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Export the appropriate configuration
export const serverUrl = config[environment as keyof typeof config].serverUrl;
