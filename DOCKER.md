# 🐳 Docker Setup for Number Guessing Game

This document explains how to run the Number Guessing Game using Docker and Docker Compose.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually comes with Docker Desktop)
- Git (to clone the repository)

## 🚀 Quick Start

### 1. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🏗️ Docker Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (Port 3000)   │◄──►│   (Port 3001)   │
│                 │    │                 │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                 │
         ┌─────────────────┐
         │  Docker Network │
         │  (game-network) │
         └─────────────────┘
```

## 📁 Docker Files Structure

```
project-root/
├── docker-compose.yml          # Development setup
├── docker-compose.prod.yml     # Production setup
├── frontend/
│   ├── Dockerfile             # Frontend container
│   └── .dockerignore          # Exclude files
└── backend/
    ├── Dockerfile             # Backend container
    └── .dockerignore          # Exclude files
```

## 🔧 Docker Commands

### Development

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build
```

### Production

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up --build

# Start in background
docker-compose -f docker-compose.prod.yml up -d --build
```

### Individual Services

```bash
# Start only backend
docker-compose up backend

# Start only frontend
docker-compose up frontend

# Rebuild specific service
docker-compose build frontend
docker-compose build backend
```

## 🌐 Port Configuration

| Service | Container Port | Host Port | Description |
|---------|----------------|-----------|-------------|
| Frontend | 3000 | 3000 | React application |
| Backend | 3001 | 3001 | Node.js API server |

## 🔄 Environment Variables

### Frontend Container
- `NODE_ENV=production`
- `REACT_APP_SERVER_URL=http://localhost:3001`

### Backend Container
- `NODE_ENV=production`
- `PORT=3001`
- `FRONTEND_URL=http://localhost:3000`

## 📊 Health Checks

The backend service includes health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   
   # Kill the process or change ports in docker-compose.yml
   ```

2. **Container Won't Start**
   ```bash
   # Check logs
   docker-compose logs backend
   docker-compose logs frontend
   
   # Rebuild containers
   docker-compose down
   docker-compose up --build
   ```

3. **Network Issues**
   ```bash
   # Check network
   docker network ls
   docker network inspect game-network
   ```

### Debug Commands

```bash
# Enter running container
docker exec -it number-game-backend sh
docker exec -it number-game-frontend sh

# View container info
docker ps
docker inspect number-game-backend

# Check container logs
docker logs number-game-backend
docker logs number-game-frontend
```

## 🔒 Security Considerations

- Containers run as non-root users
- Network isolation with custom bridge network
- No sensitive data in container images
- Health checks for service monitoring

## 📈 Performance Optimization

### Development
- Volume mounts for hot reloading
- Shared node_modules volumes
- Fast rebuilds with cached layers

### Production
- Multi-stage builds (can be added)
- Optimized base images
- Health checks and restart policies

## 🚀 Deployment

### Local Development
```bash
docker-compose up --build
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Scaling (if needed)
```bash
# Scale backend instances
docker-compose up --scale backend=3
```

## 📝 Notes

- Frontend depends on backend (health check)
- Backend starts first, then frontend
- Services restart automatically unless stopped manually
- Network allows inter-service communication
- Volumes persist data between container restarts

## 🔗 Related Documentation

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Main README](./README.md)
