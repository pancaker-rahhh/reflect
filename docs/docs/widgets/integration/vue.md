---
sidebar_position: 3
---

# Vue Integration

Integrate Reflect feedback widget into your Vue 3 or Vue 2 application. The widget is hosted on a CDN and can be easily integrated with just a few lines of code.

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

That's it! The widget will now appear on all pages of your Vue application.

## Alternative Methods

### Vue 3 - Using onMounted in main.js

Load the widget globally in your main application file:

```javascript
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// Configure and load Reflect widget
window.reflectConfig = {
  key: "widget_eee5d255e1bc48d8",
  position: "bottom_right"
};

const script = document.createElement('script');
script.src = "https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js";
script.async = true;
document.body.appendChild(script);

app.mount('#app')
```

### Vue 3 - Using onMounted in App.vue

```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <h1>Welcome to Vue 3</h1>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
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
})
</script>
```

### Vue 2 - Using mounted in main.js

```javascript
// src/main.js
import Vue from 'vue'
import App from './App.vue'

// Configure and load Reflect widget
window.reflectConfig = {
  key: "widget_eee5d255e1bc48d8",
  position: "bottom_right"
};

const script = document.createElement('script');
script.src = "https://cdn.reflectfeedback.com/widgets/widget_eee5d255e1bc48d8/widget.js";
script.async = true;
document.body.appendChild(script);

new Vue({
  render: h => h(App),
}).$mount('#app')
```

### Vue 2 - Using mounted in App.vue

```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <h1>Welcome to Vue 2</h1>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
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
  }
}
</script>
```

## TypeScript Support

Add type declarations to avoid TypeScript errors:

```typescript
// src/types/reflect.d.ts
interface ReflectConfig {
  key: string;
  position?: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';
}

declare global {
  interface Window {
    reflectConfig: ReflectConfig;
    Reflect?: {
      show(): void;
      hide(): void;
    };
  }
}

export {}
```

## Configuration Options

The `reflectConfig` object supports the following options:

- **key** (required): Your widget key (e.g., `"widget_eee5d255e1bc48d8"`)
- **position** (optional): Widget position - `"bottom_right"`, `"bottom_left"`, `"top_right"`, or `"top_left"` (default: `"bottom_right"`)

## Next Steps

- [Widget Configuration](/docs/widgets/configuration/basic)
- [Widget Types](/docs/widgets/types/feedback)
