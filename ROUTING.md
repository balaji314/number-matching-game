# 🔗 Frontend-Backend Routing & Communication

This document explains the complete routing and communication setup between the frontend and backend services in the Number Guessing Game.

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/Socket.IO    ┌─────────────────┐
│   Frontend      │◄────────────────────►│    Backend      │
│   (Port 3000)   │                      │   (Port 3001)   │
│                 │                      │                 │
│ React App       │                      │ Express Server  │
│ Socket.IO Client│                      │ Socket.IO Server│
└─────────────────┘                      └─────────────────┘
         │                                       │
         └───────────────────────────────────────┘
                         │
                 ┌─────────────────┐
                 │  Docker Network │
                 │  (game-network) │
                 └─────────────────┘
```

## 🌐 Port Configuration

| Service | Container Port | Host Port | Protocol | Purpose |
|---------|----------------|-----------|----------|---------|
| **Frontend** | 3000 | 3000 | HTTP | React application |
| **Backend** | 3001 | 3001 | HTTP + WebSocket | API server + Socket.IO |

## 🔄 Environment Variables

### Frontend Environment
```env
NODE_ENV=production
REACT_APP_SERVER_URL=http://localhost:3001
```

### Backend Environment
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## 📡 Communication Protocols

### 1. HTTP REST API
- **Protocol**: HTTP/HTTPS
- **Port**: 3001
- **Purpose**: Health checks, status endpoints

### 2. WebSocket (Socket.IO)
- **Protocol**: WebSocket over HTTP
- **Port**: 3001 (same as REST API)
- **Purpose**: Real-time game communication

## 🛣️ API Routes

### REST Endpoints (Backend)

#### Health Check
```
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "message": "Number Guessing Game Backend is running",
  "activeGames": 0,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Game Status
```
GET /api/game-status
```
**Response:**
```json
{
  "totalGames": 2,
  "activeGames": ["123ABC", "456DEF"],
  "serverTime": "2024-01-01T00:00:00.000Z"
}
```

### Socket.IO Events

#### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `join-game` | `{ gameId, playerName }` | Join or create a game room |
| `set-secret` | `{ secretNumber }` | Set player's secret number |
| `make-guess` | `{ targetPlayerId, guess }` | Make a guess |
| `restart-game` | `{}` | Restart the current game |

#### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `joined-game` | `{ success, playerId?, gameState?, reason? }` | Response to join request |
| `game-updated` | `gameState` | Game state update |
| `guess-made` | `guessData` | Guess result |
| `error` | `{ message }` | Error message |

## 🔧 Frontend Configuration

### Socket.IO Connection
```typescript
// frontend/src/App.tsx
import { serverUrl } from './config';
const socket = io(serverUrl);
```

### API Endpoints
```typescript
// frontend/src/config.ts
export const API_ENDPOINTS = {
  SOCKET_CONNECTION: serverUrl,
  HEALTH_CHECK: `${serverUrl}/health`,
  GAME_STATUS: `${serverUrl}/api/game-status`
};
```

## 🔒 CORS Configuration

### Backend CORS Setup
```javascript
// backend/server.js
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || "https://your-frontend-domain.netlify.app",
        "http://localhost:3000"
      ]
    : "http://localhost:3000",
  credentials: true
}));
```

### Socket.IO CORS
```javascript
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          process.env.FRONTEND_URL || "https://your-frontend-domain.netlify.app",
          "http://localhost:3000"
        ]
      : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

## 🐳 Docker Network Configuration

### Docker Compose Network
```yaml
# docker-compose.yml
services:
  backend:
    networks:
      - game-network
    ports:
      - "3001:3001"
  
  frontend:
    networks:
      - game-network
    ports:
      - "3000:3000"
    depends_on:
      - backend

networks:
  game-network:
    driver: bridge
```

### Container Communication
- **Frontend → Backend**: `http://localhost:3001` (via host port mapping)
- **Backend → Frontend**: `http://localhost:3000` (via host port mapping)
- **Internal Network**: Services can communicate using container names

## 🔄 Data Flow

### 1. Game Join Flow
```
Frontend → Backend: join-game { gameId, playerName }
Backend → Frontend: joined-game { success, playerId, gameState }
Backend → All Clients: game-updated { gameState }
```

### 2. Secret Setting Flow
```
Frontend → Backend: set-secret { secretNumber }
Backend → All Clients: game-updated { gameState }
```

### 3. Guessing Flow
```
Frontend → Backend: make-guess { targetPlayerId, guess }
Backend → All Clients: guess-made { guessData }
Backend → All Clients: game-updated { gameState }
```

## 🚨 Error Handling

### Frontend Error Handling
```typescript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // Handle connection errors
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  // Handle disconnection
});
```

### Backend Error Handling
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});

socket.emit('error', { message: 'Invalid request' });
```

## 🔍 Debugging Routes

### Check Backend Health
```bash
curl http://localhost:3001/health
```

### Check Game Status
```bash
curl http://localhost:3001/api/game-status
```

### Monitor Socket Connections
```javascript
// Backend logs
console.log('User connected:', socket.id);
console.log('User disconnected:', socket.id);
```

## 🌍 Production Deployment

### Environment Variables for Production
```env
# Frontend (Netlify)
REACT_APP_SERVER_URL=https://your-backend-domain.com

# Backend (Railway/Render/Heroku)
FRONTEND_URL=https://your-frontend-domain.netlify.app
NODE_ENV=production
PORT=3001
```

### CORS for Production
```javascript
// Backend CORS for production
origin: [
  "https://your-frontend-domain.netlify.app",
  "http://localhost:3000" // For local development
]
```

## 📊 Network Monitoring

### Docker Network Commands
```bash
# List networks
docker network ls

# Inspect network
docker network inspect game-network

# Check container connectivity
docker exec -it number-game-frontend ping backend
```

### Port Monitoring
```bash
# Check if ports are open
netstat -an | findstr :3000
netstat -an | findstr :3001

# Test connectivity
curl http://localhost:3001/health
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in backend
   - Verify FRONTEND_URL environment variable

2. **Socket Connection Failed**
   - Check if backend is running
   - Verify serverUrl in frontend config
   - Check network connectivity

3. **Port Already in Use**
   - Change ports in docker-compose.yml
   - Kill processes using the ports

4. **Container Communication Issues**
   - Check Docker network configuration
   - Verify container names and dependencies

### Debug Commands
```bash
# Check container logs
docker-compose logs frontend
docker-compose logs backend

# Check network connectivity
docker exec -it number-game-frontend curl http://backend:3001/health

# Restart services
docker-compose restart
```

## 📝 Summary

The routing between frontend and backend is established through:

1. **HTTP REST API** on port 3001 for health checks and status
2. **WebSocket (Socket.IO)** on port 3001 for real-time communication
3. **Docker network** for container communication
4. **CORS configuration** for cross-origin requests
5. **Environment variables** for flexible deployment

This setup ensures reliable communication between the React frontend and Node.js backend in both development and production environments.

