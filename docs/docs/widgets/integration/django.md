---
sidebar_position: 11
---

# Django Integration

Integrate [Reflect](https://reflectfeedback.com) feedback widget into your Django application. The widget is hosted on a CDN and can be easily integrated with just a few lines of code.

## Quick Start

The simplest and recommended way to integrate the Reflect widget is to add it to your main template file.

### Add to your base template

Add the following code inside the `<body>` tag of your base template file (e.g., `templates/base.html`), just before the closing `</body>` tag:

```html
{% load static %}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Django App</title>
  </head>
  <body>
    {% block content %}{% endblock %}
    
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

That's it! The widget will now appear on all pages of your Django application that extend this base template.
