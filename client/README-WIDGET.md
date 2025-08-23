# Reflect Widget System

A CDN-based widget system for collecting customer feedback across different websites and applications.

## Features

- **Multiple Feedback Types**: NPS, CSAT, CES surveys
- **Theme Support**: Light and dark themes
- **Positioning**: Bottom-right (default), bottom-left, top-right, top-left, center
- **Customizable**: Colors, sizes, and behavior via configuration
- **CDN Ready**: Single JavaScript bundle for easy deployment

## Quick Start

### 1. Include the Widget

Add this to your HTML page:

```html
<script>
  window.reflectConfig = {
    key: "your_widget_key_here",
    theme: "light", // or "dark"
    position: "bottom-right" // optional, defaults to bottom-right
  };
</script>
<script async src="https://your-cdn.com/widget.js"></script>
```

### 2. Configuration Options

```javascript
window.reflectConfig = {
  key: "widget_abc123", // Required: Your widget's public key
  theme: "light",        // Optional: "light" or "dark" (default: "light")
  position: "bottom-right" // Optional: "bottom-right", "bottom-left", "top-right", "top-left", "center" (default: "bottom-right")
};
```

## Development

### Building the Widget

```bash
# Build for production (CDN)
npm run build:widget

# Development with hot reload
npm run dev:widget
```

### Build Output

The widget builds to `client/dist-widget/widget.js` - a single, optimized JavaScript file ready for CDN deployment.

### Testing Locally

1. Build the widget: `npm run build:widget`
2. Open `client/widget-test.html` in your browser
3. Test different configurations using the test buttons

## Architecture

### Widget Structure

- **Launcher Button**: Floating button that opens the feedback widget
- **Widget Container**: Main feedback interface with theme support
- **Feedback Types**: NPS, CSAT, and CES survey options

### Theme System

- **Light Theme**: White background, dark text, blue accents
- **Dark Theme**: Dark background, light text, blue accents
- **Custom Colors**: Override via backend configuration

### Positioning

- **Bottom Right**: Traditional floating widget (default)
- **Bottom Left**: Left-side floating widget
- **Top Right**: Top-right corner widget
- **Top Left**: Top-left corner widget
- **Center**: Modal overlay in center of page

## API Integration

### Widget Configuration

The widget fetches its configuration from:
```
GET /api/v1/public/widgets/{publicKey}
```

### Feedback Submission

Feedback is submitted to:
```
POST /api/v1/feedback
```

## Deployment

### CDN Setup

1. Build the widget: `npm run build:widget`
2. Upload `dist-widget/widget.js` to your CDN
3. Update the script src in customer implementations

### Environment Variables

- **Development**: `http://localhost:8000` (API)
- **Production**: `https://api.yourdomain.com` (API)

## Customization

### Adding New Feedback Types

1. Create new feedback component in the widget
2. Add to the widget content generation
3. Handle submission logic

### Theme Customization

Themes are defined in the `getThemeStyles()` function and can be extended with:
- Custom color palettes
- Typography options
- Layout variations

## Browser Support

- **Target**: ES2015+ (ES6)
- **Browsers**: Chrome 51+, Firefox 54+, Safari 10+, Edge 14+
- **Mobile**: iOS Safari 10+, Chrome Mobile 51+

## Troubleshooting

### Common Issues

1. **Widget not loading**: Check `window.reflectConfig.key` is set
2. **API errors**: Verify backend is running and accessible
3. **Styling conflicts**: Widget uses scoped CSS to avoid conflicts

### Debug Mode

Open browser console to see widget logs and any error messages.

## Future Enhancements

- [ ] Real-time theme updates
- [ ] Tab-style left/right widgets
- [ ] Custom CSS support
- [ ] Advanced targeting rules
- [ ] A/B testing support
- [ ] Analytics integration

## Support

For issues or questions about the widget system, check the main project documentation or create an issue in the repository.
