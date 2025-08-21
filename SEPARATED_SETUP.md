# Separated Backend and Frontend Setup Guide

This guide explains how to run the Number Guessing Game with separated backend and frontend containers.

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐
│   Frontend      │ ◄──────────────────► │    Backend      │
│   (React)       │                      │   (Node.js)     │
│   Port: 3000    │                      │   Port: 3001    │
└─────────────────┘                      └─────────────────┘
```

## 📁 Project Structure

```
Game/
├── backend/                 # Backend Node.js server
│   ├── server.js           # Main server file
│   ├── config.env          # Environment variables
│   ├── package.json        # Backend dependencies
│   └── Dockerfile          # Backend container
├── frontend/               # Frontend React app
│   ├── src/               # React source code
│   ├── .env               # Frontend environment variables
│   ├── package.json       # Frontend dependencies
│   └── Dockerfile         # Frontend container
├── docker-compose.yml     # Multi-container setup
├── start-dev.sh          # Linux/Mac startup script
└── start-dev.bat         # Windows startup script
```

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Prerequisites:**
   - Docker Desktop installed and running
   - Git (to clone the repository)

2. **Start the application:**
   ```bash
   # On Windows
   start-dev.bat
   
   # On Linux/Mac
   ./start-dev.sh
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend Health Check: http://localhost:3001/health

### Option 2: Manual Setup

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start Frontend (in a new terminal):**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🔧 Configuration

### Backend Environment Variables (`backend/config.env`)

```env
# Port for the server to run on
PORT=3001

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### Frontend Environment Variables (`frontend/.env`)

```env
# Backend server URL
REACT_APP_SERVER_URL=http://localhost:3001

# Node Environment
NODE_ENV=development
```

## 🌐 API Endpoints

### Backend API Routes

- `GET /health` - Health check endpoint
- `GET /api/game-status` - Get current game status
- WebSocket connection for real-time game updates

### Frontend Routes

- `/` - Main game lobby
- Game components handle room creation and joining

## 🔌 Socket.IO Events

### Client to Server Events

- `join-game` - Join a game room
- `set-secret` - Set player's secret number
- `make-guess` - Make a guess at another player's number
- `restart-game` - Restart the current game

### Server to Client Events

- `joined-game` - Confirmation of joining a game
- `game-updated` - Game state update
- `guess-made` - New guess made by a player

## 🐳 Docker Configuration

### Backend Container
- **Port:** 3001
- **Base Image:** node:18-alpine
- **Dependencies:** express, socket.io, cors, dotenv

### Frontend Container
- **Port:** 3000
- **Base Image:** node:18-alpine
- **Dependencies:** React, socket.io-client, lucide-react

### Network Configuration
- Both containers run on the same Docker network (`game-network`)
- Frontend depends on backend for startup order

## 🔍 Troubleshooting

### Common Issues

1. **Frontend can't connect to backend:**
   - Check if backend is running on port 3001
   - Verify `REACT_APP_SERVER_URL` in frontend `.env`
   - Check CORS configuration in backend

2. **Docker containers not starting:**
   - Ensure Docker Desktop is running
   - Check if ports 3000 and 3001 are available
   - Run `docker-compose down` to stop existing containers

3. **Environment variables not loading:**
   - Verify `.env` files exist in both directories
   - Check file permissions
   - Restart containers after environment changes

### Debug Commands

```bash
# Check container status
docker-compose ps

# View backend logs
docker-compose logs backend

# View frontend logs
docker-compose logs frontend

# Access backend container
docker-compose exec backend sh

# Access frontend container
docker-compose exec frontend sh
```

## 📊 Health Checks

- **Backend Health:** http://localhost:3001/health
- **Game Status:** http://localhost:3001/api/game-status

## 🔄 Development Workflow

1. **Make changes to code**
2. **Docker will automatically rebuild** (if using volumes)
3. **Test changes** in the browser
4. **Check logs** if issues arise

## 🚀 Production Deployment

For production deployment, update the environment variables:

### Backend Production
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Production
```env
REACT_APP_SERVER_URL=https://your-backend-domain.com
NODE_ENV=production
```

## 📝 Notes

- The backend uses `config.env` instead of `.env` for Docker compatibility
- Frontend environment variables must start with `REACT_APP_`
- Socket.IO handles real-time communication between frontend and backend
- CORS is configured to allow frontend-backend communication
