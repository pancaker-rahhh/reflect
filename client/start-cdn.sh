#!/bin/bash

echo "🚀 Starting Reflect Widget CDN Server..."

cd "$(dirname "$0")/cdn-server"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the CDN server
echo "🌐 Starting server on http://localhost:3001"
npm start