---
sidebar_position: 1
---

# Vanilla JavaScript Integration

Integrate Reflect widgets into any HTML page without any framework dependencies.

## Basic Setup

Add these two script tags to your HTML, preferably before the closing `</body>` tag:

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

## Full Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website with Reflect</title>
</head>
<body>
  <h1>Welcome to my website</h1>
  <p>Your content here...</p>

  <!-- Reflect Widget Configuration -->
  <script>
    window.reflectConfig = {
      key: "widget_abc123",
      position: "bottom_right",
      offset: { x: 20, y: 20 }
    };
  </script>
  <script async src="https://cdn.reflect.app/widgets/widget_abc123/widget.js"></script>
</body>
</html>
```

## Programmatic Control

You can control the widget programmatically using the global `Reflect` API:

```javascript
// Wait for widget to load
window.addEventListener('reflectLoaded', function() {
  // Show the widget
  window.Reflect.show();
  
  // Hide the widget
  window.Reflect.hide();
  
  // Open the feedback form
  window.Reflect.open();
  
  // Close the feedback form
  window.Reflect.close();
  
  // Set user context
  window.Reflect.identify({
    userId: '12345',
    email: 'user@example.com',
    name: 'John Doe'
  });
});
```

## Dynamic Widget Loading

Load the widget dynamically using JavaScript:

```javascript
function loadReflectWidget(widgetKey) {
  // Set configuration
  window.reflectConfig = {
    key: widgetKey,
    position: "bottom_right"
  };
  
  // Create script element
  const script = document.createElement('script');
  script.src = `https://cdn.reflect.app/widgets/${widgetKey}/widget.js`;
  script.async = true;
  
  // Add to page
  document.body.appendChild(script);
}

// Usage
loadReflectWidget('widget_abc123');
```

## Configuration Options

See [Widget Configuration](/docs/widgets/configuration/basic) for all available options.
