#!/bin/bash

echo "🚀 Starting Travel Website React App..."
echo "📁 Project Directory: $(pwd)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🌐 Starting development server..."
echo "📱 The website will open at: http://localhost:3000"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

npm start 