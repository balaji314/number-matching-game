@echo off
echo 🚀 Starting Number Guessing Game in development mode...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Install dependencies for backend
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

REM Install dependencies for frontend
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Start the services
echo 🚀 Starting services with Docker Compose...
docker-compose up --build

echo ✅ Services started!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:3001
echo 📊 Health check: http://localhost:3001/health
pause
