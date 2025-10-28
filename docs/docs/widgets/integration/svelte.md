---
sidebar_position: 6
---

# Svelte Integration

# Svelte Integration

Integration guide for Svelte 3+ applications.

## Method 1: Using onMount in App.svelte

Add the widget loading logic to your main App component:

```svelte
<!-- src/App.svelte -->
<script>
  import { onMount } from 'svelte';

  onMount(() => {
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
  });
</script>

<main>
  <h1>Welcome to Svelte</h1>
  <p>Your content here...</p>
</main>
```

## Method 2: Svelte Component

Create a dedicated component for the widget:

```svelte
<!-- src/lib/ReflectWidget.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';

  export let widgetKey = "widget_eee5d255e1bc48d8";
  export let position = "bottom_right";

  let scriptElement;

  onMount(() => {
    // Set configuration
    window.reflectConfig = {
      key: widgetKey,
      position: position
    };

    // Create and load script
    scriptElement = document.createElement('script');
    scriptElement.src = `https://cdn.reflectfeedback.com/widgets/${widgetKey}/widget.js`;
    scriptElement.async = true;
    document.body.appendChild(scriptElement);
  });

  onDestroy(() => {
    if (scriptElement && document.body.contains(scriptElement)) {
      document.body.removeChild(scriptElement);
    }
  });
</script>
```

Use it in your app:

```svelte
<!-- src/App.svelte -->
<script>
  import ReflectWidget from './lib/ReflectWidget.svelte';
</script>

<main>
  <h1>My Svelte App</h1>
  <ReflectWidget widgetKey="widget_eee5d255e1bc48d8" position="bottom_right" />
</main>
```

## Method 3: Svelte Store for Configuration

Use a Svelte store to manage widget configuration:

```javascript
// src/stores/reflect.js
import { writable } from 'svelte/store';

export const reflectConfig = writable({
  key: "widget_eee5d255e1bc48d8",
  position: "bottom_right"
});
```

```svelte
<!-- src/lib/ReflectWidget.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { reflectConfig } from '../stores/reflect.js';

  let scriptElement;
  let currentConfig;

  const unsubscribe = reflectConfig.subscribe(config => {
    currentConfig = config;
  });

  onMount(() => {
    // Set configuration
    window.reflectConfig = currentConfig;

    // Load script
    scriptElement = document.createElement('script');
    scriptElement.src = `https://cdn.reflectfeedback.com/widgets/${currentConfig.key}/widget.js`;
    scriptElement.async = true;
    document.body.appendChild(scriptElement);
  });

  onDestroy(() => {
    unsubscribe();
    if (scriptElement && document.body.contains(scriptElement)) {
      document.body.removeChild(scriptElement);
    }
  });
</script>
```

## Method 4: SvelteKit Integration

For SvelteKit, add the scripts to your root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte';

  onMount(() => {
    // Only load on client-side
    if (typeof window !== 'undefined') {
      window.reflectConfig = {
        key: "widget_eee5d255e1bc48d8",
        position: "bottom_right"
      };

      const script = document.createElement('script');
      script.src = "https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }
  });
</script>

<slot />
```

## TypeScript Support

Add type declarations:

```typescript
// src/app.d.ts or types/reflect.d.ts
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

declare global {
  interface Window {
    reflectConfig: ReflectConfig;
    Reflect: ReflectAPI;
  }
}
```

## Programmatic Control

Control the widget programmatically:

```svelte
<script>
  import { onMount } from 'svelte';

  let widgetLoaded = false;

  onMount(() => {
    window.reflectConfig = {
      key: "widget_eee5d255e1bc48d8",
      position: "bottom_right"
    };

    const script = document.createElement('script');
    script.src = "https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js";
    script.async = true;
    document.body.appendChild(script);

    // Listen for widget load
    window.addEventListener('reflectLoaded', () => {
      widgetLoaded = true;
    });
  });

  function showWidget() {
    if (widgetLoaded && window.Reflect) {
      window.Reflect.show();
    }
  }

  function hideWidget() {
    if (widgetLoaded && window.Reflect) {
      window.Reflect.hide();
    }
  }
</script>

<button on:click={showWidget}>Show Widget</button>
<button on:click={hideWidget}>Hide Widget</button>
```

## Next Steps

- [Widget Configuration](/docs/widgets/configuration/basic)
- [Widget Types](/docs/widgets/types/feedback)
