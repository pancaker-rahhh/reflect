---
sidebar_position: 2
---

# React Integration

Integrate Reflect feedback widget into your React application. The widget is hosted on a CDN and can be easily integrated with just a few lines of code.

## Quick Start

The simplest and recommended way to integrate the Reflect widget is to add it to your `index.html` file.

### Add to public/index.html

Add the following code inside the `<body>` tag of your `public/index.html` file, just before the closing `</body>` tag:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    
    <!-- Reflect Feedback Widget -->
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

That's it! The widget will now appear on all pages of your React application.

## Alternative Methods

### Method 1: Using useEffect Hook

If you prefer to load the widget dynamically from a component:

```tsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Configure widget
    window.reflectConfig = {
      key: "widget_eee5d255e1bc48d8",
      position: "bottom_right"
    };

    // Load widget script
    const script = document.createElement('script');
    script.src = "https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js";
    script.async = true;
    document.body.appendChild(script);

    // Cleanup
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="app">
      <h1>My React App</h1>
    </div>
  );
}

export default App;
```

### Method 2: Custom Hook

Create a reusable hook for more control:

```tsx
// hooks/useReflectWidget.ts
import { useEffect } from 'react';

interface ReflectConfig {
  key: string;
  position?: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';
}

export function useReflectWidget(config: ReflectConfig) {
  useEffect(() => {
    window.reflectConfig = config;

    const script = document.createElement('script');
    script.src = `https://cdn.reflectfeedback.com/widgets/${config.key}/widget.js`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [config.key]);
}
```

Use it in your component:

```tsx
import { useReflectWidget } from './hooks/useReflectWidget';

function App() {
  useReflectWidget({
    key: "widget_eee5d255e1bc48d8",
    position: "bottom_right"
  });

  return <div>Your app content</div>;
}
```

### Method 3: Component Wrapper

```tsx
// components/ReflectWidget.tsx
import { useEffect } from 'react';

interface Props {
  widgetKey: string;
  position?: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';
}

export function ReflectWidget({ widgetKey, position = 'bottom_right' }: Props) {
  useEffect(() => {
    window.reflectConfig = { key: widgetKey, position };

    const script = document.createElement('script');
    script.src = `https://cdn.reflectfeedback.com/widgets/${widgetKey}/widget.js`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [widgetKey, position]);

  return null;
}
```

Usage:

```tsx
import { ReflectWidget } from './components/ReflectWidget';

function App() {
  return (
    <>
      <ReflectWidget widgetKey="widget_eee5d255e1bc48d8" position="bottom_right" />
      <div>Your app content</div>
    </>
  );
}
```

## Configuration Options

The `reflectConfig` object supports the following options:

- **key** (required): Your widget key (e.g., `"widget_eee5d255e1bc48d8"`)
- **position** (optional): Widget position - `"bottom_right"`, `"bottom_left"`, `"top_right"`, or `"top_left"` (default: `"bottom_right"`)

## Next Steps

- [Widget Configuration](/docs/widgets/configuration/basic)
- [Widget Types](/docs/widgets/types/feedback)
