#!/bin/bash

# Development startup script for Number Guessing Game
echo "🚀 Starting Number Guessing Game in development mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Install dependencies for backend
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install dependencies for frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Start the services
echo "🚀 Starting services with Docker Compose..."
docker-compose up --build

echo "✅ Services started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "📊 Health check: http://localhost:3001/health"
