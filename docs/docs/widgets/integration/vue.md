---
sidebar_position: 3
---

# Vue Integration

Integrate [Reflect](https://reflectfeedback.com) feedback widget into your Vue 3 or Vue 2 application. The widget is hosted on a CDN and can be easily integrated with just a few lines of code.

## Quick Start

The simplest way to integrate the Reflect widget is to add it to your main `index.html` file.

### Add to public/index.html

Add the following code inside the `<body>` tag of your `public/index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue App</title>
  </head>
  <body>
    <div id="app"></div>
    
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

That's it! The widget will now appear on all pages of your Vue application.
