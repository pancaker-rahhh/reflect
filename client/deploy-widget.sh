#!/bin/bash

# Reflect Widget Deployment Script
# This script checks CDN server and provides deployment options

echo "🚀 Reflect Widget CDN Deployment Helper"

# Check if CDN server is running
echo "🔍 Checking CDN server status..."
CDN_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null || echo "000")

if [ "$CDN_HEALTH" != "200" ]; then
    echo "⚠️  CDN server not running."
    echo ""
    echo "📡 Start CDN server with:"
    echo "   npm run start:cdn"
    echo "   (or ./start-cdn.sh)"
    echo ""
    echo "💡 Note: The CDN server automatically builds widgets with CSS inlining on deployment"
    exit 0
fi

echo "✅ CDN server is running at http://localhost:3001"

# If a widget ID is provided as argument, deploy it directly
if [ $# -gt 0 ]; then
    WIDGET_ID="$1"
    VERSION="${2:-1}"
    
    echo "📡 Deploying widget ${WIDGET_ID} v${VERSION} to CDN..."
    echo "   (CSS inlining will be applied automatically)"
    
    # Create a basic configuration for testing
    DEPLOY_RESPONSE=$(curl -s -X POST http://localhost:3001/cdn/deploy \
        -H "Content-Type: application/json" \
        -d "{
            \"public_key\": \"${WIDGET_ID}\",
            \"version\": ${VERSION},
            \"widget_type\": \"FEEDBACK\",
            \"theme_configuration\": {
                \"primary\": \"#3b82f6\",
                \"background\": \"#ffffff\",
                \"text\": \"#1f2937\",
                \"show_branding\": true
            },
            \"configuration\": {
                \"content\": {
                    \"headerTitle\": \"Feedback\",
                    \"mainQuestion\": \"How can we improve?\",
                    \"submitButtonText\": \"Submit Feedback\",
                    \"thankYouTitle\": \"Thank you!\",
                    \"thankYouMessage\": \"Your feedback helps us improve.\"
                },
                \"modules\": {
                    \"feedback\": true,
                    \"reviews\": false,
                    \"bugReporting\": false,
                    \"featureRequests\": false
                }
            },
            \"position\": \"bottom-right\"
        }")
    
    if echo "$DEPLOY_RESPONSE" | grep -q "success.*true"; then
        CDN_URL=$(echo "$DEPLOY_RESPONSE" | grep -o '"cdn_url":"[^"]*"' | cut -d'"' -f4)
        echo "✅ Widget deployed successfully with CSS inlining!"
        echo "🌐 CDN URL: ${CDN_URL}"
        echo ""
        echo "📝 Test your widget on any external site:"
        echo '<script>'
        echo "  window.reflectConfig = {"
        echo "    key: \"${WIDGET_ID}\","
        echo '    theme: "light",'
        echo '    position: "bottom-right"'
        echo "  };"
        echo '</script>'
        echo "<script async src=\"${CDN_URL}\"></script>"
        echo ""
        echo "🎨 The widget will be fully styled on any external website!"
    else
        echo "❌ Widget deployment failed!"
        echo "Response: $DEPLOY_RESPONSE"
        exit 1
    fi
else
    echo ""
    echo "🎯 Widget deployment options:"
    echo ""
    echo "📋 Quick deploy a test widget:"
    echo "   ./deploy-widget.sh <widget_id> [version]"
    echo "   Example: ./deploy-widget.sh my-test-widget 1"
    echo ""
    echo "📋 Deploy via API (for production use):"
    echo "   POST http://localhost:3001/cdn/deploy"
    echo "   Content-Type: application/json"
    echo "   Body: {widget configuration JSON}"
    echo ""
    echo "🌐 CDN Endpoints:"
    echo "   • Health: http://localhost:3001/health"
    echo "   • Deploy: http://localhost:3001/cdn/deploy"
    echo "   • Widget: http://localhost:3001/cdn/widgets/{id}/v{version}/widget.js"
    echo ""
    echo "💡 All widgets deployed through the CDN automatically include CSS inlining"
    echo "   for perfect styling on external websites!"
fi
