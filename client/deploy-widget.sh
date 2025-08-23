#!/bin/bash

# Reflect Widget Deployment Script
# This script builds and prepares the widget for CDN deployment

echo "🚀 Building Reflect Widget for CDN deployment..."

# Build the widget
npm run build:widget

if [ $? -eq 0 ]; then
    echo "✅ Widget built successfully!"
    echo ""
    echo "📁 Build output: dist-widget/widget.js"
    echo "📊 File size: $(du -h dist-widget/widget.js | cut -f1)"
    echo ""
    echo "🌐 Next steps for CDN deployment:"
    echo "1. Upload dist-widget/widget.js to your CDN"
    echo "2. Update customer implementations with new CDN URL"
    echo "3. Test the widget on customer sites"
    echo ""
    echo "📝 Example customer implementation:"
    echo '<script>'
    echo '  window.reflectConfig = {'
    echo '    key: "your_widget_key_here",'
    echo '    theme: "light"'
    echo '  };'
    echo '</script>'
    echo '<script async src="https://your-cdn.com/widget.js"></script>'
    echo ""
    echo "🎯 Widget is ready for deployment!"
else
    echo "❌ Widget build failed!"
    exit 1
fi
