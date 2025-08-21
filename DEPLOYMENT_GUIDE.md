# Backend Deployment Guide

## 🚀 Production Deployment Checklist

### ✅ **Server.js Issues Fixed:**

1. **Environment Variable Loading:**
   - ✅ Fixed to handle both development and production
   - ✅ Uses `.env` for production, `config.env` for development

2. **Server Configuration:**
   - ✅ Added proper HOST binding (`0.0.0.0`)
   - ✅ Added error handling for port conflicts
   - ✅ Added detailed startup logging

3. **CORS Configuration:**
   - ✅ Properly configured for production
   - ✅ Handles multiple origins

### 🔧 **Deployment Steps:**

#### **1. Environment Variables (Production)**
Create a `.env` file in the backend directory:
```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
FRONTEND_URL=https://your-frontend-domain.com
```

#### **2. Dependencies Check**
```bash
cd backend
npm install --production
```

#### **3. Test the Backend**
```bash
# Test locally first
npm start

# Check health endpoint
curl http://localhost:3001/health
```

#### **4. Production Docker Build**
```bash
# Build production image
docker build -f Dockerfile -t number-game-backend:prod .

# Run production container
docker run -d \
  --name number-game-backend \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e HOST=0.0.0.0 \
  -e FRONTEND_URL=https://your-frontend-domain.com \
  number-game-backend:prod
```

### 🌐 **Platform-Specific Deployment:**

#### **Heroku:**
```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=3001
heroku config:set FRONTEND_URL=https://your-frontend-domain.com

# Deploy
git push heroku main
```

#### **Railway:**
```bash
# Set environment variables in Railway dashboard
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com

# Deploy
railway up
```

#### **Render:**
```bash
# Set environment variables in Render dashboard
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com

# Deploy
git push render main
```

#### **DigitalOcean App Platform:**
```yaml
# app.yaml
name: number-game-backend
services:
- name: backend
  source_dir: /backend
  environment_slug: node-js
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: 3001
  - key: FRONTEND_URL
    value: https://your-frontend-domain.com
```

### 🔍 **Health Check Endpoints:**

- **Health Check:** `GET /health`
- **Game Status:** `GET /api/game-status`
- **Socket.IO:** WebSocket connection on same port

### 📊 **Monitoring:**

#### **Health Check Response:**
```json
{
  "status": "OK",
  "message": "Number Guessing Game Backend is running",
  "activeGames": 0,
  "timestamp": "2025-08-21T16:20:00.000Z"
}
```

#### **Game Status Response:**
```json
{
  "totalGames": 0,
  "activeGames": [],
  "serverTime": "2025-08-21T16:20:00.000Z"
}
```

### 🛠️ **Troubleshooting:**

#### **Common Issues:**

1. **Port Already in Use:**
   ```bash
   # Check what's using the port
   lsof -i :3001
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Environment Variables Not Loading:**
   ```bash
   # Check if .env file exists
   ls -la backend/.env
   
   # Verify environment variables
   echo $NODE_ENV
   echo $PORT
   ```

3. **CORS Issues:**
   - Verify `FRONTEND_URL` is set correctly
   - Check browser console for CORS errors

4. **Socket.IO Connection Issues:**
   - Ensure WebSocket is enabled on your platform
   - Check if proxy/load balancer supports WebSockets

### ✅ **Pre-Deployment Checklist:**

- [ ] Environment variables configured
- [ ] Dependencies installed (`npm install --production`)
- [ ] Health endpoint responding (`/health`)
- [ ] Game status endpoint working (`/api/game-status`)
- [ ] CORS configured for frontend domain
- [ ] Port 3001 available
- [ ] Error handling in place
- [ ] Logging configured

### 🎯 **Post-Deployment Verification:**

1. **Health Check:**
   ```bash
   curl https://your-backend-domain.com/health
   ```

2. **Game Status:**
   ```bash
   curl https://your-backend-domain.com/api/game-status
   ```

3. **Frontend Connection:**
   - Update frontend `REACT_APP_SERVER_URL` to your backend URL
   - Test Socket.IO connection

### 📝 **Notes:**

- The backend is now production-ready with proper error handling
- Environment variables are properly configured for deployment
- CORS is set up for production frontend domains
- Health checks are available for monitoring
- Socket.IO is configured for real-time communication

Your backend is ready for deployment! 🚀
