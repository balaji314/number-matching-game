#!/bin/bash

# Deployment script for Multiplayer Number Guessing Game

echo "🚀 Starting deployment process..."

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Check if Netlify CLI is installed
    if command -v netlify &> /dev/null; then
        echo "🌐 Deploying to Netlify..."
        netlify deploy --prod --dir=build
    else
        echo "⚠️  Netlify CLI not found. Please install it with: npm install -g netlify-cli"
        echo "📁 Build files are ready in the 'build' directory"
        echo "🌐 You can manually deploy to Netlify by uploading the 'build' folder"
    fi
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment process completed!"
