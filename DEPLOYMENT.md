# Deployment Guide for Multiplayer Number Guessing Game

## Overview

This multiplayer game has two components that need to be deployed separately:

1. **Frontend (React App)** - Deploy to Netlify
2. **Backend (Socket.IO Server)** - Deploy to a server hosting platform

## Frontend Deployment (Netlify)

### Step 1: Prepare for Deployment

1. **Build the project locally first:**
   ```bash
   npm run build
   ```

2. **Test the build:**
   ```bash
   npx serve -s build
   ```

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   netlify deploy --prod --dir=build
   ```

#### Option B: Deploy via Netlify Dashboard
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
5. Click "Deploy site"

### Step 3: Configure Environment Variables

In your Netlify dashboard:
1. Go to Site settings > Environment variables
2. Add: `REACT_APP_SERVER_URL` = `https://your-server-domain.com`

## Backend Deployment Options

### Option 1: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Create a new project
4. Add the `server.js` file to your repository
5. Set environment variables if needed
6. Deploy

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your repository
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Deploy

### Option 3: Heroku

1. Create a `Procfile` in your root directory:
   ```
   web: node server.js
   ```

2. Deploy using Heroku CLI:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. Go to DigitalOcean App Platform
2. Create a new app
3. Connect your repository
4. Configure the server.js file
5. Deploy

## Important Notes

### CORS Configuration

Update your `server.js` CORS settings for production:

```javascript
const io = socketIo(server, {
  cors: {
    origin: ["https://your-netlify-app.netlify.app", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});
```

### Environment Variables

Make sure to set these environment variables on your server:
- `PORT` (usually set automatically by hosting platform)
- `NODE_ENV=production`

### Testing the Deployment

1. Deploy the backend first and get the URL
2. Update the `REACT_APP_SERVER_URL` in Netlify with your backend URL
3. Deploy the frontend
4. Test the multiplayer functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your server CORS settings include your Netlify domain
2. **Socket Connection Failed**: Verify the server URL is correct and the server is running
3. **Build Failures**: Check that all dependencies are in `package.json`

### Debugging

1. Check browser console for connection errors
2. Verify server logs for any issues
3. Test with a simple Socket.IO connection first

## Alternative: Single Platform Deployment

If you want to deploy everything on one platform, consider:
- **Vercel** (supports both frontend and serverless functions)
- **Railway** (supports both frontend and backend)
- **Render** (supports both static sites and web services)

## Security Considerations

1. Add rate limiting to your server
2. Implement proper error handling
3. Consider adding authentication if needed
4. Use HTTPS in production

## Performance Optimization

1. Enable gzip compression on your server
2. Use CDN for static assets
3. Implement proper caching headers
4. Monitor server performance
