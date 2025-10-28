---
sidebar_position: 4
---

# Angular Integration

Integrate Reflect feedback widget into your Angular application. The widget is hosted on a CDN and can be easily integrated with just a few lines of code.

## Quick Start

The simplest way to integrate the Reflect widget is to add it to your `index.html` file.

### Add to src/index.html

Add the following code inside the `<body>` tag of your `src/index.html` file:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your Angular App</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>

  <!-- Reflect Widget -->
  <script>
    window.reflectConfig = { key: "widget_eee5d255e1bc48d8", position: "bottom_right" };
  </script>
  <script async src="https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js"></script>
</body>
</html>
```

:::tip
Replace `widget_eee5d255e1bc48d8` with your actual widget key from the Reflect dashboard.
:::

That's it! The widget will now appear on all pages of your Angular application.
