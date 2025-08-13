# Reflect Widget - CDN Integration Guide

## Overview

The Reflect Widget is a modern, embeddable feedback collection tool that can be easily integrated into any website via CDN. It supports multiple feedback types including NPS, CSAT, CES surveys, and general feedback collection.

## Features

- 🎨 **Highly Customizable**: Themes, colors, positioning, and content
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- ⚡ **Lightweight**: ~15KB gzipped
- 🔒 **Secure**: CORS-enabled, CSP-friendly
- 🎯 **Smart Targeting**: URL, device, and behavior-based rules
- 📊 **Multiple Survey Types**: NPS, CSAT, CES, and custom feedback forms

## Quick Integration

### 1. Basic Setup

Add this code just before the closing `</body>` tag of your website:

```html
<script>
  window.reflectConfig = {
    key: 'your_widget_key_here',
  }
</script>
<script async src="https://cdn.reflect.com/widget.js"></script>
```

### 2. Development Setup

For local development, use:

```html
<script>
  window.reflectConfig = {
    key: 'your_widget_key_here',
  }
</script>
<script async src="http://localhost:5173/widget.js"></script>
```

## Configuration Options

### Basic Configuration

```javascript
window.reflectConfig = {
  key: 'widget_abc123',

  // Optional: Override widget behavior
  autoInit: true, // Auto-initialize widget (default: true)
  debug: false, // Enable debug logging (default: false)
  position: 'bottom_right', // Override position
}
```

### Advanced Configuration

The widget automatically fetches its configuration from your Reflect dashboard, but you can override certain behaviors:

```javascript
window.reflectConfig = {
  key: 'widget_abc123',

  // Custom event handlers
  onLoad: function (widget) {
    console.log('Widget loaded:', widget)
  },

  onSubmit: function (data) {
    console.log('Feedback submitted:', data)
  },

  onClose: function () {
    console.log('Widget closed')
  },
}
```

## Widget API

Once loaded, the widget exposes a global API for programmatic control:

```javascript
// Open the widget
window.reflectWidget.open()

// Close the widget
window.reflectWidget.close()

// Toggle widget visibility
window.reflectWidget.toggle()

// Check if widget is open
if (window.reflectWidget.isOpen()) {
  console.log('Widget is currently open')
}
```

## Customization

### Themes

The widget supports several built-in themes:

- **Default**: Clean and modern
- **Midnight**: Dark theme with purple accents
- **Minimal Light**: Simplified light theme
- **Minimal Dark**: Simplified dark theme

### Colors

Customize colors through your Reflect dashboard:

- Primary color (launcher and headers)
- Background color
- Text color
- Button colors
- Custom gradients

### Positioning

Available positions:

- `bottom_right` (default)
- `bottom_left`
- `top_right`
- `top_left`
- `center` (modal-style)

## Responsive Behavior

The widget automatically adapts to different screen sizes:

- **Desktop**: Appears as a fixed-position overlay
- **Mobile**: Expands to full-screen for better usability
- **Tablet**: Responsive sizing based on available space

## Performance

### Loading

- Widget script loads asynchronously (~15KB)
- Launcher appears immediately after configuration load
- Widget content loads on-demand when opened
- Images and assets are optimized and cached

### Best Practices

1. **Place script at end of body**: Ensures page content loads first
2. **Use async attribute**: Prevents blocking page rendering
3. **Preload critical CSS**: If using custom themes
4. **Test on mobile**: Ensure good user experience across devices

## Security

### Content Security Policy (CSP)

Add these directives to your CSP header:

```
script-src 'self' https://cdn.reflect.com;
connect-src 'self' https://api.reflect.com;
frame-src 'self' https://app.reflect.com;
```

### CORS

The widget is configured to work with proper CORS headers and respects your domain restrictions.

## Troubleshooting

### Widget Not Appearing

1. **Check console for errors**: Look for JavaScript errors
2. **Verify widget key**: Ensure the key is correct and widget is active
3. **Check CSP**: Ensure your Content Security Policy allows the widget
4. **Test on different browsers**: Rule out browser-specific issues

### Configuration Not Loading

1. **Network connectivity**: Check if API requests are successful
2. **Widget status**: Ensure widget is published and active
3. **Domain restrictions**: Verify your domain is allowed

### Common Issues

```javascript
// Issue: Widget appears but doesn't open
// Solution: Check z-index conflicts
document.getElementById('reflect-widget-launcher').style.zIndex = '999999'

// Issue: Widget appears on wrong pages
// Solution: Add conditional loading
if (window.location.pathname === '/specific-page') {
  // Load widget
}
```

## Development

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Widget available at: `http://localhost:5173/widget.js`

### Building for Production

```bash
# Build the widget
node build-widget.js

# Output files:
# - dist/widget.js (production/minified)
# - dist/widget-dev.js (development/readable)
```

### Testing

```bash
# Run widget tests
npm run test:widget

# Test in different browsers
npm run test:cross-browser

# Performance testing
npm run test:performance
```

## Migration Guide

### From v0.x to v1.x

1. Update CDN URL to latest version
2. Replace old configuration format:

```javascript
// Old format
window.reflectWidget = {
  apiKey: 'abc123',
  position: 'br',
}

// New format
window.reflectConfig = {
  key: 'widget_abc123',
  position: 'bottom_right',
}
```

## Examples

### E-commerce Site

```html
<!-- Only show on product pages -->
<script>
  if (window.location.pathname.includes('/product/')) {
    window.reflectConfig = {
      key: 'widget_ecommerce_123',
      position: 'bottom_left',
    }
  }
</script>
<script async src="https://cdn.reflect.com/widget.js"></script>
```

### SaaS Application

```html
<!-- Show for logged-in users only -->
<script>
  if (document.querySelector('[data-user-id]')) {
    window.reflectConfig = {
      key: 'widget_saas_456',
      onSubmit: function (data) {
        // Track feedback in analytics
        analytics.track('Feedback Submitted', data)
      },
    }
  }
</script>
<script async src="https://cdn.reflect.com/widget.js"></script>
```

### Blog/Content Site

```html
<!-- Show on article pages after 30 seconds -->
<script>
  if (document.querySelector('article')) {
    setTimeout(function () {
      window.reflectConfig = { key: 'widget_blog_789' }

      // Load widget script dynamically
      var script = document.createElement('script')
      script.src = 'https://cdn.reflect.com/widget.js'
      script.async = true
      document.body.appendChild(script)
    }, 30000)
  }
</script>
```

## Support

- 📧 Email: support@reflect.com
- 📖 Documentation: https://docs.reflect.com
- 💬 Community: https://community.reflect.com
- 🐛 Issues: https://github.com/reflect/widget/issues

## Changelog

### v1.0.0

- Initial CDN release
- Support for NPS, CSAT, CES surveys
- Responsive design
- Theme customization
- Advanced targeting rules

---

_Last updated: $(date)_
