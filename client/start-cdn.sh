#!/bin/bash

echo "🚀 Starting Reflect Widget CDN Server with CSS Inlining Support..."

cd "$(dirname "$0")/cdn-server"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing CDN server dependencies..."
    npm install
fi

echo ""
echo "🌐 Starting CDN server on http://localhost:3001"
echo "💡 All widgets deployed through this CDN will have automatic CSS inlining"
echo "🎨 This ensures perfect styling on any external website"
echo ""
echo "📋 Quick commands after server starts:"
echo "   • Deploy test widget: ./deploy-widget.sh test-widget"
echo "   • Check health: curl http://localhost:3001/health"
echo "   • Test page: open test-cdn-deployment.html"
echo ""

# Start the CDN server
npm start