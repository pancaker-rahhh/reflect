---
sidebar_position: 1
id: installation
---

# Widget Installation Guide

Learn how to integrate the Reflect feedback widget into your website or application.

## Quick Start

Get up and running in under 5 minutes with our simple script tag. No complex setup required.

### 1. Get Your Widget Key/ Widget Script

1. Navigate to the **Widgets** page in your dashboard
2. Select the widget you wish to add to your website
3. Create a widget using **Create Widget** button
4. Click on the three dots, and click on 'Get Code'
5. Copy the widget script

### 2. Add the Script to Your Website

Add this code snippet to your HTML file, just before the closing `</body>` tag:

```html
<!-- Reflect Feedback Widget -->
<script>
  window.reflectConfig = { 
    key: "widget_eee5d255e1bc48d8", 
    position: "bottom_right" 
  };
</script>
<script async src="https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js"></script>
```

:::warning Important
Remember to replace `widget_eee5d255e1bc48d8` with your actual Widget Key from Step 1.
:::

### 3. Test Your Installation

1. Open your website in a browser
2. The feedback widget should appear in the bottom-right corner (or your configured position)
3. Click the widget to verify it's working correctly

That's it! Your feedback widget is now live on your site.

## Configuration Options

The `reflectConfig` object accepts the following options:

### Basic Configuration

```javascript
window.reflectConfig = {
  key: "widget_eee5d255e1bc48d8",        // Required: Your widget key
  position: "bottom_right",              // Optional: Widget position
};
```

### Position Options

Control where the widget appears on your page:

- `bottom_right` - Bottom right corner (default)
- `bottom_left` - Bottom left corner
- `top_right` - Top right corner
- `top_left` - Top left corner

Example:

```html
<script>
  window.reflectConfig = { 
    key: "widget_eee5d255e1bc48d8", 
    position: "bottom_left"  // Widget appears in bottom-left
  };
</script>
<script async src="https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js"></script>
```

## Framework-Specific Guides

For detailed integration instructions for your specific framework, check out our framework guides:

- [React Integration](/docs/widgets/integration/react)
- [Vue.js Integration](/docs/widgets/integration/vue)
- [Angular Integration](/docs/widgets/integration/angular)
- [Next.js Integration](/docs/widgets/integration/next-js)
- [Svelte Integration](/docs/widgets/integration/svelte)
- [WordPress Integration](/docs/widgets/integration/wordpress)

## Troubleshooting

### Widget Not Appearing

1. **Verify your widget key**: Ensure you've replaced `YOUR_WIDGET_ID` with your actual widget key
2. **Check script placement**: The script should be placed before the closing `</body>` tag
3. **Clear your cache**: Try clearing your browser cache or opening in an incognito window
4. **Check the console**: Open browser developer tools (F12) and look for JavaScript errors
5. **Verify widget status**: Ensure your widget is active in the Reflect dashboard

### Widget Not Responding

1. **JavaScript enabled**: Ensure JavaScript is enabled in your browser
2. **Check for conflicts**: Verify no other scripts are preventing the widget from loading
3. **Test different browser**: Try on a different browser or device
4. **Check network**: Look for network errors in the browser developer tools

### Console Errors

If you see errors in the browser console:

1. Open developer tools (F12)
2. Go to the **Console** tab
3. Look for any red error messages
4. Common errors include:
   - Incorrect widget key
   - Network connectivity issues
   - JavaScript conflicts with other scripts

## Best Practices

### Do's

- Always use the `async` attribute on the script tag for better performance
- Place the script before the closing `</body>` tag
- Test the widget on multiple devices and browsers

### Don'ts
- Don't modify the widget script URL

## Next Steps

- Learn about [Widget Configuration](/docs/widgets/configuration/basic)
- Explore different [Widget Types](/docs/widgets/types/feedback)
