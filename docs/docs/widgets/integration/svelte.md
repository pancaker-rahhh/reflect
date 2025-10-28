---
sidebar_position: 6
---

# Svelte Integration

Integrate Reflect feedback widget into your Svelte or SvelteKit application. The widget is hosted on a CDN and can be easily integrated with just a few lines of code.

## Quick Start

The simplest way to integrate the Reflect widget is to add it to your main `index.html` file.

### Add to public/index.html (Svelte)

Add the following code inside the `<body>` tag of your `public/index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width,initial-scale=1'>
  <title>Svelte App</title>
  <link rel='stylesheet' href='/build/bundle.css'>
</head>
<body>
  <script defer src='/build/bundle.js'></script>
  
  <!-- Reflect Widget -->
  <script>
    window.reflectConfig = { key: "widget_eee5d255e1bc48d8", position: "bottom_right" };
  </script>
  <script async src="https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js"></script>
</body>
</html>
```

### Add to src/app.html (SvelteKit)

For SvelteKit, add the widget to your `src/app.html` file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
    
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

That's it! The widget will now appear on all pages of your Svelte application.

## Next Steps

- [Widget Configuration](/docs/widgets/configuration/basic)
- [Widget Types](/docs/widgets/types/feedback)
