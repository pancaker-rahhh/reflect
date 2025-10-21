---
sidebar_position: 2
---

# Quick Start

Get your first feedback widget running in under 5 minutes.

## Prerequisites

- A web page where you want to collect feedback
- Basic knowledge of HTML

## Step 1: Get Your Widget Key

First, you need to create a widget and get your unique widget key. You can do this through the Reflect dashboard or API.

For this quick start, we'll assume you have a widget key: `widget_abc123`

## Step 2: Add the Widget to Your Site

Add this code snippet to your HTML page, right before the closing `</body>` tag:

```html
<!-- Configure the widget -->
<script>
  window.reflectConfig = {
    key: "widget_abc123",
    position: "bottom_right"
  };
</script>

<!-- Load the widget -->
<script async src="https://cdn.reflect.app/widgets/widget_abc123/widget.js"></script>
```

## Step 3: Test It Out

1. Open your web page in a browser
2. You should see a feedback button appear in the bottom right corner
3. Click it to open the feedback form
4. Submit some test feedback

That's it! You now have a working feedback widget.

## Configuration Options

You can customize the widget behavior by modifying the `reflectConfig` object:

```javascript
window.reflectConfig = {
  key: "widget_abc123",           // Required: Your widget key
  position: "bottom_right",        // Optional: Button position
  offset: { x: 20, y: 20 },       // Optional: Offset from edge (pixels)
  autoShow: false,                 // Optional: Show automatically on page load
  showAfter: 5000,                 // Optional: Delay before showing (ms)
  hideOnSubmit: true,              // Optional: Hide after submission
  debug: false                     // Optional: Enable debug logging
};
```

### Position Options

- `bottom_right` (default)
- `bottom_left`
- `top_right`
- `top_left`
- `center_right`
- `center_left`

## Next Steps

Now that you have a basic widget working, explore:

- [Framework-specific integrations](/docs/widgets/integration/react) (React, Vue, Angular, etc.)
- [Widget configuration options](/docs/widgets/configuration/basic)
- [Different widget types](/docs/widgets/types/feedback)
- [Styling and theming](/docs/widgets/configuration/styling)

## Troubleshooting

### Widget not appearing?

1. Check browser console for errors
2. Verify your widget key is correct
3. Make sure the script tags are in the correct order
4. Check that the widget URL is accessible

### Need help?

- Check our [FAQ](/docs/getting-started/faq)
- Review the [Widget Architecture](/docs/widgets/architecture)
- Open an issue on [GitHub](https://github.com/pancaker-rahhh/reflect/issues)
