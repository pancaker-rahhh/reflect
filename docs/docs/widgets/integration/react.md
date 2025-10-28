---
sidebar_position: 2
---

# React Integration

Integrate Reflect widgets into your React application with hooks and components.

## Installation

No additional packages needed! Just use the widget script.

## Method 1: Using useEffect Hook

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
      document.body.removeChild(script);
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

## Method 2: Custom Hook

Create a reusable hook:

```tsx
// hooks/useReflectWidget.ts
import { useEffect } from 'react';

interface ReflectConfig {
  key: string;
  position?: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';
  offset?: { x: number; y: number };
  autoShow?: boolean;
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

## Method 3: Component Wrapper

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

## TypeScript Support

Add type declarations:

```typescript
// types/reflect.d.ts
interface ReflectConfig {
  key: string;
  position?: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';
  offset?: { x: number; y: number };
  autoShow?: boolean;
  showAfter?: number;
  hideOnSubmit?: boolean;
  debug?: boolean;
}

interface ReflectAPI {
  show(): void;
  hide(): void;
  open(): void;
  close(): void;
  identify(user: { userId: string; email?: string; name?: string }): void;
}

interface Window {
  reflectConfig: ReflectConfig;
  Reflect: ReflectAPI;
}
```

## Next Steps

- [Widget Configuration](/docs/widgets/configuration/basic)
- [Widget Types](/docs/widgets/types/feedback)
