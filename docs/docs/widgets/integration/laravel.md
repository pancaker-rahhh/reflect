---
sidebar_position: 10
---

# Laravel Integration

Integrate [Reflect](https://reflectfeedback.com) feedback widget into your Laravel application. The widget is hosted on a CDN and can be easily integrated with just a few lines of code.

## Quick Start

The simplest and recommended way to integrate the Reflect widget is to add it to your main layout file.

### Add to your Blade template

Add the following code inside the `<body>` tag of your main Blade template file (e.g., `resources/views/layouts/app.blade.php`), just before the closing `</body>` tag:

```php
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Laravel App</title>
  </head>
  <body>
    @yield('content')
    
    <!-- Reflect Feedback Widget -->
    <script>
      window.reflectConfig = { key: "YOUR_WIDGET_KEY", position: "bottom_right" };
    </script>
    <script async src="https://cdn.reflectfeedback.com/widgets/YOUR_WIDGET_KEY/widget.js"></script>
  </body>
</html>
```

:::tip
Replace `YOUR_WIDGET_KEY` with your actual widget key from the Reflect dashboard.
:::

That's it! The widget will now appear on all pages of your Laravel application that use this layout file.
