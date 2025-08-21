# Troubleshooting Guide - Frontend Backend Connection Issues

## 🔍 Common Issues and Solutions

### 1. **Frontend Can't Connect to Backend**

#### **Symptoms:**
- Frontend shows "Disconnected from server"
- Console shows connection errors
- Socket.IO connection fails

#### **Solutions:**

**A. Check if Backend is Running:**
```bash
# Check if backend is listening on port 3001
curl http://localhost:3001/health

# Check Docker containers
docker-compose ps
```

**B. Check Environment Variables:**
```bash
# Frontend .env file should contain:
REACT_APP_SERVER_URL=http://localhost:3001
NODE_ENV=development

# For Docker, backend URL should be:
REACT_APP_SERVER_URL=http://backend:3001
```

**C. Check CORS Configuration:**
- Backend should allow frontend origin
- Check browser console for CORS errors

### 2. **Docker Container Communication Issues**

#### **Symptoms:**
- Containers start but can't communicate
- Frontend shows connection errors in Docker

#### **Solutions:**

**A. Use Container Names in Docker:**
```yaml
# In docker-compose.yml
environment:
  - REACT_APP_SERVER_URL=http://backend:3001
```

**B. Check Network Configuration:**
```bash
# List Docker networks
docker network ls

# Inspect the game network
docker network inspect game_game-network
```

**C. Check Container Logs:**
```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend
```

### 3. **Port Conflicts**

#### **Symptoms:**
- "Port already in use" errors
- Services won't start

#### **Solutions:**

**A. Check Port Usage:**
```bash
# Windows
netstat -an | findstr :3000
netstat -an | findstr :3001

# Linux/Mac
lsof -i :3000
lsof -i :3001
```

**B. Kill Conflicting Processes:**
```bash
# Find and kill process using port 3000
npx kill-port 3000

# Find and kill process using port 3001
npx kill-port 3001
```

### 4. **Environment Variable Issues**

#### **Symptoms:**
- Wrong server URLs
- Configuration not loading

#### **Solutions:**

**A. Check .env Files:**
```bash
# Frontend .env
cat frontend/.env

# Backend config.env
cat backend/config.env
```

**B. Restart Services After Changes:**
```bash
# Stop containers
docker-compose down

# Rebuild and start
docker-compose up --build
```

### 5. **Socket.IO Connection Issues**

#### **Symptoms:**
- Real-time features not working
- Game updates not syncing

#### **Solutions:**

**A. Check Socket.IO Configuration:**
- Verify serverUrl in frontend config
- Check CORS settings in backend
- Ensure WebSocket transport is enabled

**B. Browser Console Debugging:**
```javascript
// In browser console
console.log('Server URL:', window.serverUrl);
console.log('Socket connected:', socket.connected);
```

## 🛠️ Debug Commands

### **Check Service Status:**
```bash
# Docker containers
docker-compose ps

# Service logs
docker-compose logs backend
docker-compose logs frontend

# Health checks
curl http://localhost:3001/health
curl http://localhost:3001/api/game-status
```

### **Network Debugging:**
```bash
# Test backend connectivity
curl -v http://localhost:3001/health

# Test frontend connectivity
curl -v http://localhost:3000

# Check Docker network
docker network inspect game_game-network
```

### **Environment Debugging:**
```bash
# Check environment variables in containers
docker-compose exec backend env | grep NODE_ENV
docker-compose exec frontend env | grep REACT_APP
```

## 🔧 Quick Fixes

### **Reset Everything:**
```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild everything
docker-compose up --build
```

### **Manual Testing:**
```bash
# Test backend manually
cd backend
npm install
npm start

# Test frontend manually (in new terminal)
cd frontend
npm install
npm start
```

### **Check Dependencies:**
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd frontend
npm install
```

## 📞 Getting Help

If you're still having issues:

1. **Check the logs:** `docker-compose logs`
2. **Verify environment:** Check all .env files
3. **Test manually:** Run services without Docker first
4. **Check network:** Ensure ports are available
5. **Update dependencies:** Run `npm install` in both directories

## 🎯 Common Solutions

| Issue | Solution |
|-------|----------|
| Frontend can't connect | Check REACT_APP_SERVER_URL in .env |
| CORS errors | Verify CORS configuration in backend |
| Port conflicts | Kill processes using ports 3000/3001 |
| Docker networking | Use container names instead of localhost |
| Environment variables | Restart containers after changes |
